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
};
