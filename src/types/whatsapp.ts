export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  from: string;
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  body: string;
  templateName?: string;
  templateParams?: string[];
  timestamp: any;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
  whatsappMessageId?: string;
  metadata?: Record<string, any>;
}

export interface WhatsAppConversation {
  id: string;
  customerPhone: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  bookingId?: string;
  bookingType?: 'booking' | 'hotel' | 'package';
  status: 'active' | 'closed';
  lastCustomerMessageTime?: any;
  created_at: any;
  updated_at: any;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  parameters: string[];
}
