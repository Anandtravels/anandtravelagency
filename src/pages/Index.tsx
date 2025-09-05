
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ServicesSection from "../components/ServicesSection";
import VisaServicesSection from "../components/VisaServicesSection";
import PackagesSection from "../components/PackagesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import QuoteSection from "../components/QuoteSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import FloatingAppIcon from "../components/FloatingAppIcon";

const Index = () => {
  const handleFloatingAppIconClick = () => {
    window.open('https://play.google.com/store/apps/details?id=co.median.android.zrbwdr', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ServicesSection />
        <VisaServicesSection />
        <PackagesSection />
        <TestimonialsSection />
        <QuoteSection />
        <CTASection />
      </main>
      <Footer />
      
      {/* Floating App Download Icon - Homepage Only */}
      <FloatingAppIcon onClick={handleFloatingAppIconClick} />
    </div>
  );
};

export default Index;
