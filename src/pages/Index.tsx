
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ServicesSection from "../components/ServicesSection";
import PackagesSection from "../components/PackagesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import QuoteSection from "../components/QuoteSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ServicesSection />
        <PackagesSection />
        <TestimonialsSection />
        <QuoteSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
