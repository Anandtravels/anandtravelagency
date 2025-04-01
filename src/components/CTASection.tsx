
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="bg-travel-blue-dark text-white rounded-lg p-10 md:p-16 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 20 L40 20 M20 0 L20 40" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern)" />
            </svg>
          </div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Book Your Next Adventure?</h2>
            <p className="text-xl mb-8">
              Limited Tatkal tickets available daily! Contact us now to secure your reservation and travel worry-free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="btn-primary text-lg px-8 py-3">
                Book Now
              </Link>
              <Link to="/contact" className="bg-white text-travel-blue-dark hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded-md transition-colors">
                Contact Us
              </Link>
            </div>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-travel-orange font-semibold text-lg mb-2">Tatkal Bookings</h3>
                <p>Expert assistance for confirmed Tatkal tickets even during peak seasons.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-travel-orange font-semibold text-lg mb-2">Tour Packages</h3>
                <p>Customized itineraries for domestic and international destinations.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-travel-orange font-semibold text-lg mb-2">24/7 Support</h3>
                <p>Round-the-clock assistance for all your travel-related queries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
