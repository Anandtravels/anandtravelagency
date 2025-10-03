import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Train, Plane, Hotel, Package, Award, Clock, Phone, Mail } from "lucide-react";

const TravelAgencyKakinada = () => {
  useEffect(() => {
    // Update page title and meta tags
    document.title = "Best Travel Agency in Kakinada | Anand Travel Agency - Tour Operators";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Anand Travel Agency is the best travel agency in Kakinada offering expert Tatkal booking, affordable tour packages, flight & hotel reservations, and visa services. Contact +91 88888 88888 for customized travel solutions.");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {/* Hero Section */}
          <div 
            className="relative h-[50vh] min-h-[400px] bg-cover bg-center flex items-center" 
            style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg')" }}
          >
            <div className="container-custom text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Best Travel Agency in Kakinada
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl">
                Your Trusted Travel Partner in Kakinada, Andhra Pradesh - Offering Expert Tatkal Booking, 
                Affordable Tour Packages & Comprehensive Travel Services Since 2023
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/booking" className="btn-primary text-lg px-8 py-3">
                  Book Now
                </Link>
                <Link to="/contact" className="bg-white text-travel-blue-dark hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded-md transition-colors">
                  Get Free Quote
                </Link>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-4">
                  Why Choose Anand Travel Agency in Kakinada?
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                  As the leading travel agency in Kakinada, we have been serving customers with excellence 
                  and dedication. Here's what makes us the best choice for your travel needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                  <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-travel-blue-dark" />
                  </div>
                  <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">1000+ Satisfied Customers</h3>
                  <p className="text-gray-600">
                    Trusted by over 1000 customers in Kakinada and across Andhra Pradesh for their travel needs.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                  <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Train className="w-8 h-8 text-travel-blue-dark" />
                  </div>
                  <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Expert Tatkal Booking</h3>
                  <p className="text-gray-600">
                    Specialized in Tatkal train reservations with high success rate even during peak seasons.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                  <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-travel-blue-dark" />
                  </div>
                  <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">24/7 Customer Support</h3>
                  <p className="text-gray-600">
                    Round-the-clock assistance for all your travel queries and emergency support.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                  <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Plane className="w-8 h-8 text-travel-blue-dark" />
                  </div>
                  <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Flight Booking Services</h3>
                  <p className="text-gray-600">
                    Domestic and international flight bookings with best available fares from Kakinada.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                  <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Hotel className="w-8 h-8 text-travel-blue-dark" />
                  </div>
                  <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Hotel Reservations</h3>
                  <p className="text-gray-600">
                    Exclusive hotel bookings across India and worldwide at competitive prices.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                  <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-travel-blue-dark" />
                  </div>
                  <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Customized Tour Packages</h3>
                  <p className="text-gray-600">
                    Tailored domestic and international tour packages for families, couples, and groups.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-16 bg-gray-50">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-4">
                  Our Travel Services in Kakinada
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                  Anand Travel Agency provides comprehensive travel solutions to customers in Kakinada 
                  and across Andhra Pradesh. From train tickets to complete tour packages, we handle it all.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold text-travel-blue-dark mb-4">Train Ticket Booking</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Normal and Tatkal train reservations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Group booking assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Senior citizen quota bookings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Last-minute Tatkal bookings with high success rate</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold text-travel-blue-dark mb-4">Flight & Hotel Booking</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Domestic and international flights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Best fare guarantee</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Hotel reservations across India</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Budget to luxury accommodation options</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold text-travel-blue-dark mb-4">Tour Packages from Kakinada</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Domestic tour packages (Goa, Kerala, Himachal, Kashmir)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>International packages (Dubai, Singapore, Thailand, Europe)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Customized itineraries based on preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>All-inclusive packages with hotels, transport & meals</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold text-travel-blue-dark mb-4">Additional Services</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Visa assistance and documentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Bus ticket bookings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Cab services for local and outstation travel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-travel-orange font-bold">✓</span>
                      <span>Travel insurance recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* About Kakinada Section */}
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-6">
                    Travel Agency Serving Kakinada Since 2023
                  </h2>
                  <p className="text-gray-600 text-lg mb-4">
                    Founded by Mr. Anand Pinisetty, Anand Travel Agency has quickly become the most trusted 
                    travel partner in Kakinada, Andhra Pradesh. We started with a vision to make travel 
                    accessible, affordable, and hassle-free for everyone in the region.
                  </p>
                  <p className="text-gray-600 text-lg mb-4">
                    Located in the heart of Kakinada, we understand the travel needs of local residents 
                    and provide personalized service that sets us apart from other travel agencies. Our 
                    expertise in Tatkal train bookings has helped thousands of customers secure confirmed 
                    tickets during peak seasons.
                  </p>
                  <p className="text-gray-600 text-lg mb-6">
                    Whether you're planning a family vacation, business trip, or pilgrimage, Anand Travel 
                    Agency is here to make your journey memorable and stress-free.
                  </p>
                  <Link to="/about" className="btn-primary">
                    Learn More About Us
                  </Link>
                </div>
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src="https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg" 
                    alt="Travel Agency Kakinada" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA Section */}
          <section className="py-16 bg-travel-blue-dark text-white">
            <div className="container-custom text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Plan Your Next Trip from Kakinada?
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Contact Anand Travel Agency today for expert travel advice, best prices, and confirmed bookings. 
                Let us handle all your travel arrangements while you focus on creating memories!
              </p>
              
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-travel-orange" />
                  <a href="tel:+918888888888" className="text-xl hover:text-travel-orange transition-colors">
                    +91 88888 88888
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-travel-orange" />
                  <a href="mailto:anandtravelsguide@gmail.com" className="text-xl hover:text-travel-orange transition-colors">
                    anandtravelsguide@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booking" className="bg-travel-orange hover:bg-orange-600 text-white font-medium text-lg px-8 py-3 rounded-md transition-colors">
                  Book Now
                </Link>
                <Link to="/contact" className="bg-white text-travel-blue-dark hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded-md transition-colors">
                  Get Free Quote
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
  );
};

export default TravelAgencyKakinada;
