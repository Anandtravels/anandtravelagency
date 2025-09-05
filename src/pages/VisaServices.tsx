import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VisaServicesSection from "../components/VisaServicesSection";

const VisaServices = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <VisaServicesSection />
      </main>
      <Footer />
    </div>
  );
};

export default VisaServices;
