import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface WhatsAppMessageInputProps {
  onSend: (text: string) => Promise<void>;
  onSendTemplate: (templateName: string, languageCode: string, hasNameParam: boolean) => Promise<void>;
  sending: boolean;
  disabled: boolean;
  templateOnly: boolean;
}

const quickReplies = [
  'Your booking has been confirmed! ✅',
  'Your ticket is being processed. Please wait.',
  'Payment received. Thank you! 🙏',
  'Please share your Aadhar details for the booking.',
  'Your refund has been initiated.',
  'Please call us for more details.',
];

const templates = [
  { name: 'booking_confirmation', label: '✅ Booking Confirmation', languageCode: 'en', hasNameParam: true },
  { name: 'booking_payment_pending', label: '💰 Payment Pending', languageCode: 'en', hasNameParam: true },
  { name: 'payment_received', label: '✅ Payment Received', languageCode: 'en', hasNameParam: true },
  { name: 'booking_cancelled', label: '❌ Booking Cancelled', languageCode: 'en', hasNameParam: true },
  { name: 'ticket_booking_failed', label: '⚠️ Ticket Booking Failed', languageCode: 'en', hasNameParam: true },
  { name: 'flight_booking_received', label: '✈️ Flight Booking Received', languageCode: 'en', hasNameParam: true },
  { name: 'bus_booking_received', label: '🚌 Bus Booking Received', languageCode: 'en', hasNameParam: true },
  { name: 'review_request', label: '⭐ Review Request', languageCode: 'en', hasNameParam: true },
  { name: 'app_download_process', label: '📱 App Download', languageCode: 'en', hasNameParam: true },
  { name: 'visa_application_received', label: '🛂 Visa Application Received', languageCode: 'en', hasNameParam: true },
  { name: 'career_application_received', label: '💼 Career Application Received', languageCode: 'en', hasNameParam: true },
  { name: 'hello_world', label: '👋 Hello World (Test)', languageCode: 'en_US', hasNameParam: false },
];

const WhatsAppMessageInput: React.FC<WhatsAppMessageInputProps> = ({
  onSend,
  onSendTemplate,
  sending,
  disabled,
  templateOnly,
}) => {
  const [text, setText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = async () => {
    if (!text.trim() || sending || disabled) return;
    const msg = text;
    setText('');
    await onSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = async (reply: string) => {
    setShowQuickReplies(false);
    setText('');
    await onSend(reply);
  };

  return (
    <div className="bg-[#F0F2F5] border-t border-gray-200 flex-shrink-0">
      {/* Quick Replies Bar */}
      {showQuickReplies && (
        <div className="px-3 py-2 border-b border-gray-200 bg-white flex gap-2 overflow-x-auto">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleQuickReply(reply)}
              className="flex-shrink-0 px-3 py-1.5 bg-[#E7FFE7] text-[#075E54] rounded-full text-xs hover:bg-[#DCF8C6] transition-colors whitespace-nowrap"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Template-only mode notice */}
      {templateOnly && (
        <div className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs border-b border-amber-200 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          24h window expired — use a template message to re-open the conversation.
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2 px-3 py-2">
        {/* Quick Reply Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-gray-500 hover:text-[#075E54] h-10 w-10"
          onClick={() => setShowQuickReplies(!showQuickReplies)}
        >
          <Smile className="w-5 h-5" />
        </Button>

        {/* Text Input */}
        {!templateOnly ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={disabled || sending}
            className="flex-1 resize-none rounded-lg border-0 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#25D366] shadow-sm placeholder:text-gray-400 disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
        ) : (
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-gray-500 bg-white"
                  disabled={sending}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Send a template message...
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
                {templates.map((tmpl) => (
                  <DropdownMenuItem
                    key={tmpl.name}
                    onClick={() => onSendTemplate(tmpl.name, tmpl.languageCode, tmpl.hasNameParam)}
                  >
                    <FileText className="w-4 h-4 mr-2 text-[#25D366]" />
                    {tmpl.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Template Button (when not in template-only mode) */}
        {!templateOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 text-gray-500 hover:text-[#075E54] h-10 w-10"
              >
                <FileText className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
              <div className="px-2 py-1.5 text-xs text-gray-500 font-medium">Template Messages</div>
              {templates.map((tmpl) => (
                <DropdownMenuItem
                  key={tmpl.name}
                  onClick={() => onSendTemplate(tmpl.name, tmpl.languageCode, tmpl.hasNameParam)}
                >
                  <FileText className="w-4 h-4 mr-2 text-[#25D366]" />
                  {tmpl.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Send Button */}
        {!templateOnly && (
          <Button
            onClick={handleSend}
            disabled={!text.trim() || sending || disabled}
            size="icon"
            className={cn(
              'flex-shrink-0 rounded-full h-10 w-10 transition-colors',
              text.trim()
                ? 'bg-[#25D366] hover:bg-[#1DA851] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default WhatsAppMessageInput;
