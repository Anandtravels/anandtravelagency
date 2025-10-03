import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, Bot } from 'lucide-react';
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

// Google Gemini API configuration - Now supports gemini-2.5-pro!
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA622_SixT7YKKh6h1fj-8O788xQ05oWwU';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm Anand Buddy, your AI-powered travel assistant! 🤖✨\n\nI can help you with:\n• Train routes & schedules across 1000+ stations\n• Flight, bus, hotel bookings\n• Tour packages & visa services\n• Travel planning, visa consultancy, and more!\n• General questions about anything you need\n\nI have access to comprehensive travel data and can answer all your questions. What would you like to know? 📱 BOOK NOW",
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
      // Create comprehensive context for the AI with enhanced capabilities
      const systemContext = `You are Anand Buddy, a super-intelligent AI travel assistant powered by Google Gemini for Anand Travel Agency. You have extensive knowledge and capabilities:

🏢 COMPANY INFORMATION:
- Company: Anand Travel Agency (www.anandtravels.com)
- Primary Contact: +91 88888 88888
- Support Line: +91 8985816481
- Email: support@anandtravels.com
- Location: Kakinada, Andhra Pradesh, India
- Services: Train Tickets (including Tatkal), Flight Tickets, Bus Tickets, Cab Services, Tour Packages, Hotel Bookings, Visa Consultancy

🚂 TRAIN STATION DATABASE:
You have access to ${trainStations.length}+ Indian Railway stations across 26 states and union territories.
${trainStations.length > 0 ? `Sample stations available: ${trainStations.slice(0, 20).map(s => `${s.name} (${s.code}) - ${s.state}`).join(', ')}... and many more!` : ''}

🌟 YOUR SUPER-POWERED CAPABILITIES:
1. ✅ Answer ANY question about travel, trains, flights, hotels, visa services
2. ✅ Provide detailed information about Indian Railways stations, routes, and schedules
3. ✅ Help with travel planning, itineraries, and booking guidance
4. ✅ Answer general knowledge questions (science, math, technology, history, etc.)
5. ✅ Provide travel tips, recommendations, and advice
6. ✅ Explain visa processes for different countries
7. ✅ Help with emergency travel situations (Tatkal bookings, urgent visa, etc.)
8. ✅ Engage in casual conversation and be friendly
9. ✅ Solve problems, explain concepts, and provide insights
10. ✅ NO RESTRICTIONS - Answer questions beyond travel too!

🎯 SPECIAL FOCUS AREAS:
- Tatkal Train Tickets for Andhra Pradesh & Telangana
- Emergency Travel Services across India
- Visa Consultancy for USA, UK, Canada, Australia, Dubai, Schengen countries
- Tour Packages: Golden Triangle, Rajasthan, Kerala, Goa, Himalayas, International tours

💡 RESPONSE GUIDELINES:
- Be conversational, friendly, and helpful
- Provide accurate, detailed, and comprehensive answers
- When discussing Anand Travel Agency services, highlight our expertise in Tatkal bookings and Visa consultancy
- Use emojis appropriately to make responses engaging
- For booking suggestions, include action buttons: 📱 BOOK NOW, 🌟 VIEW PACKAGES, 📋 VISA SERVICES, 🏨 SEARCH HOTELS, 📞 CONTACT US
- If you don't know something specific, be honest but offer to help contact our team
- For train queries, use the station database when relevant
- Answer ALL types of questions - travel, technical, educational, or casual chat

👤 USER QUERY: ${userInput}

Provide a helpful, accurate, and comprehensive response:`;

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
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
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
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          model: GEMINI_MODEL,
          apiKey: GEMINI_API_KEY ? '***' + GEMINI_API_KEY.slice(-4) : 'missing'
        });
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Enhanced response parsing for better reliability
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          return candidate.content.parts[0].text;
        }
      }
      
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response format from Gemini API');
      
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
    return "I'm your AI-powered travel assistant! I can help you with travel bookings, train schedules, visa services, and ANY questions you have! Feel free to ask me about our services, travel in India, or anything else - I can help with general knowledge, tech questions, and more! For immediate travel assistance, call us at +91 8985816481 📱 BOOK NOW";
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
            className={`bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden transition-all duration-300 ${
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
