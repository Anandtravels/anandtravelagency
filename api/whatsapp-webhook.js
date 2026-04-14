import admin from "firebase-admin";

// Initialize Firebase Admin once (reused across invocations)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

async function handleIncomingMessage(message, contact) {
  const from = message.from; // customer phone
  const customerName = contact?.profile?.name || from;
  const msgType = message.type || "text";
  const body =
    msgType === "text"
      ? message.text?.body || ""
      : `[${msgType}]`;

  // Find or create conversation
  const existing = await firestore
    .collection("whatsapp_conversations")
    .where("customerPhone", "==", from)
    .limit(1)
    .get();

  let conversationId;

  if (!existing.empty) {
    const convoDoc = existing.docs[0];
    conversationId = convoDoc.id;
    await convoDoc.ref.update({
      customerName,
      lastMessage: body,
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      lastCustomerMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      unreadCount: admin.firestore.FieldValue.increment(1),
      status: "active",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    const newConvo = await firestore.collection("whatsapp_conversations").add({
      customerPhone: from,
      customerName,
      lastMessage: body,
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      lastCustomerMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      unreadCount: 1,
      bookingId: null,
      bookingType: null,
      status: "active",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    conversationId = newConvo.id;
  }

  // Store the message
  await firestore.collection("whatsapp_messages").add({
    conversationId,
    from,
    to: PHONE_NUMBER_ID,
    type: msgType,
    body,
    status: "delivered",
    direction: "inbound",
    whatsappMessageId: message.id || null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleStatusUpdate(status) {
  const waMessageId = status.id;
  const newStatus = status.status; // sent, delivered, read, failed

  if (!waMessageId || !newStatus) return;

  // Find message by whatsappMessageId
  const msgQuery = await firestore
    .collection("whatsapp_messages")
    .where("whatsappMessageId", "==", waMessageId)
    .limit(1)
    .get();

  if (!msgQuery.empty) {
    await msgQuery.docs[0].ref.update({ status: newStatus });
  }
}

export default async function handler(req, res) {
  // GET: Webhook verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return res.status(200).send(challenge);
    }

    return res.status(403).json({ error: "Verification failed" });
  }

  // POST: Incoming messages & status updates
  if (req.method === "POST") {
    try {
      const body = req.body;

      // WhatsApp sends data under entry[].changes[].value
      const entries = body?.entry || [];

      for (const entry of entries) {
        const changes = entry?.changes || [];

        for (const change of changes) {
          const value = change?.value;
          if (!value) continue;

          // Handle incoming messages
          const messages = value.messages || [];
          const contacts = value.contacts || [];

          for (let i = 0; i < messages.length; i++) {
            const contact = contacts[i] || contacts[0] || null;
            await handleIncomingMessage(messages[i], contact);
          }

          // Handle status updates (sent, delivered, read)
          const statuses = value.statuses || [];
          for (const status of statuses) {
            await handleStatusUpdate(status);
          }
        }
      }

      // Always respond 200 to acknowledge receipt
      return res.status(200).json({ status: "ok" });
    } catch (err) {
      console.error("Webhook processing error:", err);
      // Still return 200 to prevent Meta from retrying
      return res.status(200).json({ status: "error", message: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
