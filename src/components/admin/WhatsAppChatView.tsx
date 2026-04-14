import React, { useEffect, useRef } from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WhatsAppMessage, WhatsAppConversation } from '@/types/whatsapp';
import { whatsappService } from '@/services/whatsappService';
import WhatsAppMessageInput from './WhatsAppMessageInput';
import { cn } from '@/lib/utils';

interface WhatsAppChatViewProps {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[];
  loading: boolean;
  sendingMessage: boolean;
  onSendMessage: (phone: string, text: string, customerName?: string) => Promise<void>;
  onSendTemplate: (phone: string, templateName: string, params: string[], languageCode: string, customerName?: string) => Promise<void>;
  onBack?: () => void;
  showBackButton?: boolean;
}

function formatMessageTime(timestamp: any): string {
  if (!timestamp) return 'just now';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return 'just now';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateSeparator(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusTicks({ status }: { status: string }) {
  if (status === 'sending') return <span className="text-gray-400 text-[10px]">🕐</span>;
  if (status === 'sent') return <span className="text-gray-400 text-[10px]">✓</span>;
  if (status === 'delivered') return <span className="text-gray-400 text-[10px]">✓✓</span>;
  if (status === 'read') return <span className="text-blue-500 text-[10px]">✓✓</span>;
  if (status === 'failed') return <span className="text-red-500 text-[10px]">✕</span>;
  return null;
}

const WhatsAppChatView: React.FC<WhatsAppChatViewProps> = ({
  conversation,
  messages,
  loading,
  sendingMessage,
  onSendMessage,
  onSendTemplate,
  onBack,
  showBackButton,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Empty state
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#F0F2F5]">
        <div className="w-64 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-1">WhatsApp Business</h3>
            <p className="text-sm text-gray-400">Select a conversation to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  const isWithin24h = whatsappService.isWithin24hWindow(conversation);

  // Group messages by date
  let lastDate = '';

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#075E54] text-white shadow-sm flex-shrink-0">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 rounded-full bg-[#DFE5E7] flex items-center justify-center text-sm font-medium text-[#54656F] flex-shrink-0">
          {(conversation.customerName || conversation.customerPhone)
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{conversation.customerName}</h3>
          <p className="text-xs text-white/70">{conversation.customerPhone}</p>
        </div>
        <a
          href={`tel:${conversation.customerPhone}`}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>

      {/* 24h Window Indicator */}
      {!isWithin24h && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700">
          ⚠️ 24h messaging window expired. Only template messages can be sent.
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[#ECE5DD] px-4 py-2"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cfc6' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Send a message to start the conversation.
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const msgDate = formatDateSeparator(msg.timestamp);
              const showDate = msgDate !== lastDate;
              if (showDate) lastDate = msgDate;

              return (
                <React.Fragment key={msg.id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="bg-white/80 text-gray-500 text-[11px] px-3 py-1 rounded-lg shadow-sm">
                        {msgDate}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'flex mb-1',
                      msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-lg px-3 py-1.5 shadow-sm relative',
                        msg.direction === 'outbound'
                          ? 'bg-[#DCF8C6] rounded-tr-none'
                          : 'bg-white rounded-tl-none'
                      )}
                    >
                      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {msg.body}
                      </p>
                      <div
                        className={cn(
                          'flex items-center gap-1 justify-end mt-1',
                          msg.direction === 'outbound' ? '-mr-1' : ''
                        )}
                      >
                        <span className="text-[11px] text-gray-500 leading-none">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                        {msg.direction === 'outbound' && <StatusTicks status={msg.status} />}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <WhatsAppMessageInput
        onSend={(text) =>
          onSendMessage(conversation.customerPhone, text, conversation.customerName)
        }
        onSendTemplate={(templateName, languageCode, hasNameParam) =>
          onSendTemplate(
            conversation.customerPhone,
            templateName,
            hasNameParam ? [conversation.customerName || 'Customer'] : [],
            languageCode,
            conversation.customerName
          )
        }
        sending={sendingMessage}
        disabled={false}
        templateOnly={!isWithin24h}
      />
    </div>
  );
};

export default WhatsAppChatView;
