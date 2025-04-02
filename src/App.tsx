import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import Packages from "./pages/Packages";
import Booking from "./pages/Booking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PackageDetail from "./pages/PackageDetail";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import AgentLogin from "./pages/AgentLogin";
import logo from './assets/poster.png';
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);

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
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/packages/:id" element={<PackageDetail />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/agent" element={<AgentLogin />} />
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
