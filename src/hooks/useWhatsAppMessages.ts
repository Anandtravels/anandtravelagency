import { useState, useEffect, useCallback } from 'react';
import { WhatsAppMessage } from '@/types/whatsapp';
import { whatsappService } from '@/services/whatsappService';

export const useWhatsAppMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = whatsappService.subscribeMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    // Mark as read when opened
    whatsappService.markAsRead(conversationId).catch(console.error);

    return () => unsub();
  }, [conversationId]);

  const sendMessage = useCallback(
    async (phone: string, text: string, customerName?: string) => {
      if (!text.trim()) return;
      setSendingMessage(true);
      try {
        await whatsappService.sendMessage(phone, text.trim(), customerName);
      } finally {
        setSendingMessage(false);
      }
    },
    []
  );

  const sendTemplate = useCallback(
    async (
      phone: string,
      templateName: string,
      params: string[],
      languageCode: string = 'en',
      customerName?: string
    ) => {
      setSendingMessage(true);
      try {
        await whatsappService.sendTemplateMessage(
          phone,
          templateName,
          params,
          languageCode,
          customerName
        );
      } finally {
        setSendingMessage(false);
      }
    },
    []
  );

  return { messages, loading, sendingMessage, sendMessage, sendTemplate };
};
