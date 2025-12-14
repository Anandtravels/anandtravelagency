
import { Link } from "react-router-dom";
import { trackButtonClick } from "@/services/clickTracker";

const HeroSection = () => {
  return (
    <div className="relative h-[93vh] min-h-[600px] bg-cover bg-center flex items-center" 
         style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg')" }}>
      <div className="container-custom text-white text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Best Travel Agency in Kakinada <br className="hidden md:block" />
          <span className="text-3xl md:text-4xl lg:text-5xl">Your Gateway to Seamless Travel Across India</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Expert Tatkal Booking, Affordable Tour Packages, Flight & Hotel Reservations - Trusted by 1000+ Customers
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/booking" 
            className="btn-primary text-lg px-8 py-3"
            onClick={() => trackButtonClick("Book Now - Hero")}
          >
            Book Now
          </Link>
          <Link 
            to="/packages" 
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium text-lg px-8 py-3 rounded-md transition-colors"
            onClick={() => trackButtonClick("Explore Packages - Hero")}
          >
            Explore Packages
          </Link>
        </div>
        
        {/* Contact Now Button with WhatsApp Redirect */}
        <div className="mt-8 animate-pulse">
          <a 
            href="https://wa.me/918985816481?text=Hi%2C%20I%20would%20like%20to%20inquire%20about%20your%20travel%20services." 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-3 rounded-md transition-colors shadow-lg inline-flex items-center gap-2"
            onClick={() => trackButtonClick("Contact WhatsApp - Hero")}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Contact Now
            <span className="text-xs bg-white text-green-600 rounded px-2 py-0.5">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
