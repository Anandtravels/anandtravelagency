import admin from "firebase-admin";

// Initialize Firebase Admin once (reused across invocations)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_URL = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalise an Indian phone number to 91XXXXXXXXXX format.
 * Returns null if the number doesn't look valid.
 */
function normalisePhone(raw) {
  // Strip everything except digits
  let digits = String(raw).replace(/\D/g, "");
  // Remove leading zeros
  digits = digits.replace(/^0+/, "");
  // If the number has country code prefix, strip it first
  if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // Indian mobile numbers: exactly 10 digits starting with 6-9
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
    return null;
  }
  return `91${digits}`;
}

/**
 * Call the Meta WhatsApp Cloud API with automatic retry on transient failures.
 */
async function callWhatsAppAPI(payload) {
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(GRAPH_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errCode = data?.error?.code;
        // Retry on rate-limit (80007) or transient server errors (500+)
        const isRetryable = response.status >= 500 || errCode === 80007;
        lastError = new Error(
          `WhatsApp API error (${response.status}): ${JSON.stringify(data)}`
        );
        console.error(
          `[WhatsApp API] Attempt ${attempt + 1} failed:`,
          lastError.message
        );

        if (isRetryable && attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
          continue;
        }
        throw lastError;
      }

      // Verify the response actually contains a message ID
      const messageId = data?.messages?.[0]?.id;
      if (!messageId) {
        throw new Error(
          `WhatsApp API returned success but no message ID: ${JSON.stringify(data)}`
        );
      }

      console.log(
        `[WhatsApp API] Message sent successfully (attempt ${attempt + 1}):`,
        messageId
      );
      return data;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES && !err.message?.includes("WhatsApp API error")) {
        // Network / fetch error — retryable
        console.warn(
          `[WhatsApp API] Attempt ${attempt + 1} network error, retrying:`,
          err.message
        );
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function sendTextMessage(to, text) {
  return callWhatsAppAPI({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: text },
  });
}

async function sendTemplateMessage(to, templateName, languageCode, parameters) {
  const components = [];
  if (parameters && parameters.length > 0) {
    components.push({
      type: "body",
      parameters: parameters.map((p) => ({ type: "text", text: String(p) })),
    });
  }

  return callWhatsAppAPI({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode || "en" },
      components,
    },
  });
}

async function storeMessage(conversationId, messageData) {
  const msgRef = await firestore.collection("whatsapp_messages").add({
    conversationId,
    ...messageData,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update conversation
  await firestore
    .collection("whatsapp_conversations")
    .doc(conversationId)
    .update({
      lastMessage: messageData.body || `[${messageData.type}]`,
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

  return msgRef.id;
}

async function getOrCreateConversation(phone, customerName, bookingId, bookingType) {
  // Look up existing conversation by phone
  const existing = await firestore
    .collection("whatsapp_conversations")
    .where("customerPhone", "==", phone)
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    // Update name/booking if provided
    const updates = { updated_at: admin.firestore.FieldValue.serverTimestamp() };
    if (customerName) updates.customerName = customerName;
    if (bookingId) updates.bookingId = bookingId;
    if (bookingType) updates.bookingType = bookingType;
    await doc.ref.update(updates);
    return doc.id;
  }

  // Create new conversation
  const newConvo = await firestore.collection("whatsapp_conversations").add({
    customerPhone: phone,
    customerName: customerName || phone,
    lastMessage: "",
    lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
    unreadCount: 0,
    bookingId: bookingId || null,
    bookingType: bookingType || null,
    status: "active",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return newConvo.id;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, type, message, templateName, templateParams, languageCode, customerName, bookingId, bookingType } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Missing 'to' phone number" });
    }

    if (!type || !["text", "template"].includes(type)) {
      return res.status(400).json({ error: "Invalid 'type'. Must be 'text' or 'template'" });
    }

    // Normalise & validate phone number
    const fullPhone = normalisePhone(to);
    if (!fullPhone) {
      console.error("[WhatsApp Send] Invalid phone number:", to);
      return res.status(400).json({
        error: "Invalid phone number. Must be a valid 10-digit Indian mobile number.",
        received: to,
      });
    }

    let apiResponse;
    let messageBody;
    let sendStatus = "failed"; // default to failed, only set to sent on confirmed success

    if (type === "text") {
      if (!message) {
        return res.status(400).json({ error: "Missing 'message' for text type" });
      }
      apiResponse = await sendTextMessage(fullPhone, message);
      messageBody = message;
    } else {
      if (!templateName) {
        return res.status(400).json({ error: "Missing 'templateName' for template type" });
      }
      apiResponse = await sendTemplateMessage(fullPhone, templateName, languageCode, templateParams || []);
      messageBody = `[Template: ${templateName}]`;
    }

    // Only mark as "sent" if we got a confirmed message ID from the API
    const whatsappMessageId = apiResponse?.messages?.[0]?.id || null;
    const messageStatus = apiResponse?.messages?.[0]?.message_status || null;

    if (whatsappMessageId) {
      sendStatus = "sent";
    }

    // If Meta explicitly says failed, respect that
    if (messageStatus === "failed") {
      sendStatus = "failed";
      console.error("[WhatsApp Send] Meta reported message failed:", apiResponse);
    }

    console.log(`[WhatsApp Send] Phone: ${fullPhone}, Status: ${sendStatus}, MessageId: ${whatsappMessageId}`);

    // Store in Firestore
    const conversationId = await getOrCreateConversation(fullPhone, customerName, bookingId, bookingType);

    const storedMsgId = await storeMessage(conversationId, {
      from: PHONE_NUMBER_ID,
      to: fullPhone,
      type,
      body: messageBody,
      templateName: type === "template" ? templateName : null,
      templateParams: type === "template" ? templateParams : null,
      status: sendStatus,
      direction: "outbound",
      whatsappMessageId,
    });

    return res.status(200).json({
      success: sendStatus === "sent",
      messageId: storedMsgId,
      whatsappMessageId,
      conversationId,
      status: sendStatus,
    });
  } catch (err) {
    console.error("[WhatsApp Send] Error:", err.message, err.stack);
    return res.status(500).json({
      error: "Failed to send WhatsApp message",
      details: err.message,
      success: false,
    });
  }
}
