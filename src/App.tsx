import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import Packages from "./pages/Packages";
import Booking from "./pages/Booking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PackageDetail from "./pages/DynamicPackageDetail";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import EServices from "./pages/EServices";
import EServiceApplication from "./pages/EServiceApplication";
import EServiceSuccess from "./pages/EServiceSuccess";
import VisaServices from "./pages/VisaServices";
// Hotel related imports
import Hotels from "./pages/Hotels";
import HotelDetail from "./pages/HotelDetail";
import HotelBookingSuccess from "./pages/HotelBookingSuccess";
import TravelAgencyKakinada from "./pages/TravelAgencyKakinada";
import TatkalTrainTicketsAndhraPradesh from "./pages/TatkalTrainTicketsAndhraPradesh";
import AITravelAgencyIndia from "./pages/AITravelAgencyIndia";
import InvoicePrint from "./pages/InvoicePrint";
import Careers from "./pages/Careers";
import logo from './assets/poster.png';
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import AuthAccountCreator from './components/AuthAccountCreator';
import CouponManager from "./pages/admin/CouponManager";
import VisitorTracker from "@/services/visitorTracker";
import { initializeAppCoupons } from "@/services/appCouponService";
import ConditionalChatBot from "@/components/ConditionalChatBot";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [visitorTracker, setVisitorTracker] = useState<VisitorTracker | null>(null);

  useEffect(() => {
    // Hide body scroll during loading
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute('href', logo);
    }

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, [loading]);

  // Initialize visitor tracking when app is loaded
  useEffect(() => {
    if (!loading && !visitorTracker) {
      const tracker = new VisitorTracker();
      setVisitorTracker(tracker);

      // Initialize app coupons
      initializeAppCoupons().catch(console.error);

      // Cleanup on unmount
      return () => {
        tracker.destroy();
      };
    }
  }, [loading, visitorTracker]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AnimatePresence mode="wait">
            {loading && <LoadingScreen />}
          </AnimatePresence>
          <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
            <Toaster />
            <Sonner />
            <AuthAccountCreator />
            
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ConditionalChatBot />
              
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/packages/:id" element={<PackageDetail />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/visa-services" element={<VisaServices />} />
                <Route path="/eservices" element={<EServices />} />
                <Route path="/eservices/apply/:serviceType" element={<EServiceApplication />} />
                <Route path="/eservices/success" element={<EServiceSuccess />} />
                
                {/* Hotel routes */}
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/:id" element={<HotelDetail />} />
                <Route path="/hotel-booking-success" element={<HotelBookingSuccess />} />
                
                {/* SEO-Friendly Landing Pages */}
                <Route path="/travel-agency-kakinada" element={<TravelAgencyKakinada />} />
                <Route path="/tatkal-train-tickets-andhra-pradesh" element={<TatkalTrainTicketsAndhraPradesh />} />
                <Route path="/ai-travel-agency-india" element={<AITravelAgencyIndia />} />
                
                {/* Invoice Print Page */}
                <Route path="/invoice-print" element={<InvoicePrint />} />
                
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/faq" element={<FAQ />} />
                
                {/* Add Coupon Manager route */}
                <Route path="/admin/coupons" element={<CouponManager />} />
                
                {/* Add a redirect for /agent to /agent-login */}
                <Route path="/agent" element={<Navigate to="/agent-login" replace />} />
                <Route path="/agent-login" element={<AgentLogin />} />
                <Route path="/agent-dashboard" element={<AgentDashboard />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
