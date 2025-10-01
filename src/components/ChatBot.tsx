import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDD58R6k_IALIUvHyIrb5H6p8wVXGiOhik';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm Anand Buddy, your AI-powered travel assistant! 🤖✨\n\nI can help you with:\n• Train routes & schedules across 1000+ stations\n• Flight, bus, hotel bookings\n• Tour packages & visa services\n• General questions about anything!\n\nWhat would you like to know? 📱 BOOK NOW",
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

  // Load train station data for context
  const [trainStations, setTrainStations] = useState<any[]>([]);
  
  useEffect(() => {
    // Load train station data
    fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        const allStations: any[] = [];
        if (data.states && Array.isArray(data.states)) {
          data.states.forEach((state: any) => {
            if (state.stations && Array.isArray(state.stations)) {
              allStations.push(...state.stations.map((s: any) => ({
                ...s,
                state: state.state
              })));
            }
          });
        }
        setTrainStations(allStations);
      })
      .catch(err => console.error('Failed to load station data:', err));
  }, []);
  
  // Generate AI-powered bot response using Google Gemini API
  const generateBotResponse = async (userInput: string): Promise<string> => {
    try {
      // Create comprehensive context for the AI
      const systemContext = `You are Anand Buddy, an intelligent AI travel assistant for Anand Travel Agency. You have access to the following information and capabilities:

COMPANY INFORMATION:
- Company: Anand Travel Agency (www.anandtravels.com)
- Contact: +91 88888 88888
- Support: +91 8985816481
- Services: Train Tickets, Flight Tickets, Bus Tickets, Cab Services, Tour Packages, Hotel Bookings, Visa Services

TRAIN STATION DATABASE:
You have access to ${trainStations.length}+ Indian Railway stations across 26 states.
${trainStations.length > 0 ? `Sample stations: ${trainStations.slice(0, 20).map(s => `${s.name} (${s.code})`).join(', ')}...` : ''}

CAPABILITIES:
1. Answer questions about trains, routes, and railway stations in India
2. Provide information about Anand Travel Agency's services
3. Answer general questions about travel, geography, and any other topics
4. Help with booking inquiries
5. Provide travel tips and recommendations

IMPORTANT INSTRUCTIONS:
- Answer ANY question the user asks - there are NO restrictions
- For train route questions, use your knowledge of Indian Railways
- For website services, provide specific information about Anand Travel Agency
- Be helpful, accurate, and comprehensive
- You can answer questions beyond travel - general knowledge, math, science, etc.
- When suggesting actions, use action buttons like 📱 BOOK NOW, 🌟 VIEW PACKAGES, etc.
- Be conversational and friendly

USER QUERY: ${userInput}

Provide a helpful, comprehensive response:`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemContext
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', errorData);
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('Invalid response format');
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback to enhanced rule-based responses if API fails
      return getFallbackResponse(userInput);
    }
  };
  
  // Enhanced fallback response system
  const getFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Train route queries
    if (input.includes('train') && (input.includes('from') || input.includes('to'))) {
      const stationMentioned = trainStations.find(s => 
        input.includes(s.name.toLowerCase()) || input.includes(s.code.toLowerCase())
      );
      
      if (stationMentioned) {
        return `For train schedules and bookings between stations, I recommend using our booking service or visiting the Indian Railways website. Station ${stationMentioned.name} (${stationMentioned.code}) is in ${stationMentioned.state}. We can help you book tickets! 📱 BOOK NOW`;
      }
      
      return `I can help you with train bookings! We have access to 1000+ railway stations across India. For train schedules, timings, and bookings, please use our booking service or contact us at +91 8985816481 📱 BOOK NOW`;
    }
    
    // Travel service related responses
    if (input.includes('book') || input.includes('booking')) {
      return "I'd be happy to help you with bookings! You can book train tickets, packages, hotels, or visa services. Click here to book now: 📱 BOOK NOW";
    }
    
    if (input.includes('package') || input.includes('tour')) {
      return "We have amazing travel packages! Check out our India Golden Triangle, Rajasthan tours, Kerala backwaters, Goa beaches, and international packages. 🌟 VIEW PACKAGES";
    }
    
    if (input.includes('visa')) {
      return "We provide visa services for multiple countries including USA, UK, Canada, Australia, Dubai, and more. Our team can help with document preparation and application processing. 📋 VISA SERVICES";
    }
    
    if (input.includes('hotel')) {
      return "Looking for hotels? We have partnerships with top hotels across India and internationally. From budget stays to luxury resorts, we've got you covered! 🏨 SEARCH HOTELS";
    }
    
    if (input.includes('contact') || input.includes('phone') || input.includes('call')) {
      return "You can reach us at +91 88888 88888 or visit our contact page. We're here to help with all your travel needs! 📞 CONTACT US";
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! Welcome to Anand Travel Agency. I'm Anand Buddy, your AI travel assistant. I can help you with travel bookings, answer questions about trains, flights, hotels, and even general queries. How can I assist you today?";
    }
    
    if (input.includes('thanks') || input.includes('thank you')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    // General knowledge fallback
    return "I'm powered by AI to help you with travel bookings, train schedules, and general questions. Feel free to ask me anything about our services or travel in India! For immediate assistance, call us at +91 8985816481";
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
          <p className="whitespace-pre-wrap break-words">{textWithoutAction}</p>
          <button
            onClick={() => handleBotAction(action.trim())}
            className="mt-2 bg-travel-blue-dark text-white px-3 py-1 rounded text-xs hover:bg-travel-blue-medium transition-colors duration-200"
          >
            {emoji} {action.trim()}
          </button>
        </div>
      );
    }
    
    return <p className="whitespace-pre-wrap break-words">{text}</p>;
  };

  return (
    <div className={`fixed right-2 sm:right-4 bottom-2 sm:bottom-4 z-50 ${className}`}>
      {/* Chat Button - Always visible */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative group"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          
          {/* AI Badge */}
          <div className="absolute -top-1 -right-1 bg-travel-orange text-white rounded-full p-1">
            <Sparkles size={12} />
          </div>
          
          {/* Pulsing Ring Animation */}
          <div className="absolute inset-0 rounded-full bg-travel-blue-dark opacity-30 animate-ping"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
            <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              AI-Powered Chat
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden ${
              isMinimized ? 'h-12' : 'h-80 sm:h-96 md:h-[500px]'
            } w-72 sm:w-80 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)]`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative">
                  <MessageCircle className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 bg-travel-orange rounded-full p-0.5">
                    <Sparkles size={8} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-1">
                    Anand Buddy
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">AI</span>
                  </h3>
                  <p className="text-xs text-white/80">Online • Powered by AI</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content - Only show when not minimized */}
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <ScrollArea className="h-56 sm:h-72 md:h-80 p-3 sm:p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            message.sender === 'user'
                              ? 'bg-travel-blue-dark text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.sender === 'bot' ? parseMessageWithActions(message.text) : <p className="whitespace-pre-wrap break-words">{message.text}</p>}
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-3 sm:p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 text-sm h-10"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isTyping}
                      className="bg-travel-blue-dark hover:bg-travel-blue-medium p-2 h-10 w-10 flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
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
