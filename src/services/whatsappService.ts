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
  /** Send a free-text message via Business API (with retry) */
  async sendMessage(
    to: string,
    message: string,
    customerName?: string,
    bookingId?: string,
    bookingType?: string
  ) {
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
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

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errorDetail = data.details ? `${data.error} — ${data.details}` : (data.error || `API returned ${res.status}`);
          lastError = new Error(errorDetail);
          console.warn(`[WhatsApp Service] sendMessage attempt ${attempt + 1} failed (${res.status}):`, errorDetail);
          // Only retry on server errors (500+), NOT on 4xx (validation/auth errors)
          if (res.status >= 500 && attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
            continue;
          }
          throw lastError;
        }

        // Verify the backend confirmed actual delivery
        if (data.success === false) {
          const errorDetail = data.details ? `${data.error} — ${data.details}` : (data.error || 'API returned success=false');
          lastError = new Error(errorDetail);
          console.warn(`[WhatsApp Service] sendMessage attempt ${attempt + 1}: success=false`, errorDetail);
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
            continue;
          }
          throw lastError;
        }

        return data;
      } catch (err: any) {
        lastError = err;
        // Only retry on genuine network errors, not on API rejections (4xx)
        const isApiRejection = err.message?.includes('API returned') || err.message?.includes('WhatsApp API');
        if (attempt < MAX_RETRIES && !isApiRejection) {
          console.warn(`[WhatsApp Service] sendMessage attempt ${attempt + 1} network error:`, err.message);
          await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  },

  /** Send a template message via Business API (with retry) */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    templateParams: string[],
    languageCode: string = 'en',
    customerName?: string,
    bookingId?: string,
    bookingType?: string
  ) {
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
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

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errorDetail = data.details ? `${data.error} — ${data.details}` : (data.error || `API returned ${res.status}`);
          lastError = new Error(errorDetail);
          console.warn(`[WhatsApp Service] sendTemplate attempt ${attempt + 1} failed (${res.status}):`, errorDetail);
          // Only retry on server errors (500+), NOT on 4xx (validation/auth errors)
          if (res.status >= 500 && attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
            continue;
          }
          throw lastError;
        }

        if (data.success === false) {
          const errorDetail = data.details ? `${data.error} — ${data.details}` : (data.error || 'API returned success=false');
          lastError = new Error(errorDetail);
          console.warn(`[WhatsApp Service] sendTemplate attempt ${attempt + 1}: success=false`, errorDetail);
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
            continue;
          }
          throw lastError;
        }

        return data;
      } catch (err: any) {
        lastError = err;
        // Only retry on genuine network errors, not on API rejections (4xx)
        const isApiRejection = err.message?.includes('API returned') || err.message?.includes('WhatsApp API');
        if (attempt < MAX_RETRIES && !isApiRejection) {
          console.warn(`[WhatsApp Service] sendTemplate attempt ${attempt + 1} network error:`, err.message);
          await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
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

  /**
   * Map a booking status to an approved WhatsApp template name and its parameters.
   *
   * Template mapping:
   *   in_process → booking_payment_pending  (params: name)
   *   completed  → payment_received         (params: name)
   *   booked     → review_request           (params: name)
   *   hold       → booking_cancelled        (params: name)
   */
  buildStatusChangeTemplate(
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
  ): { templateName: string; templateParams: string[] } | null {
    const name = booking.name || 'Customer';

    // All Meta-approved templates accept exactly 1 parameter: {{1}} = customer name
    switch (status) {
      case 'completed':
        return { templateName: 'payment_received', templateParams: [name] };
      case 'in_process':
        return { templateName: 'booking_payment_pending', templateParams: [name] };
      case 'booked':
        return { templateName: 'review_request', templateParams: [name] };
      case 'hold':
        return { templateName: 'booking_cancelled', templateParams: [name] };
      default:
        return null;
    }
  },

  /** Send an automatic status-change WhatsApp template message with debug logging */
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
    console.log(`[WhatsApp Auto] ──── STATUS CHANGE EVENT ────`);
    console.log(`[WhatsApp Auto] Booking ID: ${booking.id}`);
    console.log(`[WhatsApp Auto] New Status: ${status}`);
    console.log(`[WhatsApp Auto] Phone: ${booking.phone || 'MISSING'}`);
    console.log(`[WhatsApp Auto] Customer: ${booking.name || 'N/A'}`);

    try {
      if (!booking.phone) {
        console.error('[WhatsApp Auto] ❌ SKIPPED: No phone number for booking', booking.id);
        return false;
      }

      const template = this.buildStatusChangeTemplate(status, booking);
      if (!template) {
        console.warn(`[WhatsApp Auto] ⚠️ SKIPPED: Status "${status}" has no template mapping`);
        return false;
      }

      console.log(`[WhatsApp Auto] 📤 Sending template "${template.templateName}" to ${booking.phone}...`);

      const result = await this.sendTemplateMessage(
        booking.phone,
        template.templateName,
        template.templateParams,
        'en',
        booking.name,
        booking.id,
        booking.booking_type
      );

      console.log(`[WhatsApp Auto] ✅ Template "${template.templateName}" SENT successfully`);
      console.log(`[WhatsApp Auto] API Response:`, JSON.stringify(result));
      return true;
    } catch (error: any) {
      console.error(`[WhatsApp Auto] ❌ FAILED to send ${status} template for booking ${booking.id}:`, error.message || error);
      throw error; // Re-throw so caller can handle (show error toast, unset flag)
    }
  },
};
