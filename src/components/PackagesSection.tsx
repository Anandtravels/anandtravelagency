import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, MapPin } from "lucide-react";
import { useDynamicPackages } from "@/hooks/useDynamicPackages";

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
              <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={pkg.images[0] || '/placeholder.svg'} 
                    alt={pkg.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-travel-blue-dark">{pkg.title}</h3>
                    <span className="bg-travel-orange text-white text-sm font-medium px-2 py-1 rounded">
                      {pkg.days}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin size={16} className="text-travel-blue-medium" />
                    <span>{pkg.location}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">Highlights:</span> {pkg.highlights.join(', ')}
                  </p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-travel-blue-dark">
                      <span className="text-sm">Starting from</span>
                      <p className="text-xl font-bold">₹{pkg.price.toLocaleString('en-IN')}</p>
                    </div>
                    <Link 
                      to={`/packages/${pkg.id}`} 
                      className="bg-travel-blue-dark hover:bg-travel-blue-medium text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link to="/packages" className="btn-primary">
            View All Packages
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
