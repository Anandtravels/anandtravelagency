import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, MapPin, Star } from "lucide-react";
import { useDynamicPackages } from "@/hooks/useDynamicPackages";
import { trackButtonClick } from "@/services/clickTracker";

// Auto-scrolling image carousel component
const AutoScrollCarousel = ({ images, alt }: { images: string[], alt: string }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  return (
    <div 
      className="relative h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={images[currentImageIndex] || '/placeholder.svg'} 
        alt={alt} 
        className="w-full h-full object-cover transition-opacity duration-500"
      />
      {/* Indicator Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 bg-black bg-opacity-40 px-2 py-1 rounded-full backdrop-blur-sm">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white bg-opacity-50 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PackagesSection = () => {
  const [activeTab, setActiveTab] = useState("domestic");
  const { packages, loading, error, getDomesticPackages, getInternationalPackages, getFeaturedPackages } = useDynamicPackages();
  
  // Get packages based on active tab
  const getDynamicPackages = () => {
    if (activeTab === "domestic") {
      const domesticPackages = getDomesticPackages();
      return domesticPackages.slice(0, 4); // Limit to 4 packages for homepage
    } else {
      const internationalPackages = getInternationalPackages();
      return internationalPackages.slice(0, 3); // Limit to 3 packages for homepage
    }
  };

  const currentPackages = getDynamicPackages();

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Affordable Tour Packages from Kakinada - Domestic & International</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore the best travel packages in India with Anand Travel Agency. We offer customized domestic and international tour packages 
            with all-inclusive options for families, couples, and groups. Book affordable holiday packages from Kakinada today!
          </p>
          
          <div className="flex justify-center mt-8 mb-10">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setActiveTab("domestic")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "domestic" 
                    ? "bg-white text-travel-blue-dark shadow-sm" 
                    : "text-gray-600 hover:text-travel-blue-dark"
                }`}
              >
                Domestic Packages
              </button>
              <button
                onClick={() => setActiveTab("international")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "international" 
                    ? "bg-white text-travel-blue-dark shadow-sm" 
                    : "text-gray-600 hover:text-travel-blue-dark"
                }`}
              >
                International Packages
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">Error loading packages</p>
            <p className="text-gray-600">Please try again later</p>
          </div>
        ) : currentPackages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">No packages available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPackages.map((pkg) => (
              <Link 
                key={pkg.id} 
                to={`/packages/${pkg.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-[520px] group cursor-pointer"
                onClick={() => trackButtonClick(`View Package - ${pkg.title}`)}
              >
                {/* Auto-Scrolling Image Carousel */}
                <div className="h-56 overflow-hidden relative">
                  <AutoScrollCarousel images={pkg.images} alt={pkg.title} />
                  {/* Image Counter Badge */}
                  {pkg.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm z-10">
                      📷 {pkg.images.length} photos
                    </div>
                  )}
                </div>
                
                {/* Fixed Height Content Area */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-travel-blue-dark line-clamp-2 flex-1">{pkg.title}</h3>
                    <span className="bg-travel-orange text-white text-sm font-medium px-2 py-1 rounded ml-2 whitespace-nowrap">
                      {pkg.days}
                    </span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin size={16} className="text-travel-blue-medium flex-shrink-0" />
                    <span className="truncate">{pkg.location}</span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{pkg.rating || 4.5}</span>
                    <span className="text-gray-500 text-sm">({pkg.reviews || 0} reviews)</span>
                  </div>
                  
                  {/* Scrollable Highlights - Fixed Height */}
                  <div className="mb-4 flex-1">
                    <p className="font-medium text-gray-800 text-sm mb-1">Highlights:</p>
                    <div className="h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pkg.highlights.slice(0, 5).map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-travel-orange mt-0.5">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Footer - Price and Button */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                    <div className="text-travel-blue-dark">
                      <span className="text-xs text-gray-500">Starting from</span>
                      <p className="text-xl font-bold">₹{pkg.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-travel-blue-dark group-hover:bg-travel-blue-medium text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link 
            to="/packages" 
            className="btn-primary"
            onClick={() => trackButtonClick("View All Packages")}
          >
            View All Packages
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
