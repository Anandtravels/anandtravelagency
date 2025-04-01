import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png"; // Update logo import

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        {/* Main navbar */}
        <div className="py-2 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src={logo}  // Updated to use imported logo
              alt="Anand Travel Agency" 
              className="h-12 md:h-20 w-auto object-contain" // Increased height and added object-contain
            />
          </Link>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors">
              Home
            </Link>
            <Link to="/services" className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors">
              Services
            </Link>
            <Link to="/packages" className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors">
              Packages
            </Link>
            <Link to="/booking" className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors">
              Booking
            </Link>
            <Link to="/about" className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors">
              Contact
            </Link>
            <Link to="/booking" className="btn-primary">
              Book Now
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            type="button" 
            className="md:hidden text-travel-blue-dark p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute w-full border-b border-gray-200 shadow-md animate-fade-in">
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/packages" 
              className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Packages
            </Link>
            <Link 
              to="/booking" 
              className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Booking
            </Link>
            <Link 
              to="/about" 
              className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="font-medium text-travel-blue-dark hover:text-travel-orange transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/booking" 
              className="btn-primary text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
