import admin from "firebase-admin";

// ─── Firebase Admin Initialization (safe) ────────────────────────────────────
let firestore = null;
let firebaseReady = false;

try {
  if (!admin.apps.length) {
    const rawSdk = process.env.FIREBASE_ADMIN_SDK;
    if (!rawSdk) {
      console.error("[WhatsApp Send] FIREBASE_ADMIN_SDK env var is missing — Firestore storage disabled");
    } else {
      const serviceAccount = JSON.parse(rawSdk);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firestore = admin.firestore();
      firebaseReady = true;
    }
  } else {
    firestore = admin.firestore();
    firebaseReady = true;
  }
} catch (initErr) {
  console.error("[WhatsApp Send] Firebase Admin init failed:", initErr.message);
}

// ─── WhatsApp Config ─────────────────────────────────────────────────────────
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GRAPH_API_URL = PHONE_NUMBER_ID
  ? `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`
  : null;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

// Approved templates — keep in sync with Meta Business Manager
const APPROVED_TEMPLATES = [
  "payment_received",
  "booking_payment_pending",
  "review_request",
  "booking_cancelled",
  "booking_confirmation",
  "bus_booking_received",
  "flight_booking_received",
  "career_application_received",
  "app_download_process",
  "visa_application_received",
  "ticket_booking_failed",
  "hello_world",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mask phone for safe logging — show only last 4 digits.
 */
function maskPhone(phone) {
  if (!phone || phone.length < 5) return "****";
  return "****" + phone.slice(-4);
}

/**
 * Normalise an Indian phone number to 91XXXXXXXXXX format.
 * Returns null if the number doesn't look valid.
 */
function normalisePhone(raw) {
  if (!raw) return null;
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
  if (!GRAPH_API_URL) {
    throw new Error("PHONE_NUMBER_ID env var is not configured — cannot call WhatsApp API");
  }
  if (!WHATSAPP_TOKEN) {
    throw new Error("WHATSAPP_TOKEN env var is not configured — cannot call WhatsApp API");
  }

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

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`WhatsApp API returned non-JSON response (${response.status})`);
      }

      if (!response.ok) {
        const errCode = data?.error?.code;
        const errMsg = data?.error?.message || JSON.stringify(data);
        // Retry on rate-limit (80007) or transient server errors (500+)
        const isRetryable = response.status >= 500 || errCode === 80007;
        lastError = new Error(
          `WhatsApp API error (${response.status}): ${errMsg}`
        );
        console.error(
          `[WhatsApp API] Attempt ${attempt + 1} failed — status=${response.status}, code=${errCode}, msg=${errMsg}`
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
      parameters: parameters.map((p) => ({
        type: "text",
        text: String(p ?? ""),
      })),
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

/**
 * Store message in Firestore. Non-critical — failures are logged but don't crash the request.
 */
async function storeMessage(conversationId, messageData) {
  if (!firebaseReady || !firestore) {
    console.warn("[WhatsApp Send] Firestore not available — skipping message storage");
    return null;
  }

  try {
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
  } catch (storeErr) {
    console.error("[WhatsApp Send] Firestore storeMessage failed (non-critical):", storeErr.message);
    return null;
  }
}

/**
 * Get or create a conversation in Firestore. Non-critical — failures are logged but don't crash the request.
 */
async function getOrCreateConversation(phone, customerName, bookingId, bookingType) {
  if (!firebaseReady || !firestore) {
    console.warn("[WhatsApp Send] Firestore not available — skipping conversation tracking");
    return null;
  }

  try {
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
  } catch (convoErr) {
    console.error("[WhatsApp Send] Firestore getOrCreateConversation failed (non-critical):", convoErr.message);
    return null;
  }
}

export default async function handler(req, res) {
  // ─── CORS ────────────────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ─── Safe body parsing ───────────────────────────────────────────────────
    const body = req.body || {};
    const { to, type, message, templateName, templateParams, languageCode, customerName, bookingId, bookingType } = body;

    // ─── Log incoming request (phone masked for privacy) ─────────────────────
    console.log("[WhatsApp Send] ──── INCOMING REQUEST ────");
    console.log(`[WhatsApp Send] Phone: ${maskPhone(to)}, Type: ${type}, Template: ${templateName || "N/A"}`);
    console.log(`[WhatsApp Send] Params: ${JSON.stringify(templateParams || [])}`);
    console.log(`[WhatsApp Send] CustomerName: ${customerName || "N/A"}, BookingId: ${bookingId || "N/A"}, BookingType: ${bookingType || "N/A"}`);

    // ─── Validate required fields ────────────────────────────────────────────
    if (!to) {
      console.error("[WhatsApp Send] 400: Missing 'to' phone number");
      return res.status(400).json({ error: "Missing 'to' phone number", success: false });
    }

    if (!type || !["text", "template"].includes(type)) {
      console.error(`[WhatsApp Send] 400: Invalid type="${type}"`);
      return res.status(400).json({ error: "Invalid 'type'. Must be 'text' or 'template'", success: false });
    }

    // ─── Normalise & validate phone number ───────────────────────────────────
    const fullPhone = normalisePhone(to);
    if (!fullPhone) {
      console.error("[WhatsApp Send] 400: Invalid phone number:", to);
      return res.status(400).json({
        error: "Invalid phone number. Must be a valid 10-digit Indian mobile number (starting with 6-9).",
        received: to,
        success: false,
      });
    }

    // ─── Validate template name if template type ─────────────────────────────
    if (type === "template") {
      if (!templateName) {
        console.error("[WhatsApp Send] 400: Missing templateName");
        return res.status(400).json({ error: "Missing 'templateName' for template type", success: false });
      }
      if (!APPROVED_TEMPLATES.includes(templateName)) {
        console.error(`[WhatsApp Send] 400: Unapproved template "${templateName}". Approved: ${APPROVED_TEMPLATES.join(", ")}`);
        return res.status(400).json({
          error: `Template "${templateName}" is not in the approved list. Approved templates: ${APPROVED_TEMPLATES.join(", ")}`,
          success: false,
        });
      }
    }

    if (type === "text" && !message) {
      console.error("[WhatsApp Send] 400: Missing message for text type");
      return res.status(400).json({ error: "Missing 'message' for text type", success: false });
    }

    // ─── Check env vars before calling API ───────────────────────────────────
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID || !GRAPH_API_URL) {
      console.error("[WhatsApp Send] 500: WhatsApp env vars not configured");
      return res.status(500).json({
        error: "WhatsApp API is not configured. Check WHATSAPP_TOKEN and PHONE_NUMBER_ID env vars.",
        success: false,
      });
    }

    // ─── Send message via WhatsApp Cloud API ─────────────────────────────────
    let apiResponse;
    let messageBody;

    if (type === "text") {
      apiResponse = await sendTextMessage(fullPhone, message);
      messageBody = message;
    } else {
      // Sanitize params — replace undefined/null with empty string
      const sanitizedParams = (templateParams || []).map((p) => String(p ?? ""));
      apiResponse = await sendTemplateMessage(fullPhone, templateName, languageCode, sanitizedParams);
      messageBody = `[Template: ${templateName}]`;
    }

    // ─── Determine send status ───────────────────────────────────────────────
    const whatsappMessageId = apiResponse?.messages?.[0]?.id || null;
    const messageStatus = apiResponse?.messages?.[0]?.message_status || null;
    let sendStatus = whatsappMessageId ? "sent" : "failed";

    // If Meta explicitly says failed, respect that
    if (messageStatus === "failed") {
      sendStatus = "failed";
      console.error("[WhatsApp Send] Meta reported message failed:", JSON.stringify(apiResponse));
    }

    console.log(`[WhatsApp Send] Result: Phone=${maskPhone(fullPhone)}, Status=${sendStatus}, WhatsAppMsgId=${whatsappMessageId}`);

    // ─── Store in Firestore (non-critical) ───────────────────────────────────
    let conversationId = null;
    let storedMsgId = null;

    conversationId = await getOrCreateConversation(fullPhone, customerName, bookingId, bookingType);

    if (conversationId) {
      storedMsgId = await storeMessage(conversationId, {
        from: PHONE_NUMBER_ID,
        to: fullPhone,
        type,
        body: messageBody,
        templateName: type === "template" ? templateName : null,
        templateParams: type === "template" ? (templateParams || []) : null,
        status: sendStatus,
        direction: "outbound",
        whatsappMessageId,
      });
    }

    return res.status(200).json({
      success: sendStatus === "sent",
      messageId: storedMsgId,
      whatsappMessageId,
      conversationId,
      status: sendStatus,
    });
  } catch (err) {
    // ─── Categorize error for proper HTTP status ─────────────────────────────
    const errMsg = err.message || "Unknown error";
    console.error("[WhatsApp Send] ──── ERROR ────");
    console.error("[WhatsApp Send] Message:", errMsg);
    console.error("[WhatsApp Send] Stack:", err.stack);

    // Meta API validation errors (bad template, bad number, etc.) → 422
    if (errMsg.includes("WhatsApp API error (400)") || errMsg.includes("WhatsApp API error (401)")) {
      return res.status(422).json({
        error: "WhatsApp API rejected the request",
        details: errMsg,
        success: false,
      });
    }

    return res.status(500).json({
      error: "Failed to send WhatsApp message",
      details: errMsg,
      success: false,
    });
  }
}
