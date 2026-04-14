import { useState, useEffect } from 'react';
import { WhatsAppConversation } from '@/types/whatsapp';
import { whatsappService } from '@/services/whatsappService';

export const useWhatsAppConversations = () => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = whatsappService.subscribeConversations((convos) => {
      setConversations(convos);
      setLoading(false);

      const total = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadTotal(total);
    });

    return () => unsub();
  }, []);

  const filtered = searchQuery
    ? conversations.filter(
        (c) =>
          c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.customerPhone?.includes(searchQuery)
      )
    : conversations;

  return {
    conversations: filtered,
    allConversations: conversations,
    loading,
    unreadTotal,
    searchQuery,
    setSearchQuery,
  };
};
