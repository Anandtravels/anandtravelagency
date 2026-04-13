import admin from "firebase-admin";

// Initialize Firebase Admin once (reused across invocations)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();
const messaging = admin.messaging();

// Send notification to all tokens matching a role (and optionally email)
async function sendNotification(role, title, body, data = {}, email = null) {
  let query = firestore.collection("fcm_tokens").where("role", "==", role);
  if (email) {
    query = query.where("email", "==", email.toLowerCase());
  }

  const tokensSnap = await query.get();
  if (tokensSnap.empty) return { sent: 0, total: 0 };

  const invalidTokenIds = [];
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
  }

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return { sent, total: tokensSnap.size };
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, payload } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Missing 'type' field" });
    }

    let title, body, data, role, email;

    switch (type) {
      case "new_booking": {
        const p = payload || {};
        const name = p.name || "Customer";
        const from = p.from || "";
        const to = p.to || "";
        const journeyDate = p.journeyDate || "";
        const bookingType = p.bookingType || "General";
        title = "🚆 New Booking Request";
        body = `${name} booked ${bookingType} from ${from} to ${to} on ${journeyDate}`;
        data = { type: "new_booking", bookingId: p.bookingId || "" };
        role = "admin";
        break;
      }
      case "new_package_booking": {
        const p = payload || {};
        title = "📦 New Package Booking";
        body = `${p.name || "Customer"} booked ${p.packageName || "Package"}`;
        data = { type: "new_package_booking", bookingId: p.bookingId || "" };
        role = "admin";
        break;
      }
      case "new_hotel_booking": {
        const p = payload || {};
        title = "🏨 New Hotel Booking";
        body = `${p.guestName || "Guest"} booked ${p.hotelName || "Hotel"} (Check-in: ${p.checkInDate || ""})`;
        data = { type: "new_hotel_booking", bookingId: p.bookingId || "" };
        role = "admin";
        break;
      }
      case "new_contact_message": {
        const p = payload || {};
        title = "💬 New Contact Message";
        body = `${p.name || "Someone"}: ${p.subject || p.message?.substring(0, 50) || "New message"}`;
        data = { type: "new_contact_message", messageId: p.messageId || "" };
        role = "admin";
        break;
      }
      case "new_eservice_request": {
        const p = payload || {};
        title = "📋 New E-Service Request";
        body = `${p.name || "Customer"} requested ${p.serviceType || "E-Service"}`;
        data = { type: "new_eservice_request", requestId: p.requestId || "" };
        role = "admin";
        break;
      }
      case "new_visa_application": {
        const p = payload || {};
        title = "🌍 New Visa Application";
        body = `${p.name || "Applicant"} applied for ${p.country || "Visa"} visa`;
        data = { type: "new_visa_application", applicationId: p.applicationId || "" };
        role = "admin";
        break;
      }
      case "new_agent_task": {
        const p = payload || {};
        if (!p.agentEmail) {
          return res.status(400).json({ error: "Missing agentEmail for agent task notification" });
        }
        title = "📌 New Task Assigned";
        body = `You have a new task: ${p.title || "New Task"}`;
        data = { type: "new_agent_task", taskId: p.taskId || "" };
        role = "agent";
        email = p.agentEmail;
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown notification type: ${type}` });
    }

    const result = await sendNotification(role, title, body, data, email);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("Notification error:", err);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}
