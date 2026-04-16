import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { WhatsAppMessage, WhatsAppConversation } from '@/types/whatsapp';

const API_BASE = '/api';

export const whatsappService = {
  /** Send a free-text message via Business API */
  async sendMessage(
    to: string,
    message: string,
    customerName?: string,
    bookingId?: string,
    bookingType?: string
  ) {
    const res = await fetch(`${API_BASE}/whatsapp-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        type: 'text',
        message,
        customerName,
        bookingId,
        bookingType,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  /** Send a template message via Business API */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    templateParams: string[],
    languageCode: string = 'en',
    customerName?: string,
    bookingId?: string,
    bookingType?: string
  ) {
    const res = await fetch(`${API_BASE}/whatsapp-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        type: 'template',
        templateName,
        templateParams,
        languageCode,
        customerName,
        bookingId,
        bookingType,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send template');
    }
    return res.json();
  },

  /** Subscribe to conversations list (real-time) */
  subscribeConversations(callback: (convos: WhatsAppConversation[]) => void) {
    const q = query(
      collection(db, 'whatsapp_conversations'),
      orderBy('lastMessageTime', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WhatsAppConversation[];
      callback(convos);
    });
  },

  /** Subscribe to messages for a single conversation (real-time) */
  subscribeMessages(conversationId: string, callback: (msgs: WhatsAppMessage[]) => void) {
    const q = query(
      collection(db, 'whatsapp_messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WhatsAppMessage[];
      callback(msgs);
    });
  },

  /** Mark conversation as read (reset unread count) */
  async markAsRead(conversationId: string) {
    await updateDoc(doc(db, 'whatsapp_conversations', conversationId), {
      unreadCount: 0,
      updated_at: serverTimestamp(),
    });
  },

  /** Start a new conversation — also stores the first outbound message via API */
  async startNewConversation(
    phone: string,
    customerName: string,
    initialMessage: string
  ) {
    return this.sendMessage(phone, initialMessage, customerName);
  },

  /** Get total unread count across all conversations */
  subscribeTotalUnread(callback: (count: number) => void) {
    const q = query(collection(db, 'whatsapp_conversations'));
    return onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((doc) => {
        total += doc.data().unreadCount || 0;
      });
      callback(total);
    });
  },

  /** Check if conversation is within 24h customer-initiated window */
  isWithin24hWindow(conversation: WhatsAppConversation): boolean {
    if (!conversation.lastCustomerMessageTime) return false;
    const lastMsg = conversation.lastCustomerMessageTime?.toDate
      ? conversation.lastCustomerMessageTime.toDate()
      : new Date(conversation.lastCustomerMessageTime);
    const diff = Date.now() - lastMsg.getTime();
    return diff < 24 * 60 * 60 * 1000;
  },

  /** Build a status-change WhatsApp message for a booking */
  buildStatusChangeMessage(
    status: string,
    booking: {
      name?: string;
      id?: string;
      from?: string;
      to?: string;
      journey_date?: string;
      passengers?: any;
      booking_type?: string;
    }
  ): string | null {
    const name = booking.name || 'Customer';
    const bookingId = booking.id ? booking.id.slice(-6).toUpperCase() : 'N/A';
    const route = booking.from && booking.to ? `${booking.from} → ${booking.to}` : 'N/A';
    const date = booking.journey_date || 'N/A';
    const passengerCount = Array.isArray(booking.passengers)
      ? booking.passengers.length
      : booking.passengers || 1;

    switch (status) {
      case 'completed': // Payment Done
        return `Dear *${name}*,

✅ *Payment Received!*

Your payment for the booking has been received successfully. Thank you!

📋 *Booking Details:*
• Booking ID: #${bookingId}
• Route: ${route}
• Date: ${date}
• Passengers: ${passengerCount}

Your ticket will be processed shortly.

Thank you for choosing *Anand Travels!*
For any queries, feel free to contact us.`;

      case 'in_process': // In Process — Payment Pending
        return `Dear *${name}*,

🔄 *Your Booking is Being Processed*

Your booking request is now being processed.

📋 *Booking Details:*
• Booking ID: #${bookingId}
• Route: ${route}
• Date: ${date}
• Passengers: ${passengerCount}

⚠️ *Payment Status: Pending*
Please complete the payment to confirm your booking.

💳 *Payment Information:*
PhonePe/UPI: 8985816481 or 9676138010
Account Holder: Pinisetty Naga Satya Surya Shiva Anand

Thank you for choosing *Anand Travels!*`;

      case 'booked': // Booked — Review Request
        return `Dear *${name}*,

🎫 *Booking Confirmed!*

Great news! Your booking has been successfully confirmed.

📋 *Booking Details:*
• Booking ID: #${bookingId}
• Route: ${route}
• Date: ${date}
• Passengers: ${passengerCount}

We hope you have a wonderful journey! ⭐ We'd love to hear your feedback — please share your experience with us.

Thank you for choosing *Anand Travels!*`;

      case 'hold': // Hold — Booking On Hold / Cancelled
        return `Dear *${name}*,

⏸️ *Booking On Hold*

Your booking has been put on hold.

📋 *Booking Details:*
• Booking ID: #${bookingId}
• Route: ${route}
• Date: ${date}
• Passengers: ${passengerCount}

Please contact us for more information or to reschedule.
📞 Contact: +919490033809

Thank you for choosing *Anand Travels!*`;

      default:
        return null;
    }
  },

  /** Send an automatic status-change WhatsApp message (fire-and-forget) */
  async sendStatusChangeMessage(
    status: string,
    booking: {
      id?: string;
      name?: string;
      phone?: string;
      from?: string;
      to?: string;
      journey_date?: string;
      passengers?: any;
      booking_type?: string;
    }
  ): Promise<boolean> {
    try {
      if (!booking.phone) {
        console.warn('[WhatsApp Auto] No phone number for booking', booking.id);
        return false;
      }

      const message = this.buildStatusChangeMessage(status, booking);
      if (!message) {
        return false; // Status not mapped to a message
      }

      await this.sendMessage(
        booking.phone,
        message,
        booking.name,
        booking.id,
        booking.booking_type
      );
      console.log(`[WhatsApp Auto] Sent ${status} message for booking ${booking.id}`);
      return true;
    } catch (error) {
      console.error(`[WhatsApp Auto] Failed to send ${status} message for booking ${booking.id}:`, error);
      return false;
    }
  },
};
