
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuoteSection from "../components/QuoteSection";

// This would normally come from the database
const packagesData = {
  domestic: [
    {
      id: 1,
      title: "Magical Kashmir",
      image: "https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg",
      days: "5N/6D",
      price: "₹35,999",
      location: "Srinagar, Gulmarg, Pahalgam",
      rating: 4.8,
      reviews: 124,
      highlights: "Shikara Ride, Mughal Gardens, Gondola Ride, Betaab Valley, Chandanwari",
      category: "domestic"
    },
    {
      id: 2,
      title: "Kerala Backwaters",
      image: "https://images.pexels.com/photos/1310788/pexels-photo-1310788.jpeg",
      days: "4N/5D",
      price: "₹25,999",
      location: "Kochi, Munnar, Alleppey",
      rating: 4.9,
      reviews: 186,
      highlights: "Houseboat Stay, Tea Plantations, Kathakali Show, Spice Gardens, Periyar Wildlife",
      category: "domestic"
    },
    {
      id: 3,
      title: "Golden Triangle",
      image: "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg",
      days: "6N/7D",
      price: "₹28,999",
      location: "Delhi, Agra, Jaipur",
      rating: 4.7,
      reviews: 152,
      highlights: "Taj Mahal, Red Fort, Amber Fort, Qutub Minar, Hawa Mahal, City Palace",
      category: "domestic"
    },
    {
      id: 4,
      title: "Goa Beach Vacation",
      image: "https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg",
      days: "3N/4D",
      price: "₹18,999",
      location: "North & South Goa",
      rating: 4.6,
      reviews: 210,
      highlights: "Beach Activities, Sunset Cruise, Old Goa Churches, Dudhsagar Falls, Water Sports",
      category: "domestic"
    },
    {
      id: 5,
      title: "Andaman Islands",
      image: "https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg",
      days: "5N/6D",
      price: "₹32,999",
      location: "Port Blair, Havelock, Neil Island",
      rating: 4.9,
      reviews: 96,
      highlights: "Radhanagar Beach, Cellular Jail, Scuba Diving, Glass Bottom Boat, Ross Island",
      category: "domestic"
    },
    {
      id: 6,
      title: "Himalayan Retreat",
      image: "https://images.pexels.com/photos/2440021/pexels-photo-2440021.jpeg",
      days: "7N/8D",
      price: "₹42,999",
      location: "Manali, Shimla, Dharamshala",
      rating: 4.7,
      reviews: 78,
      highlights: "Solang Valley, Mall Road, Hidimba Temple, McLeodganj, Paragliding, Rohtang Pass",
      category: "domestic"
    }
  ],
  international: [
    {
      id: 7,
      title: "Amazing Thailand",
      image: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg",
      days: "6N/7D",
      price: "₹65,999",
      location: "Bangkok, Pattaya, Phuket",
      rating: 4.8,
      reviews: 156,
      highlights: "Phi Phi Islands, Buddha Temple, Floating Market, Coral Island, Safari World",
      category: "international"
    },
    {
      id: 8,
      title: "Dubai Extravaganza",
      image: "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg",
      days: "5N/6D",
      price: "₹75,999",
      location: "Dubai, Abu Dhabi",
      rating: 4.9,
      reviews: 143,
      highlights: "Desert Safari, Burj Khalifa, Ferrari World, Dubai Mall, Miracle Garden",
      category: "international"
    },
    {
      id: 9,
      title: "Malaysia & Singapore",
      image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
      days: "7N/8D",
      price: "₹85,999",
      location: "Kuala Lumpur, Singapore",
      rating: 4.7,
      reviews: 124,
      highlights: "Universal Studios, Petronas Towers, Sentosa Island, Gardens by the Bay",
      category: "international"
    },
    {
      id: 10,
      title: "Bali Paradise",
      image: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg",
      days: "6N/7D",
      price: "₹70,999",
      location: "Kuta, Ubud, Nusa Dua",
      rating: 4.8,
      reviews: 189,
      highlights: "Tanah Lot Temple, Ubud Monkey Forest, Kuta Beach, Rice Terraces, Water Sports",
      category: "international"
    },
    {
      id: 11,
      title: "European Dreams",
      image: "https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg",
      days: "10N/11D",
      price: "₹1,50,999",
      location: "Paris, Switzerland, Rome",
      rating: 4.9,
      reviews: 86,
      highlights: "Eiffel Tower, Swiss Alps, Colosseum, Vatican City, Seine River Cruise",
      category: "international"
    },
    {
      id: 12,
      title: "Vietnam & Cambodia",
      image: "https://images.pexels.com/photos/5191375/pexels-photo-5191375.jpeg",
      days: "8N/9D",
      price: "₹90,999",
      location: "Hanoi, Ho Chi Minh, Siem Reap",
      rating: 4.7,
      reviews: 72,
      highlights: "Ha Long Bay, Angkor Wat, Cu Chi Tunnels, Mekong Delta, War Remnants Museum",
      category: "international"
    }
  ]
};

const Packages = () => {
  const [activeTab, setActiveTab] = useState("domestic");
  const [searchTerm, setSearchTerm] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  
  // Filter packages based on search term and duration filter
  const filteredPackages = packagesData[activeTab === "domestic" ? "domestic" : "international"].filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (durationFilter === "all") return matchesSearch;
    
    const numDays = parseInt(pkg.days.split("N/")[1].replace("D", ""));
    
    if (durationFilter === "short" && numDays <= 5) return matchesSearch;
    if (durationFilter === "medium" && numDays > 5 && numDays <= 8) return matchesSearch;
    if (durationFilter === "long" && numDays > 8) return matchesSearch;
    
    return false;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[300px] bg-cover bg-center flex items-center" 
             style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://source.unsplash.com/photo-1503220317375-aaad61436b1b')" }}>
          <div className="container-custom text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tour Packages</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Discover our handpicked selection of tour packages designed to give you unforgettable experiences
            </p>
          </div>
        </div>
        
        {/* Filter Section */}
        <section className="bg-white py-8 border-b">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Tabs */}
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
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark w-full sm:w-64"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                >
                  <option value="all">All Durations</option>
                  <option value="short">Short Trip (≤ 5 days)</option>
                  <option value="medium">Medium Trip (6-8 days)</option>
                  <option value="long">Long Trip ({`>`} 8 days)</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        
        {/* Packages Grid */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="section-title text-center mb-12">
              {activeTab === "domestic" ? "Explore India's Best Destinations" : "Discover International Wonders"}
            </h2>
            
            {filteredPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="h-56 overflow-hidden">
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
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin size={16} className="text-travel-blue-medium" />
                        <span>{pkg.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-3">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{pkg.rating}</span>
                        <span className="text-gray-500 text-sm">({pkg.reviews} reviews)</span>
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
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl text-gray-500 mb-4">No packages found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setDurationFilter("all");
                  }}
                  className="btn-primary"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* Package Booking Process */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">How It Works</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Booking your dream vacation with us is a simple and hassle-free process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-travel-blue-dark text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">Choose Your Package</h3>
                <p className="text-gray-600">
                  Browse through our selection of carefully curated packages and select the one that matches your preferences.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-travel-blue-dark text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">Customize Your Trip</h3>
                <p className="text-gray-600">
                  Personalize your journey by selecting your preferred dates, accommodation options, and additional activities.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-travel-blue-dark text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">Confirm and Enjoy</h3>
                <p className="text-gray-600">
                  Make a secure payment to confirm your booking, receive all travel documents, and get ready for your adventure.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/contact" className="btn-primary">
                Need a Custom Package? Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Packages;
