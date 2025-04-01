
import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, MapPin } from "lucide-react";

const PackagesSection = () => {
  const [activeTab, setActiveTab] = useState("domestic");
  
  const domesticPackages = [
    {
      id: 1,
      title: "Magical Kashmir",
      image: "https://images.pexels.com/photos/5708072/pexels-photo-5708072.jpeg",
      days: "5N/6D",
      price: "₹35,999",
      location: "Srinagar, Gulmarg, Pahalgam",
      highlights: "Shikara Ride, Mughal Gardens, Gondola Ride"
    },
    {
      id: 2,
      title: "Kerala Backwaters",
      image: "https://images.pexels.com/photos/1310788/pexels-photo-1310788.jpeg",
      days: "4N/5D",
      price: "₹25,999",
      location: "Kochi, Munnar, Alleppey",
      highlights: "Houseboat Stay, Tea Plantations, Kathakali Show"
    },
    {
      id: 3,
      title: "Goa Beach Vacation",
      image: "https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg",
      days: "3N/4D",
      price: "₹18,999",
      location: "North & South Goa",
      highlights: "Beach Activities, Cruise, Old Goa Churches"
    }
  ];
  
  const internationalPackages = [
    {
      id: 4,
      title: "Amazing Thailand",
      image: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg",
      days: "6N/7D",
      price: "₹65,999",
      location: "Bangkok, Pattaya, Phuket",
      highlights: "Phi Phi Islands, Buddha Temple, Floating Market"
    },
    {
      id: 5,
      title: "Dubai Extravaganza",
      image: "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg",
      days: "5N/6D",
      price: "₹75,999",
      location: "Dubai, Abu Dhabi",
      highlights: "Desert Safari, Burj Khalifa, Ferrari World"
    },
    {
      id: 6,
      title: "Malaysia & Singapore",
      image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
      days: "7N/8D",
      price: "₹85,999",
      location: "Kuala Lumpur, Singapore",
      highlights: "Universal Studios, Petronas Towers, Sentosa Island"
    }
  ];
  
  const currentPackages = activeTab === "domestic" ? domesticPackages : internationalPackages;

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Featured Tour Packages</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Discover our handpicked selection of tour packages designed to give you unforgettable experiences and memories.
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={pkg.image} 
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
                  <span className="font-medium">Highlights:</span> {pkg.highlights}
                </p>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-travel-blue-dark">
                    <span className="text-sm">Starting from</span>
                    <p className="text-xl font-bold">{pkg.price}</p>
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
