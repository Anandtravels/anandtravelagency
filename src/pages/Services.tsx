
import { useState } from "react";
import { Plane, Train, Bus, Car, Package, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuoteSection from "../components/QuoteSection";
import { Link } from "react-router-dom";

const Services = () => {
  const [activeTab, setActiveTab] = useState("train");
  
  const services = [
    {
      id: "train",
      title: "Train Ticket Reservations",
      icon: <Train className="w-16 h-16 text-travel-orange" />,
      description: "We specialize in both normal and Tatkal train reservations across India. Our expert team ensures you get confirmed tickets even during peak seasons.",
      features: [
        "Normal and Tatkal ticket bookings",
        "Higher success rate for Tatkal bookings",
        "Group booking assistance",
        "Senior citizen and special quota applications",
        "Last-minute travel solutions"
      ],
      image: "https://images.pexels.com/photos/2031758/pexels-photo-2031758.jpeg"
    },
    {
      id: "bus",
      title: "Bus Ticket Bookings",
      icon: <Bus className="w-16 h-16 text-travel-orange" />,
      description: "Book comfortable and reliable bus services across all major routes in India with our comprehensive bus booking services.",
      features: [
        "AC and Non-AC bus options",
        "Sleeper and seater categories",
        "All major operators covered",
        "Door pickup available for select routes",
        "Group discounts available"
      ],
      image: "https://images.pexels.com/photos/68629/pexels-photo-68629.jpeg"
    },
    {
      id: "flight",
      title: "Flight Ticket Bookings",
      icon: <Plane className="w-16 h-16 text-travel-orange" />,
      description: "Get the best deals on domestic and international flight bookings with our competitive pricing and expert assistance.",
      features: [
        "Domestic and international flights",
        "Competitive fare comparison",
        "Web check-in assistance",
        "Group booking discounts",
        "Emergency booking assistance"
      ],
      image: "https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg"
    },
    {
      id: "cab",
      title: "Cab Services",
      icon: <Car className="w-16 h-16 text-travel-orange" />,
      description: "Travel comfortably with our reliable cab services available for intercity travel and local sightseeing across major destinations.",
      features: [
        "Airport transfers",
        "City-to-city travel",
        "Local sightseeing packages",
        "Corporate travel solutions",
        "24/7 customer support"
      ],
      image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg"
    },
    {
      id: "tour",
      title: "Tour Packages",
      icon: <Package className="w-16 h-16 text-travel-orange" />,
      description: "Discover our curated domestic and international tour packages designed to give you unforgettable experiences and memories.",
      features: [
        "Domestic and international packages",
        "Customizable itineraries",
        "All-inclusive options",
        "Group tour discounts",
        "Honeymoon special packages"
      ],
      image: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"
    }
  ];
  
  const currentService = services.find(service => service.id === activeTab) || services[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[300px] bg-cover bg-center flex items-center" 
             style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://source.unsplash.com/photo-1590523741831-ab7e8b8f9c7f')" }}>
          <div className="container-custom text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Comprehensive travel solutions to make your journey seamless and memorable
            </p>
          </div>
        </div>
        
        {/* Services Navigation */}
        <div className="bg-gray-100 py-4 sticky top-0 z-30 border-b border-gray-200">
          <div className="container-custom">
            <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setActiveTab(service.id)}
                  className={`px-5 py-2 rounded-md whitespace-nowrap transition-colors ${
                    activeTab === service.id
                      ? "bg-travel-blue-dark text-white"
                      : "bg-white text-travel-blue-dark hover:bg-gray-200"
                  }`}
                >
                  {service.title}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Service Detail Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  {currentService.icon}
                  <h2 className="text-3xl font-bold text-travel-blue-dark">{currentService.title}</h2>
                </div>
                <p className="text-gray-700 text-lg mb-8">{currentService.description}</p>
                
                <h3 className="text-xl font-semibold text-travel-blue-medium mb-4">Key Features:</h3>
                <ul className="space-y-3 mb-8">
                  {currentService.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-travel-orange font-bold mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Link 
                    to={currentService.id === "tour" ? "/packages" : "/booking"} 
                    className="btn-primary text-lg"
                  >
                    {currentService.id === "tour" ? "Explore Packages" : "Book Now"}
                  </Link>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={currentService.image} 
                  alt={currentService.title} 
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Tatkal Booking Highlight for Train Tab */}
        {activeTab === "train" && (
          <section className="py-16 bg-gray-50">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="section-title">Our Tatkal Booking Expertise</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  With years of specialized experience in IRCTC Tatkal bookings, we offer the highest success rate
                  in securing confirmed tickets even during peak seasons.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-travel-blue-dark mb-6">
                      Why Choose Us for Tatkal Bookings?
                    </h3>
                    
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="text-travel-orange font-bold mt-1 text-xl">✓</span>
                        <div>
                          <span className="font-semibold text-travel-blue-medium">Lightning-Fast Processing</span>
                          <p className="text-gray-600">Our expert team and optimized systems ensure the quickest Tatkal booking processing when the window opens.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-travel-orange font-bold mt-1 text-xl">✓</span>
                        <div>
                          <span className="font-semibold text-travel-blue-medium">Higher Success Rate</span>
                          <p className="text-gray-600">We achieve over 90% success rate for Tatkal bookings even during peak seasons and on high-demand routes.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-travel-orange font-bold mt-1 text-xl">✓</span>
                        <div>
                          <span className="font-semibold text-travel-blue-medium">Tatkal Premium Service</span>
                          <p className="text-gray-600">For urgent travel needs, our premium service offers priority processing and multiple booking attempts.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-travel-orange font-bold mt-1 text-xl">✓</span>
                        <div>
                          <span className="font-semibold text-travel-blue-medium">Experienced Specialists</span>
                          <p className="text-gray-600">Our team has years of experience with IRCTC's Tatkal booking system and knows all the strategies for successful bookings.</p>
                        </div>
                      </li>
                    </ul>
                    
                    <div className="mt-8">
                      <Link to="/booking" className="btn-primary">Book Tatkal Tickets</Link>
                    </div>
                  </div>
                  
                  <div className="bg-cover bg-center h-full min-h-[400px]" 
                       style={{ backgroundImage: "url('https://source.unsplash.com/photo-1517388575046-797e6c76f0c3')" }}>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* General CTA Section */}
        <section className="py-16 bg-travel-blue-dark text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Our Services?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Contact us today to book your next journey or get a customized quote for your travel needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="btn-primary text-lg px-8 py-3">
                Book Now
              </Link>
              <Link to="/contact" className="bg-white text-travel-blue-dark hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded-md transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
