
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative h-[90vh] min-h-[600px] bg-cover bg-center flex items-center" 
         style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg')" }}>
      <div className="container-custom text-white text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Your Gateway to Seamless Travel <br className="hidden md:block" />
          Across India and Beyond
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Expert Tatkal Booking, Exclusive Tour Packages, and Comprehensive Travel Services
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/booking" className="btn-primary text-lg px-8 py-3">
            Book Now
          </Link>
          <Link to="/packages" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium text-lg px-8 py-3 rounded-md transition-colors">
            Explore Packages
          </Link>
        </div>
        
        {/* Added Get a Free Quote Button as requested with high priority */}
        <div className="mt-8 animate-pulse">
          <Link 
            to="/contact" 
            className="bg-travel-orange text-white font-bold text-lg px-8 py-3 rounded-md transition-colors shadow-lg hover:bg-orange-600 inline-flex items-center"
          >
            Get a Free Quote
            <span className="ml-2 text-xs bg-white text-travel-orange rounded px-2 py-0.5">HIGH PRIORITY</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
