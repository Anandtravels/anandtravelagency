import React from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WhatsAppConversation } from '@/types/whatsapp';
import { cn } from '@/lib/utils';

interface WhatsAppConversationListProps {
  conversations: WhatsAppConversation[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedId: string | null;
  onSelect: (convo: WhatsAppConversation) => void;
}

function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return 'now';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return 'now';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-IN', { weekday: 'short' });
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const bookingTypeIcons: Record<string, string> = {
  booking: '🚆',
  hotel: '🏨',
  package: '📦',
};

const WhatsAppConversationList: React.FC<WhatsAppConversationListProps> = ({
  conversations,
  loading,
  searchQuery,
  onSearchChange,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 bg-[#075E54] text-white">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chats
        </h2>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-[#F0F2F5]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white border-0 rounded-lg text-sm h-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
            <MessageCircle className="w-8 h-8 opacity-30" />
            {searchQuery ? 'No results found' : 'No conversations yet'}
          </div>
        ) : (
          conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => onSelect(convo)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F0F2F5] transition-colors border-b border-gray-100',
                selectedId === convo.id && 'bg-[#F0F2F5]'
              )}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#DFE5E7] flex items-center justify-center text-sm font-medium text-[#54656F] flex-shrink-0">
                {getInitials(convo.customerName || convo.customerPhone)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {convo.bookingType && (
                      <span className="mr-1">{bookingTypeIcons[convo.bookingType] || ''}</span>
                    )}
                    {convo.customerName || convo.customerPhone}
                  </span>
                  <span
                    className={cn(
                      'text-xs flex-shrink-0 ml-2',
                      convo.unreadCount > 0 ? 'text-[#25D366] font-medium' : 'text-gray-400'
                    )}
                  >
                    {formatRelativeTime(convo.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-500 truncate pr-2">
                    {convo.lastMessage || 'No messages yet'}
                  </p>
                  {convo.unreadCount > 0 && (
                    <Badge className="bg-[#25D366] text-white text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 flex-shrink-0">
                      {convo.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default WhatsAppConversationList;
