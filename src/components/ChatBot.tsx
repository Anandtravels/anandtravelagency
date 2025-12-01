import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  className?: string;
}

// Google Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA622_SixT7YKKh6h1fj-8O788xQ05oWwU';

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm Anand Buddy 🤖\n\nI help with:\n• Train, flight, bus, hotel bookings\n• Tour packages & visa services\n• Travel planning & general queries\n\nHow can I assist you today? 📱 BOOK NOW",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Generate AI-powered bot response using Google Gemini API
  const generateBotResponse = async (userInput: string): Promise<string> => {
    try {
      // Build the query with context and request for short response
      const query = `You are Anand Buddy, AI assistant for Anand Travel Agency (Kakinada, India). Contact: +91 8985816481.

User asks: "${userInput}"

I need it in short and precise. Give direct answer in 50-80 words max. For train queries, list 3-5 actual train names with numbers. End with "📱 BOOK NOW" or "📞 CONTACT US".`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
      });

      const text = response.text;
      if (text) {
        return text;
      }
      
      throw new Error('No response from API');
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback response
      return getFallbackResponse(userInput);
    }
  };
  
  // Enhanced fallback response system - Concise responses
  const getFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Provide helpful train info for common routes
    if (input.includes('hyderabad') && input.includes('kakinada')) {
      return `**Hyderabad to Kakinada Trains:**
• 12727 Godavari Express
• 17239 Simhadri Express  
• 12775 Cocanada AC Express
• 17015 Visakha Express

Travel time: ~8-10 hours. Contact +91 8985816481 for bookings! 📱 BOOK NOW`;
    }
    
    if (input.includes('kakinada') && input.includes('hyderabad')) {
      return `**Kakinada to Hyderabad Trains:**
• 12728 Godavari Express
• 17240 Simhadri Express
• 12776 Cocanada AC Express
• 17016 Visakha Express

Travel time: ~8-10 hours. Contact +91 8985816481 for bookings! 📱 BOOK NOW`;
    }
    
    // Train route queries
    if (input.includes('train') || (input.includes('from') && input.includes('to'))) {
      const fromMatch = input.match(/from\s+([a-z\s]+?)\s+to/i);
      const toMatch = input.match(/to\s+([a-z\s]+?)(?:\s|$|\?)/i);
      
      if (fromMatch && toMatch) {
        const fromCity = fromMatch[1].trim();
        const toCity = toMatch[1].trim();
        return `For trains from ${fromCity.charAt(0).toUpperCase() + fromCity.slice(1)} to ${toCity.charAt(0).toUpperCase() + toCity.slice(1)}, contact +91 8985816481. We specialize in Tatkal & advance bookings! 📱 BOOK NOW`;
      }
      
      return `We help with train bookings across 1000+ stations. Contact +91 8985816481 for schedules & bookings. 📱 BOOK NOW`;
    }
    
    // Travel service related responses
    if (input.includes('book') || input.includes('booking')) {
      return "Book train, flight, hotel or visa services with us! 📱 BOOK NOW";
    }
    
    if (input.includes('package') || input.includes('tour')) {
      return "We offer Golden Triangle, Rajasthan, Kerala, Goa & international tours! 🌟 VIEW PACKAGES";
    }
    
    if (input.includes('visa')) {
      return "Visa services for USA, UK, Canada, Australia, Dubai & Schengen. 📋 VISA SERVICES";
    }
    
    if (input.includes('hotel')) {
      return "Budget to luxury hotels across India & internationally. 🏨 SEARCH HOTELS";
    }
    
    if (input.includes('contact') || input.includes('phone') || input.includes('call')) {
      return "Reach us at +91 8985816481 or visit our contact page! 📞 CONTACT US";
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hi! I'm Anand Buddy. I can help with train, flight, hotel bookings, visa services and more. What do you need? 📱 BOOK NOW";
    }
    
    if (input.includes('thanks') || input.includes('thank you')) {
      return "You're welcome! Need anything else?";
    }
    
    // General fallback
    return "I'm your AI travel assistant! Ask about trains, flights, hotels, visa or any travel query. Call +91 8985816481 for immediate help. 📱 BOOK NOW";
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const questionToAsk = currentMessage; // Store before clearing
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Get AI-powered response
      const botResponse = await generateBotResponse(questionToAsk);
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '_bot',
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_bot',
        text: "I'm having trouble connecting right now. Please try again or contact us at +91 8985816481",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle clickable actions in bot messages
  const handleBotAction = (action: string) => {
    switch (action) {
      case 'BOOK NOW':
        window.location.href = '/booking';
        break;
      case 'VIEW PACKAGES':
        window.location.href = '/packages';
        break;
      case 'VISA SERVICES':
        window.location.href = '/visa-services';
        break;
      case 'SEARCH HOTELS':
        window.location.href = '/hotels';
        break;
      case 'CONTACT US':
        window.location.href = '/contact';
        break;
      default:
        break;
    }
  };

  // Parse message text to create clickable buttons
  const parseMessageWithActions = (text: string) => {
    const actionPattern = /(📱|🌟|📋|🏨|📞)\s+([A-Z\s]+)$/;
    const match = text.match(actionPattern);
    
    if (match) {
      const [fullMatch, emoji, action] = match;
      const textWithoutAction = text.replace(fullMatch, '').trim();
      
      return (
        <div>
          <p className="whitespace-pre-wrap break-words leading-relaxed">{textWithoutAction}</p>
          <button
            onClick={() => handleBotAction(action.trim())}
            className="mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 touch-manipulation active:scale-95 font-semibold shadow-md hover:shadow-lg"
            aria-label={action.trim()}
          >
            {emoji} {action.trim()}
          </button>
        </div>
      );
    }
    
    return <p className="whitespace-pre-wrap break-words leading-relaxed">{text}</p>;
  };

  return (
    <div className={`fixed right-2 sm:right-4 bottom-2 sm:bottom-4 z-50 ${className}`}>
      {/* Chat Button - Robot Icon */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 relative group touch-manipulation border-2 border-blue-400/30"
          aria-label="Open chat"
        >
          <Bot className="w-7 h-7" />
          
          {/* AI Badge with pulse */}
          <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 animate-pulse">
            <Sparkles size={10} />
          </div>
          
          {/* Animated Ring */}
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
              <span className="font-medium">Anand Buddy</span> - AI Travel Assistant
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden transition-all duration-300 flex flex-col ${
              isMinimized ? 'h-auto' : 'h-[calc(100vh-8rem)] sm:h-[450px] md:h-[550px] max-h-[650px]'
            } w-[calc(100vw-1rem)] sm:w-[400px] max-w-[calc(100vw-1rem)]`}
          >
            {/* Header - Matching Design */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-3 sm:p-4 flex justify-between items-center flex-shrink-0 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Robot Icon */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center relative flex-shrink-0 border-2 border-white/20">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 border-2 border-blue-700">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                {/* Text Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5 truncate">
                    <span className="truncate">Anand Buddy</span>
                    <span className="text-[10px] sm:text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex-shrink-0 font-semibold border border-white/30">AI</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/90 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Online • AI Assistant
                  </p>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-1 flex-shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-9 w-9 p-0 touch-manipulation rounded-full transition-all duration-200 hover:scale-110"
                  aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 hover:bg-red-500/30 h-9 w-9 p-0 touch-manipulation rounded-full transition-all duration-200 hover:scale-110"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content - Only show when not minimized */}
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <ScrollArea className="flex-1 h-[calc(100vh-16rem)] sm:h-[320px] md:h-[400px] p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-md'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          {message.sender === 'bot' ? parseMessageWithActions(message.text) : <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>}
                          <p className={`text-xs mt-2 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-md shadow-sm">
                          <div className="flex space-x-1.5">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t-2 border-blue-100 flex-shrink-0 bg-gradient-to-b from-white to-gray-50">
                  <div className="flex gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 text-sm sm:text-base h-12 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 touch-manipulation bg-white shadow-sm"
                      style={{ fontSize: '16px' }}
                      disabled={isTyping}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isTyping}
                      className="bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 p-2 h-12 w-12 flex-shrink-0 touch-manipulation rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;
