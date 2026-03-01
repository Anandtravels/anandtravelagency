import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Linkedin, Globe, MessageSquare, Youtube, AtSign, Camera } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-travel-blue-dark text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Anand Travel Agency</h3>
            <p className="text-gray-300 mb-4">
              Your gateway to seamless travel across India and beyond. We specialize in train reservations, 
              bus bookings, flight tickets, and curated travel packages for the perfect journey.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a 
                href="https://www.linkedin.com/in/anand-pinisetty-656583359/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-travel-orange transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://www.instagram.com/anandtravels.agency/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-travel-orange transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61580145898379" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-travel-orange transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://x.com/anandtravelss" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-travel-orange transition-colors"
                aria-label="Twitter / X"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://youtube.com/@anandtravelagency?si=mWr0Cbtll8MjVMhi" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-travel-orange transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a 
                href="https://www.threads.com/@anandtravels.agency" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-travel-orange transition-colors"
                aria-label="Threads"
              >
                <AtSign size={20} />
              </a>
              <a 
                href="https://www.snapchat.com/add/anandtravelagen?share_id=5zmnWL-HyQ8&locale=en-US" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-travel-orange transition-colors"
                aria-label="Snapchat"
              >
                <Camera size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/packages" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Hotel Booking
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Book Now
                </Link>
              </li>
              <li>
                <Link to="/travel-agency-kakinada" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Travel Agency Kakinada
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-travel-orange transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services#train" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Train Ticket Reservations
                </Link>
              </li>
              <li>
                <Link to="/services#tatkal" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Tatkal Bookings
                </Link>
              </li>
              <li>
                <Link to="/services#bus" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Bus Ticket Bookings
                </Link>
              </li>
              <li>
                <Link to="/services#flight" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Flight Ticket Bookings
                </Link>
              </li>
              <li>
                <Link to="/packages" className="text-gray-300 hover:text-travel-orange transition-colors">
                  Tour Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-travel-orange mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-300">
                  Kakinada, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-travel-orange flex-shrink-0" size={18} />
                <a href="tel:+918985816481" className="text-gray-300 hover:text-travel-orange transition-colors">
                  +91 8985816481
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="text-travel-orange flex-shrink-0" size={18} />
                <a href="https://wa.me/918985816481" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-travel-orange transition-colors">
                  WhatsApp: +91 8985816481
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-travel-orange flex-shrink-0" size={18} />
                <a href="mailto:anandtravelsguide@gmail.com" className="text-gray-300 hover:text-travel-orange transition-colors">
                  anandtravelsguide@gmail.com
                </a>
              </li>
            </ul>

            {/* Google Review */}
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-2">Leave a Review</h4>
              <a 
                href="https://g.page/r/CRF3AUEXTuzdEAE/review" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-travel-orange hover:bg-travel-orange/90 text-white px-4 py-2 rounded-md transition-colors"
              >
                <Globe size={18} />
                <span>Google Review</span>
              </a>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-2">Subscribe to Newsletter</h4>
              <div className="flex mt-2">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="bg-travel-blue-medium text-white placeholder:text-gray-400 px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-travel-orange"
                />
                <button className="bg-travel-orange hover:bg-travel-orange/90 text-white px-4 py-2 rounded-r-md transition-colors">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-travel-blue-medium mt-12 pt-6 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()} Anand Travel Agency. All Rights Reserved. <br />
            Designed & Developed By{" "}
            <a 
              href="https://thedreamteamservices.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-travel-orange hover:text-white transition-colors"
            >
              DREAM TEAM SERVICES
            </a>
          </p>
          <div className="mt-2 text-sm space-x-4">
            <Link to="/privacy" className="hover:text-travel-orange transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-travel-orange transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/faq" className="hover:text-travel-orange transition-colors">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
