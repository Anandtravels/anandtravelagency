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

async function sendTextMessage(to, text) {
  const response = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function sendTemplateMessage(to, templateName, languageCode, parameters) {
  const components = [];
  if (parameters && parameters.length > 0) {
    components.push({
      type: "body",
      parameters: parameters.map((p) => ({ type: "text", text: String(p) })),
    });
  }

  const response = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode || "en" },
        components,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
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

    // Normalize phone: ensure it starts with country code
    const phone = to.replace(/\D/g, "").replace(/^0+/, "");
    const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;

    let apiResponse;
    let messageBody;

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

    const whatsappMessageId = apiResponse?.messages?.[0]?.id || null;

    // Store in Firestore
    const conversationId = await getOrCreateConversation(fullPhone, customerName, bookingId, bookingType);

    const storedMsgId = await storeMessage(conversationId, {
      from: PHONE_NUMBER_ID,
      to: fullPhone,
      type,
      body: messageBody,
      templateName: type === "template" ? templateName : null,
      templateParams: type === "template" ? templateParams : null,
      status: whatsappMessageId ? "sent" : "failed",
      direction: "outbound",
      whatsappMessageId,
    });

    return res.status(200).json({
      success: true,
      messageId: storedMsgId,
      whatsappMessageId,
      conversationId,
    });
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return res.status(500).json({ error: "Failed to send WhatsApp message", details: err.message });
  }
}
