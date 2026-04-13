const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

// Helper: Get FCM tokens by role
async function getTokensByRole(role) {
  const snapshot = await db.collection("fcm_tokens").where("role", "==", role).get();
  const tokens = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.token) tokens.push(data.token);
  });
  return tokens;
}

// Helper: Get FCM token by email
async function getTokenByEmail(email) {
  const doc = await db.collection("fcm_tokens").doc(email).get();
  if (doc.exists && doc.data()?.token) {
    return doc.data().token;
  }
  return null;
}

// Helper: Send notification to multiple tokens
async function sendToTokens(tokens, title, body, data = {}) {
  if (!tokens.length) {
    logger.info("No tokens to send to");
    return;
  }

  const message = {
    notification: { title, body },
    data: { ...data, timestamp: Date.now().toString() },
    webpush: {
      notification: {
        icon: "/logo.png",
        badge: "/logo.png",
        vibrate: [200, 100, 200],
        requireInteraction: true,
      },
      fcmOptions: {
        link: data.link || "/",
      },
    },
  };

  // Send to each token individually to handle invalid tokens
  const results = await Promise.allSettled(
    tokens.map((token) =>
      messaging.send({ ...message, token }).catch(async (error) => {
        // Remove invalid tokens
        if (
          error.code === "messaging/registration-token-not-registered" ||
          error.code === "messaging/invalid-registration-token"
        ) {
          logger.info("Removing invalid token:", token.substring(0, 20));
          const snapshot = await db
            .collection("fcm_tokens")
            .where("token", "==", token)
            .get();
          snapshot.forEach((doc) => doc.ref.delete());
        }
        throw error;
      })
    )
  );

  const success = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  logger.info(`Notifications sent: ${success} success, ${failed} failed`);
}

// =============================================
// 1. NEW BOOKING → Notify Admin
// =============================================
exports.onNewBooking = onDocumentCreated("bookings/{bookingId}", async (event) => {
  const booking = event.data?.data();
  if (!booking) return;

  logger.info("New booking created:", event.params.bookingId);

  const adminTokens = await getTokensByRole("admin");
  const bookingType = booking.booking_type
    ? booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1)
    : "General";

  await sendToTokens(
    adminTokens,
    `New ${bookingType} Booking Request`,
    `${booking.name} - ${booking.from || ""} to ${booking.to || ""} on ${booking.journey_date || "N/A"}`,
    { type: "new_booking", bookingId: event.params.bookingId, link: "/admin" }
  );
});

// =============================================
// 2. NEW PACKAGE BOOKING → Notify Admin
// =============================================
exports.onNewPackageBooking = onDocumentCreated("package_bookings/{bookingId}", async (event) => {
  const booking = event.data?.data();
  if (!booking) return;

  logger.info("New package booking:", event.params.bookingId);

  const adminTokens = await getTokensByRole("admin");

  await sendToTokens(
    adminTokens,
    "New Package Booking",
    `${booking.name || "Customer"} - ${booking.package_name || booking.destination || "Package"}`,
    { type: "new_package_booking", bookingId: event.params.bookingId, link: "/admin" }
  );
});

// =============================================
// 3. NEW HOTEL BOOKING → Notify Admin
// =============================================
exports.onNewHotelBooking = onDocumentCreated("hotel_bookings/{bookingId}", async (event) => {
  const booking = event.data?.data();
  if (!booking) return;

  logger.info("New hotel booking:", event.params.bookingId);

  const adminTokens = await getTokensByRole("admin");

  await sendToTokens(
    adminTokens,
    "New Hotel Booking",
    `${booking.guestName || booking.name || "Guest"} - ${booking.hotelName || "Hotel"}`,
    { type: "new_hotel_booking", bookingId: event.params.bookingId, link: "/admin" }
  );
});

// =============================================
// 4. NEW VISA APPLICATION → Notify Admin
// =============================================
exports.onNewVisaApplication = onDocumentCreated("visa_applications/{appId}", async (event) => {
  const application = event.data?.data();
  if (!application) return;

  logger.info("New visa application:", event.params.appId);

  const adminTokens = await getTokensByRole("admin");

  await sendToTokens(
    adminTokens,
    "New Visa Application",
    `${application.name || "Applicant"} - ${application.destination_country || "Visa"}`,
    { type: "new_visa_application", appId: event.params.appId, link: "/admin" }
  );
});

// =============================================
// 5. NEW E-SERVICE APPLICATION → Notify Admin
// =============================================
exports.onNewEService = onDocumentCreated("eservice_applications/{appId}", async (event) => {
  const application = event.data?.data();
  if (!application) return;

  logger.info("New e-service application:", event.params.appId);

  const adminTokens = await getTokensByRole("admin");

  await sendToTokens(
    adminTokens,
    "New E-Service Application",
    `${application.name || "Applicant"} - ${application.service_type || "E-Service"}`,
    { type: "new_eservice", appId: event.params.appId, link: "/admin" }
  );
});

// =============================================
// 6. NEW CONTACT MESSAGE → Notify Admin
// =============================================
exports.onNewMessage = onDocumentCreated("messages/{messageId}", async (event) => {
  const message = event.data?.data();
  if (!message) return;

  logger.info("New message:", event.params.messageId);

  const adminTokens = await getTokensByRole("admin");

  await sendToTokens(
    adminTokens,
    "New Contact Message",
    `${message.name || "Someone"}: ${(message.message || "").substring(0, 80)}`,
    { type: "new_message", messageId: event.params.messageId, link: "/admin" }
  );
});

// =============================================
// 7. BOOKING ASSIGNED TO AGENT → Notify Agent
// =============================================
exports.onBookingAssigned = onDocumentUpdated("bookings/{bookingId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;

  // Check if assignedAgent was just set or changed
  const previousAgent = before.assignedAgent || null;
  const newAgent = after.assignedAgent || null;

  if (!newAgent || newAgent === previousAgent) return;

  logger.info(`Booking ${event.params.bookingId} assigned to agent: ${newAgent}`);

  const agentToken = await getTokenByEmail(newAgent);
  if (!agentToken) {
    logger.info(`No FCM token for agent: ${newAgent}`);
    return;
  }

  const bookingType = after.booking_type
    ? after.booking_type.charAt(0).toUpperCase() + after.booking_type.slice(1)
    : "General";

  await sendToTokens(
    [agentToken],
    `New ${bookingType} Booking Assigned`,
    `${after.name} - ${after.from || ""} to ${after.to || ""} on ${after.journey_date || "N/A"}`,
    { type: "booking_assigned", bookingId: event.params.bookingId, link: "/agent-dashboard" }
  );
});

// =============================================
// 8. PACKAGE BOOKING ASSIGNED TO AGENT → Notify Agent
// =============================================
exports.onPackageBookingAssigned = onDocumentUpdated("package_bookings/{bookingId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;

  const previousAgent = before.assignedAgent || null;
  const newAgent = after.assignedAgent || null;

  if (!newAgent || newAgent === previousAgent) return;

  logger.info(`Package booking ${event.params.bookingId} assigned to agent: ${newAgent}`);

  const agentToken = await getTokenByEmail(newAgent);
  if (!agentToken) {
    logger.info(`No FCM token for agent: ${newAgent}`);
    return;
  }

  await sendToTokens(
    [agentToken],
    "New Package Booking Assigned",
    `${after.name || "Customer"} - ${after.package_name || after.destination || "Package"}`,
    { type: "booking_assigned", bookingId: event.params.bookingId, link: "/agent-dashboard" }
  );
});
