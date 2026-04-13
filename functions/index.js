const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin with service account from env var
// The FIREBASE_ADMIN_SDK env var contains the entire service account JSON as a string
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
initializeApp({
  credential: cert(serviceAccount),
});

const firestore = getFirestore();
const messaging = getMessaging();

// ─── Helper: Send notification to all admin FCM tokens ───
async function sendToAdmins(title, body, data = {}) {
  try {
    const tokensSnap = await firestore
      .collection("fcm_tokens")
      .where("role", "==", "admin")
      .get();

    if (tokensSnap.empty) {
      logger.info("No admin FCM tokens found");
      return;
    }

    const tokens = tokensSnap.docs.map((doc) => doc.data().token);
    const invalidTokenIds = [];

    // Send to each token individually to handle failures per-token
    const results = await Promise.allSettled(
      tokensSnap.docs.map(async (tokenDoc) => {
        const token = tokenDoc.data().token;
        try {
          await messaging.send({
            token,
            notification: { title, body },
            data: { ...data, type: data.type || "default" },
            webpush: {
              headers: { Urgency: "high" },
              notification: {
                title,
                body,
                icon: "/logo.png",
                badge: "/logo.png",
                requireInteraction: true,
              },
            },
          });
        } catch (err) {
          // Remove invalid/expired tokens
          if (
            err.code === "messaging/registration-token-not-registered" ||
            err.code === "messaging/invalid-registration-token"
          ) {
            invalidTokenIds.push(tokenDoc.id);
          }
          throw err;
        }
      })
    );

    // Cleanup invalid tokens
    for (const id of invalidTokenIds) {
      await firestore.collection("fcm_tokens").doc(id).delete();
      logger.info(`Removed invalid FCM token: ${id}`);
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    logger.info(`Admin notification sent to ${sent}/${tokens.length} devices: ${title}`);
  } catch (err) {
    logger.error("Failed to send admin notification:", err);
  }
}

// ─── Helper: Send notification to a specific agent by email ───
async function sendToAgent(agentEmail, title, body, data = {}) {
  try {
    const tokensSnap = await firestore
      .collection("fcm_tokens")
      .where("role", "==", "agent")
      .where("email", "==", agentEmail.toLowerCase())
      .get();

    if (tokensSnap.empty) {
      logger.info(`No FCM token found for agent: ${agentEmail}`);
      return;
    }

    const invalidTokenIds = [];

    const results = await Promise.allSettled(
      tokensSnap.docs.map(async (tokenDoc) => {
        const token = tokenDoc.data().token;
        try {
          await messaging.send({
            token,
            notification: { title, body },
            data: { ...data, type: data.type || "new_agent_task" },
            webpush: {
              headers: { Urgency: "high" },
              notification: {
                title,
                body,
                icon: "/logo.png",
                badge: "/logo.png",
                requireInteraction: true,
              },
            },
          });
        } catch (err) {
          if (
            err.code === "messaging/registration-token-not-registered" ||
            err.code === "messaging/invalid-registration-token"
          ) {
            invalidTokenIds.push(tokenDoc.id);
          }
          throw err;
        }
      })
    );

    for (const id of invalidTokenIds) {
      await firestore.collection("fcm_tokens").doc(id).delete();
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    logger.info(`Agent notification sent to ${sent} devices for ${agentEmail}: ${title}`);
  } catch (err) {
    logger.error(`Failed to send agent notification to ${agentEmail}:`, err);
  }
}

// ═══════════════════════════════════════════════════════════
// ADMIN NOTIFICATIONS - Triggered when new documents are created
// ═══════════════════════════════════════════════════════════

// 1. New Train/Flight/Bus Booking
exports.onNewBooking = onDocumentCreated("bookings/{bookingId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const name = data.name || data.passengerName || "Customer";
  const from = data.from || "";
  const to = data.to || "";
  const journeyDate = data.journeyDate || "";
  const bookingType = data.bookingType || "General";

  await sendToAdmins(
    "🚆 New Booking Request",
    `${name} booked ${bookingType} from ${from} to ${to} on ${journeyDate}`,
    { type: "new_booking", bookingId: event.params.bookingId }
  );
});

// 2. New Package Booking
exports.onNewPackageBooking = onDocumentCreated("package_bookings/{bookingId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const name = data.name || data.customerName || "Customer";
  const packageName = data.packageName || data.packageTitle || "Package";

  await sendToAdmins(
    "📦 New Package Booking",
    `${name} booked ${packageName}`,
    { type: "new_package_booking", bookingId: event.params.bookingId }
  );
});

// 3. New Hotel Booking
exports.onNewHotelBooking = onDocumentCreated("hotel_bookings/{bookingId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const name = data.guestName || data.name || "Guest";
  const hotel = data.hotelName || "Hotel";
  const checkIn = data.checkInDate || "";

  await sendToAdmins(
    "🏨 New Hotel Booking",
    `${name} booked ${hotel} (Check-in: ${checkIn})`,
    { type: "new_hotel_booking", bookingId: event.params.bookingId }
  );
});

// 4. New Contact Message
exports.onNewContactMessage = onDocumentCreated("contact_messages/{messageId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const name = data.name || "Someone";
  const subject = data.subject || data.message?.substring(0, 50) || "New message";

  await sendToAdmins(
    "💬 New Contact Message",
    `${name}: ${subject}`,
    { type: "new_contact_message", messageId: event.params.messageId }
  );
});

// 5. New E-Service Request
exports.onNewEServiceRequest = onDocumentCreated("eservice_requests/{requestId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const name = data.name || data.customerName || "Customer";
  const service = data.serviceType || data.service || "E-Service";

  await sendToAdmins(
    "📋 New E-Service Request",
    `${name} requested ${service}`,
    { type: "new_eservice_request", requestId: event.params.requestId }
  );
});

// 6. New Visa Application
exports.onNewVisaApplication = onDocumentCreated("visa-services/{applicationId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const name = data.name || data.applicantName || "Applicant";
  const country = data.country || data.destination || "Visa";

  await sendToAdmins(
    "🌍 New Visa Application",
    `${name} applied for ${country} visa`,
    { type: "new_visa_application", applicationId: event.params.applicationId }
  );
});

// ═══════════════════════════════════════════════════════════
// AGENT NOTIFICATIONS - Triggered when admin assigns tasks
// ═══════════════════════════════════════════════════════════

// 7. New Agent Task Assignment
exports.onNewAgentTask = onDocumentCreated("agent_tasks/{taskId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const agentEmail = data.assignedTo;
  if (!agentEmail) {
    logger.warn("Agent task created without assignedTo email");
    return;
  }

  const taskTitle = data.title || data.taskType || "New Task";
  const agentName = data.assignedAgentName || "Agent";

  // Notify the assigned agent
  await sendToAgent(
    agentEmail,
    "📌 New Task Assigned",
    `You have a new task: ${taskTitle}`,
    { type: "new_agent_task", taskId: event.params.taskId }
  );

  logger.info(`Task notification sent to agent ${agentName} (${agentEmail})`);
});
