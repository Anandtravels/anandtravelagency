import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Train, Clock, CheckCircle, Phone, Mail, Shield, Star, Users, Zap } from "lucide-react";

const TatkalTrainTicketsAndhrapradesh = () => {
  useEffect(() => {
    document.title = "Tatkal Train Tickets Andhra Pradesh | Expert Booking Service | Anand Travels";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Book Tatkal train tickets in Andhra Pradesh with Anand Travels. Expert emergency train ticket booking with 24/7 support. High success rate for urgent travel from Kakinada, Vijayawada, Visakhapatnam. Call +91 88888 88888");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div 
          className="relative h-[50vh] min-h-[400px] bg-cover bg-center flex items-center" 
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg')" }}
        >
          <div className="container-custom text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Tatkal Train Tickets in Andhra Pradesh
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl">
              Expert Tatkal Ticket Booking Service | Emergency Train Reservations | 24/7 Support Across AP
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:+918888888888" className="btn-primary text-lg px-8 py-3 inline-block text-center">
                Call Now: +91 88888 88888
              </a>
              <Link to="/booking" className="bg-white text-travel-blue-dark hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded-md transition-colors inline-block text-center">
                Book Tatkal Ticket Online
              </Link>
            </div>
          </div>
        </div>

        {/* Introduction Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-6">
                Need Tatkal Train Tickets in Andhra Pradesh? We've Got You Covered!
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Are you facing an emergency travel situation in Andhra Pradesh and need confirmed train tickets immediately? 
                Anand Travels specializes in <strong>Tatkal train ticket booking across Andhra Pradesh</strong>, helping thousands 
                of passengers secure last-minute reservations even during peak travel seasons.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Based in Kakinada, we serve travelers across all major cities in Andhra Pradesh including <strong>Vijayawada, 
                Visakhapatnam, Tirupati, Guntur, Rajahmundry, Nellore, Kurnool,</strong> and <strong>Anantapur</strong>. Our expert 
                team understands the urgency of emergency travel and works round-the-clock to ensure you get confirmed Tatkal tickets.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                With over <strong>1000+ satisfied customers</strong> and a <strong>high success rate for Tatkal bookings</strong>, 
                Anand Travels is your most reliable partner for urgent train ticket reservations in Andhra Pradesh.
              </p>

              <div className="bg-travel-orange/10 border-l-4 border-travel-orange p-6 rounded-r-lg">
                <p className="text-lg font-semibold text-travel-blue-dark">
                  ⚡ Book Tatkal tickets 2 hours before departure with our expert assistance!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-4">
                Why Choose Anand Travels for Tatkal Train Tickets in Andhra Pradesh?
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                We're not just a booking service – we're your emergency travel partners who understand the stress 
                of last-minute travel planning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-travel-orange" />
                </div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Lightning Fast Booking</h3>
                <p className="text-gray-600">
                  Expert agents trained to secure Tatkal tickets within seconds of booking window opening at 10 AM (AC) and 11 AM (Non-AC).
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-travel-orange" />
                </div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">High Success Rate</h3>
                <p className="text-gray-600">
                  95%+ success rate for Tatkal bookings. We use advanced techniques and multiple booking strategies.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-travel-orange" />
                </div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">24/7 Emergency Support</h3>
                <p className="text-gray-600">
                  Round-the-clock availability for urgent bookings. Call us anytime for emergency train ticket assistance.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-travel-orange" />
                </div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">1000+ Happy Customers</h3>
                <p className="text-gray-600">
                  Trusted by travelers across Andhra Pradesh for reliable and confirmed Tatkal ticket bookings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Coverage */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-8 text-center">
              Tatkal Ticket Booking Services Across Andhra Pradesh
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold text-travel-blue-dark mb-6">Cities We Serve in AP</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Kakinada</strong> - Tatkal bookings from Kakinada Town & Kakinada Port stations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Vijayawada</strong> - Emergency train tickets from Vijayawada Junction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Visakhapatnam</strong> - Tatkal reservations from Vizag station</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Tirupati</strong> - Urgent bookings for pilgrimage travel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Guntur</strong> - Last-minute train ticket assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Rajahmundry, Nellore, Kurnool, Anantapur</strong> - Complete AP coverage</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold text-travel-blue-dark mb-6">Popular Routes from AP</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Train className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Andhra Pradesh to <strong>Hyderabad, Secunderabad</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Train className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700">AP to <strong>Bangalore, Chennai, Mumbai, Delhi</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Train className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Coastal AP to <strong>Kolkata, Bhubaneswar, Puri</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Train className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Vijayawada to all major cities across India</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Train className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Tirupati pilgrimage routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Train className="w-5 h-5 text-travel-orange mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Inter-state and intra-state emergency bookings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-travel-blue-dark text-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              How to Book Tatkal Train Tickets in Andhra Pradesh with Anand Travels
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-travel-orange w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
                <p className="text-gray-300">
                  Call +91 88888 88888 or WhatsApp us with your travel details and passenger information.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-travel-orange w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Share Details</h3>
                <p className="text-gray-300">
                  Provide journey date, train preference, passenger names, age, and ID proof details.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-travel-orange w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">We Book Instantly</h3>
                <p className="text-gray-300">
                  Our experts book your Tatkal ticket the moment booking window opens with advanced strategies.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-travel-orange w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-3">Get Confirmation</h3>
                <p className="text-gray-300">
                  Receive instant confirmation via SMS, email, and WhatsApp. Travel stress-free!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-travel-blue-dark mb-12 text-center">
              Frequently Asked Questions About Tatkal Train Tickets in Andhra Pradesh
            </h2>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">
                  What time does Tatkal booking start in Andhra Pradesh?
                </h3>
                <p className="text-gray-700">
                  Tatkal booking starts at <strong>10:00 AM for AC classes</strong> and <strong>11:00 AM for Non-AC classes</strong> 
                  for trains departing the next day. Our agents are ready before these timings to secure your tickets immediately.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">
                  How much do Tatkal train ticket booking services cost in AP?
                </h3>
                <p className="text-gray-700">
                  Our service charges are minimal and transparent. Tatkal ticket prices include Indian Railways' Tatkal charges plus 
                  our service fee. Contact us at +91 88888 88888 for exact pricing based on your journey.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">
                  Can you book Tatkal tickets from Vijayawada to Hyderabad?
                </h3>
                <p className="text-gray-700">
                  Yes! We specialize in Tatkal bookings for the popular <strong>Vijayawada to Hyderabad route</strong> on trains 
                  like Duronto, Satavahana, and other super-fast trains. High success rate even during peak hours.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">
                  Do you provide emergency train tickets for medical emergencies in AP?
                </h3>
                <p className="text-gray-700">
                  Absolutely. We understand the urgency of medical emergencies. Our 24/7 support team prioritizes emergency 
                  bookings and can also assist with Medical Quota tickets when applicable.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">
                  What documents do I need for Tatkal train booking in Andhra Pradesh?
                </h3>
                <p className="text-gray-700">
                  You need: <strong>Valid ID proof</strong> (Aadhar Card, PAN Card, Passport, or Voter ID), passenger names 
                  as per ID, age, gender, and mobile number. Send scanned copies via WhatsApp for quick processing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">
                  Can you book Premium Tatkal tickets from Andhra Pradesh?
                </h3>
                <p className="text-gray-700">
                  Yes, we book both regular Tatkal and <strong>Premium Tatkal tickets</strong> from all stations in Andhra Pradesh. 
                  Premium Tatkal has higher fares but dynamic pricing and better availability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-travel-orange text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need Emergency Train Tickets in Andhra Pradesh? We're Here 24/7!
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Don't let last-minute travel stress you out. Let Anand Travels handle your Tatkal bookings 
              with expert assistance and guaranteed support.
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6" />
                <a href="tel:+918888888888" className="text-2xl hover:underline font-semibold">
                  +91 88888 88888
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <a href="mailto:anandtravelsguide@gmail.com" className="text-xl hover:underline">
                  anandtravelsguide@gmail.com
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+918888888888" className="bg-white text-travel-orange hover:bg-gray-100 font-bold text-lg px-8 py-3 rounded-md transition-colors inline-block">
                Call Now for Instant Booking
              </a>
              <Link to="/booking" className="bg-travel-blue-dark text-white hover:bg-travel-blue-medium font-medium text-lg px-8 py-3 rounded-md transition-colors inline-block">
                Book Online
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TatkalTrainTicketsAndhrapradesh;
