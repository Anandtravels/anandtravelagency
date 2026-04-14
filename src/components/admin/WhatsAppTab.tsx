import React, { useState, useCallback } from 'react';
import { Plus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useWhatsAppConversations } from '@/hooks/useWhatsAppConversations';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { WhatsAppConversation } from '@/types/whatsapp';
import WhatsAppConversationList from './WhatsAppConversationList';
import WhatsAppChatView from './WhatsAppChatView';

interface WhatsAppTabProps {
  user: any;
}

const WhatsAppTab: React.FC<WhatsAppTabProps> = ({ user }) => {
  const {
    conversations,
    loading: convosLoading,
    searchQuery,
    setSearchQuery,
  } = useWhatsAppConversations();

  const [selectedConvo, setSelectedConvo] = useState<WhatsAppConversation | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  const { messages, loading: msgsLoading, sendingMessage, sendMessage, sendTemplate } =
    useWhatsAppMessages(selectedConvo?.id || null);

  const handleSelectConvo = useCallback((convo: WhatsAppConversation) => {
    setSelectedConvo(convo);
    setMobileShowChat(true);
  }, []);

  const handleBack = useCallback(() => {
    setMobileShowChat(false);
  }, []);

  const handleStartNewChat = async () => {
    if (!newPhone.trim() || !newMessage.trim()) return;
    setStartingChat(true);
    try {
      const phone = newPhone.replace(/\D/g, '');
      const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
      await sendMessage(fullPhone, newMessage.trim(), newName || fullPhone);
      setNewChatOpen(false);
      setNewPhone('');
      setNewName('');
      setNewMessage('');
    } catch (err) {
      console.error('Failed to start new chat:', err);
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#25D366]/10 rounded-lg">
            <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WhatsApp Business</h1>
            <p className="text-sm text-gray-500">Chat with customers via WhatsApp</p>
          </div>
        </div>
        <Button
          onClick={() => setNewChatOpen(true)}
          className="bg-[#25D366] hover:bg-[#1DA851] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 flex rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white min-h-0">
        {/* Left Panel: Conversations List */}
        <div
          className={`w-full md:w-[380px] md:border-r border-gray-200 flex-shrink-0 ${
            mobileShowChat ? 'hidden md:flex md:flex-col' : 'flex flex-col'
          }`}
        >
          <WhatsAppConversationList
            conversations={conversations}
            loading={convosLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedId={selectedConvo?.id || null}
            onSelect={handleSelectConvo}
          />
        </div>

        {/* Right Panel: Chat View */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <WhatsAppChatView
            conversation={selectedConvo}
            messages={messages}
            loading={msgsLoading}
            sendingMessage={sendingMessage}
            onSendMessage={sendMessage}
            onSendTemplate={sendTemplate}
            onBack={handleBack}
            showBackButton={mobileShowChat}
          />
        </div>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#25D366]" />
              Start New Conversation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Phone Number *</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md">+91</span>
                <Input
                  placeholder="9876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <Label>Customer Name</Label>
              <Input
                placeholder="Optional"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Message *</Label>
              <textarea
                placeholder="Type your first message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                className="w-full mt-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#25D366] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewChatOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartNewChat}
              disabled={!newPhone.trim() || !newMessage.trim() || startingChat}
              className="bg-[#25D366] hover:bg-[#1DA851] text-white"
            >
              {startingChat ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppTab;
