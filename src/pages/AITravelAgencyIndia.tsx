import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bot, Zap, Clock, Brain, MessageSquare, Users, CheckCircle, Star, Phone, Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AITravelAgencyIndia = () => {
  useEffect(() => {
    // SEO Meta Tags
    document.title = "India's First AI Travel Agency | Smart Chatbot by Anand Travels";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover India\'s first AI-powered travel agency with Anand Buddy smart chatbot. Get instant answers for trains, flights, hotels, visa & tour packages. Powered by Google Gemini AI. Available 24/7!');
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-travel-blue-dark via-travel-blue-medium to-travel-teal text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-travel-orange px-4 py-2 rounded-full mb-6 animate-pulse">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">India's First AI-Powered Travel Agency</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              India's First AI-Powered Travel Agency with <span className="text-travel-orange">Smart Chatbot</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Meet Anand Buddy – Your 24/7 AI Travel Assistant Powered by Google Gemini 2.0
            </p>
            
            <p className="text-lg mb-10 text-gray-300 max-w-3xl mx-auto">
              Get instant, accurate answers to ALL your travel questions. From train schedules across 1000+ stations to visa requirements for 50+ countries. Experience the future of travel planning with human-like AI conversations!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  // Trigger chatbot open (will be handled by ChatBot component)
                  const event = new CustomEvent('openChatbot');
                  window.dispatchEvent(event);
                }}
                className="bg-travel-orange hover:bg-travel-orange/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-6 h-6" />
                Chat with AI Now
              </button>
              <Link 
                to="/booking"
                className="bg-white hover:bg-gray-100 text-travel-blue-dark px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Book Your Trip
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose AI Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-4">
              Why Choose India's First AI-Powered Travel Agency?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're not just another travel agency – we've revolutionized travel planning with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-travel-orange/10 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-travel-orange" />
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                24/7 Instant Answers
              </h3>
              <p className="text-gray-600">
                No waiting for email replies or phone support. Get immediate responses to any travel query, any time of day or night. Our AI chatbot never sleeps!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-travel-orange/10 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-travel-orange" />
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                Super-Intelligent AI
              </h3>
              <p className="text-gray-600">
                Powered by Google Gemini 2.0, the world's most advanced AI. Understands complex queries, remembers context, and provides personalized recommendations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-travel-orange/10 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-travel-orange" />
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Instant search across 1000+ railway stations, flight routes, hotels worldwide, and visa requirements. What takes humans hours, AI does in seconds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-travel-orange/10 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-travel-orange" />
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                Human-Like Conversations
              </h3>
              <p className="text-gray-600">
                Chat naturally, no robotic responses. Anand Buddy understands follow-up questions, remembers your preferences, and converses like a real travel expert.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-travel-orange/10 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-travel-orange" />
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                Trusted by 1000+ Customers
              </h3>
              <p className="text-gray-600">
                Join thousands of happy travelers who use our AI chatbot daily. From students to business travelers, everyone loves Anand Buddy's instant help!
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-travel-orange/10 rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-travel-orange" />
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                Beyond Travel Queries
              </h3>
              <p className="text-gray-600">
                Our AI doesn't just answer travel questions! Ask about science, technology, math, or general knowledge. Anand Buddy is your all-knowing travel companion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Anand Buddy Section */}
      <section className="py-16 bg-gradient-to-br from-travel-blue-dark to-travel-blue-medium text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <Bot className="w-20 h-20 mx-auto mb-6 text-travel-orange" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Meet Anand Buddy – Your Super-Intelligent AI Travel Assistant
            </h2>
            
            <p className="text-xl mb-8 text-gray-200">
              Powered by Google Gemini 2.0, the world's most advanced AI technology
            </p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-travel-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">1000+ Railway Stations</h4>
                    <p className="text-sm text-gray-300">Comprehensive database of Indian Railways</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-travel-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">50+ Countries Visa Info</h4>
                    <p className="text-sm text-gray-300">Complete visa requirements and documentation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-travel-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Real-Time Flight Data</h4>
                    <p className="text-sm text-gray-300">Current routes, prices, and availability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-travel-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Smart Recommendations</h4>
                    <p className="text-sm text-gray-300">AI-powered personalized travel suggestions</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const event = new CustomEvent('openChatbot');
                window.dispatchEvent(event);
              }}
              className="bg-travel-orange hover:bg-travel-orange/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              <MessageSquare className="w-6 h-6" />
              Start Chatting with Anand Buddy
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-4">
              How Our AI Travel Chatbot Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, fast, and intelligent – travel planning made easy with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-travel-orange rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                Ask Any Question
              </h3>
              <p className="text-gray-600">
                Type your query in natural language. "Show me trains from Kakinada to Hyderabad tomorrow" or "Tell me visa requirements for USA"
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-travel-orange rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                AI Processes Instantly
              </h3>
              <p className="text-gray-600">
                Google Gemini AI analyzes your question, understands context, searches through vast travel databases, and formulates the perfect answer
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-travel-orange rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-travel-blue-dark mb-3">
                Get Accurate Answers
              </h3>
              <p className="text-gray-600">
                Receive detailed, accurate responses with booking options, tips, and recommendations. Ask follow-up questions anytime!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-travel-orange to-travel-teal text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience AI-Powered Travel Planning?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of travelers using India's smartest AI chatbot. Available 24/7, always free!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={() => {
                  const event = new CustomEvent('openChatbot');
                  window.dispatchEvent(event);
                }}
                className="bg-white hover:bg-gray-100 text-travel-orange px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                <Bot className="w-6 h-6" />
                Chat with Anand Buddy Now
              </button>
              <Link 
                to="/contact"
                className="bg-travel-blue-dark hover:bg-travel-blue-dark/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Contact Human Experts
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>+91 8985816481</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>anandtravelsguide@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AITravelAgencyIndia;
