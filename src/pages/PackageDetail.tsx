
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Clock, Users, Check, Star, Image } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "@/hooks/use-toast";

// This would normally come from the database
const packagesData = {
  domestic: [
    {
      id: 1,
      title: "Magical Kashmir",
      images: [
        "https://source.unsplash.com/photo-1501693126003-1fefa4902dd3",
        "https://source.unsplash.com/photo-1566837497312-7be7830ae9b1",
        "https://source.unsplash.com/photo-1571913148439-32cf6f98ef3d"
      ],
      days: "5N/6D",
      price: "₹35,999",
      location: "Srinagar, Gulmarg, Pahalgam",
      rating: 4.8,
      reviews: 124,
      overview: "Discover the breathtaking beauty of Kashmir, often referred to as 'Paradise on Earth'. This comprehensive tour package takes you through the most scenic locations in the Kashmir valley, offering a perfect blend of natural beauty, adventure, and cultural experiences.",
      highlights: [
        "Shikara ride on the serene Dal Lake",
        "Visit to the famous Mughal Gardens",
        "Gondola ride in Gulmarg with panoramic views",
        "Explore the beautiful Betaab Valley",
        "Visit Chandanwari and Aru Valley in Pahalgam"
      ],
      inclusions: [
        "5 nights accommodation in 3-star hotels",
        "Daily breakfast and dinner",
        "All transfers and sightseeing by private vehicle",
        "English-speaking tour guide",
        "All applicable taxes and service charges",
        "Airport pickup and drop-off"
      ],
      exclusions: [
        "Airfare to and from Srinagar",
        "Lunch and personal expenses",
        "Optional activities mentioned in the itinerary",
        "Travel insurance",
        "Anything not mentioned in inclusions"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Srinagar",
          description: "Arrive at Srinagar Airport, where our representative will greet you and transfer you to the houseboat. After check-in, enjoy a relaxing Shikara ride on Dal Lake. In the evening, explore the local market. Overnight stay at the houseboat."
        },
        {
          day: "Day 2",
          title: "Srinagar Sightseeing",
          description: "After breakfast, visit the famous Mughal Gardens including Nishat Bagh, Shalimar Bagh, and Chashme Shahi. Later, visit the Shankaracharya Temple located on a hill offering panoramic views of the city. Return to the houseboat for dinner and overnight stay."
        },
        {
          day: "Day 3",
          title: "Srinagar to Gulmarg",
          description: "After breakfast, check out from the houseboat and drive to Gulmarg (approx. 2 hours). Known as the 'Meadow of Flowers', Gulmarg is famous for its scenic beauty and the world's second-highest Gondola ride. Enjoy activities like Gondola ride, skiing (in winter), or horseback riding. Overnight stay at a hotel in Gulmarg."
        },
        {
          day: "Day 4",
          title: "Gulmarg to Pahalgam",
          description: "After breakfast, drive to Pahalgam (approx. 3 hours), known as the 'Valley of Shepherds'. En route, visit the Avantipura Ruins and the Saffron fields. Check in at the hotel and spend the evening at leisure by the river Lidder. Overnight stay in Pahalgam."
        },
        {
          day: "Day 5",
          title: "Pahalgam Sightseeing",
          description: "After breakfast, explore the beautiful valleys of Pahalgam including Betaab Valley, Chandanwari, and Aru Valley. You can also enjoy activities like river rafting or horseback riding (optional). Return to the hotel for overnight stay."
        },
        {
          day: "Day 6",
          title: "Pahalgam to Srinagar - Departure",
          description: "After breakfast, check out from the hotel and drive back to Srinagar Airport (approx. 3 hours) for your onward journey, carrying beautiful memories of your Kashmir trip."
        }
      ],
      category: "domestic",
      maxPeople: 15,
      duration: "6 Days, 5 Nights",
      departureInfo: "Daily departures available",
      minAge: 5
    },
    {
      id: 2,
      title: "Kerala Backwaters",
      images: [
        "https://source.unsplash.com/photo-1602501059056-93457550b099",
        "https://source.unsplash.com/photo-1593693729108-ec04c7f3b7ed",
        "https://source.unsplash.com/photo-1563016234-08b5c084221c"
      ],
      days: "4N/5D",
      price: "₹25,999",
      location: "Kochi, Munnar, Alleppey",
      rating: 4.9,
      reviews: 186,
      overview: "Experience the serene beauty of God's Own Country with our Kerala Backwaters tour package. This journey takes you through the lush green landscapes, tranquil backwaters, and pristine beaches of Kerala, offering a perfect retreat from the hustle and bustle of city life.",
      highlights: [
        "Overnight stay in a traditional houseboat",
        "Visit to the famous tea plantations in Munnar",
        "Traditional Kathakali dance performance",
        "Spice garden tour with expert guides",
        "Explore the historic Fort Kochi area"
      ],
      inclusions: [
        "4 nights accommodation (2 nights in hotels, 1 night in houseboat, 1 night in resort)",
        "Daily breakfast and dinner",
        "Houseboat stay with all meals included",
        "All transfers and sightseeing by private vehicle",
        "English-speaking tour guide",
        "All applicable taxes and service charges"
      ],
      exclusions: [
        "Airfare to Kochi and from Cochin",
        "Personal expenses and tips",
        "Optional activities not mentioned in the itinerary",
        "Travel insurance",
        "Camera fees at monuments"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Kochi",
          description: "Arrive at Kochi International Airport, where our representative will greet you and transfer you to your hotel. After check-in, visit Fort Kochi area, including the Chinese Fishing Nets, St. Francis Church, and the Dutch Palace. In the evening, enjoy a traditional Kathakali dance performance. Overnight stay in Kochi."
        },
        {
          day: "Day 2",
          title: "Kochi to Munnar",
          description: "After breakfast, drive to Munnar (approx. 4 hours), famous for its tea plantations and scenic beauty. En route, visit the Valara and Cheeyappara waterfalls. Check in at the hotel and spend the evening at leisure. Overnight stay in Munnar."
        },
        {
          day: "Day 3",
          title: "Munnar Sightseeing",
          description: "After breakfast, explore Munnar visiting the Tea Plantations, Tea Museum, Mattupetty Dam, Echo Point, and the beautiful Eravikulam National Park (home to the endangered Nilgiri Tahr). Return to the hotel for overnight stay."
        },
        {
          day: "Day 4",
          title: "Munnar to Alleppey",
          description: "After breakfast, check out from the hotel and drive to Alleppey (approx. 4 hours). Board your private houseboat, a converted rice barge now serving as a floating hotel. Cruise through the serene backwaters, observing rural Kerala life. Enjoy lunch, dinner, and overnight stay on the houseboat."
        },
        {
          day: "Day 5",
          title: "Alleppey to Kochi - Departure",
          description: "After breakfast on the houseboat, disembark and drive to Kochi International Airport (approx. 2 hours) for your onward journey, carrying beautiful memories of Kerala."
        }
      ],
      category: "domestic",
      maxPeople: 12,
      duration: "5 Days, 4 Nights",
      departureInfo: "Monday, Wednesday, Friday",
      minAge: 0
    }
  ],
  international: [
    {
      id: 7,
      title: "Amazing Thailand",
      images: [
        "https://source.unsplash.com/photo-1528181304800-259b08848526",
        "https://source.unsplash.com/photo-1546982573-0780b38e9f73",
        "https://source.unsplash.com/photo-1587637833188-23603301546a"
      ],
      days: "6N/7D",
      price: "₹65,999",
      location: "Bangkok, Pattaya, Phuket",
      rating: 4.8,
      reviews: 156,
      overview: "Discover the wonders of Thailand with our comprehensive tour package covering the vibrant cities of Bangkok and Pattaya, and the paradise island of Phuket. Experience the perfect blend of cultural heritage, bustling city life, and serene beach relaxation.",
      highlights: [
        "Phi Phi Islands tour by speedboat",
        "Visit to the majestic Grand Palace and Emerald Buddha Temple",
        "Experience the vibrant Floating Market",
        "Day trip to Coral Island with water sports",
        "Safari World and Marine Park visit"
      ],
      inclusions: [
        "6 nights accommodation in 4-star hotels",
        "Daily breakfast",
        "All transfers by air-conditioned vehicle",
        "Bangkok to Phuket domestic flight",
        "English-speaking tour guide",
        "All entrance fees as per itinerary",
        "Thailand visa assistance"
      ],
      exclusions: [
        "International airfare",
        "Lunch and dinner unless specified",
        "Personal expenses and tips",
        "Optional tours and activities",
        "Travel insurance",
        "Thailand Visa fees"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Bangkok",
          description: "Arrive at Bangkok International Airport, where our representative will greet you and transfer you to your hotel. Rest of the day at leisure to explore the city on your own. Overnight stay in Bangkok."
        },
        {
          day: "Day 2",
          title: "Bangkok City Tour",
          description: "After breakfast, embark on a city tour visiting the Grand Palace, Wat Phra Kaew (Emerald Buddha Temple), Wat Arun (Temple of Dawn), and a boat ride through the canals. Evening is free for shopping at local markets. Overnight stay in Bangkok."
        },
        {
          day: "Day 3",
          title: "Bangkok to Pattaya",
          description: "After breakfast, check out from the hotel and drive to Pattaya (approx. 2 hours). En route, visit the Floating Market. Check in at the hotel in Pattaya and spend the evening at leisure. You can opt for the famous Alcazar Show (optional). Overnight stay in Pattaya."
        },
        {
          day: "Day 4",
          title: "Coral Island Tour",
          description: "After breakfast, transfer to the pier for a speedboat ride to Coral Island. Enjoy water sports and activities (at own expense) or relax on the beautiful beach. Return to Pattaya in the afternoon. Evening free for leisure. Overnight stay in Pattaya."
        },
        {
          day: "Day 5",
          title: "Pattaya to Bangkok - Flight to Phuket",
          description: "After breakfast, check out from the hotel and drive back to Bangkok to catch your flight to Phuket. Arrive in Phuket and transfer to your hotel. Rest of the day at leisure to explore the beaches. Overnight stay in Phuket."
        },
        {
          day: "Day 6",
          title: "Phi Phi Islands Tour",
          description: "After breakfast, embark on a full-day tour to the famous Phi Phi Islands by speedboat. Visit Maya Bay (where 'The Beach' was filmed), Monkey Beach, and enjoy swimming, snorkeling, and lunch on the island. Return to Phuket in the evening. Overnight stay in Phuket."
        },
        {
          day: "Day 7",
          title: "Phuket - Departure",
          description: "After breakfast, check out from the hotel. Depending on your flight time, you can explore Phuket town or relax at the hotel before being transferred to Phuket International Airport for your onward journey."
        }
      ],
      category: "international",
      maxPeople: 20,
      duration: "7 Days, 6 Nights",
      departureInfo: "Tuesday, Saturday",
      minAge: 2
    }
  ]
};

// Helper function to find a package by ID
const findPackageById = (id: number) => {
  const allPackages = [...packagesData.domestic, ...packagesData.international];
  return allPackages.find(pkg => pkg.id === id);
};

const PackageDetail = () => {
  const { id } = useParams();
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [travelers, setTravelers] = useState(2);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate loading data from API
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const foundPackage = findPackageById(Number(id));
        if (foundPackage) {
          setPackageData(foundPackage);
        }
      } catch (error) {
        console.error("Error fetching package details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleBookNow = () => {
    toast({
      title: "Booking Initiated",
      description: `Your booking request for ${packageData.title} for ${travelers} travelers has been received. We'll contact you shortly.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-travel-blue-dark mx-auto"></div>
            <p className="mt-4 text-travel-blue-dark">Loading package details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!packageData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="container-custom text-center">
            <h1 className="text-4xl font-bold text-travel-blue-dark mb-6">Package Not Found</h1>
            <p className="text-lg mb-8 text-gray-600">
              The package you are looking for does not exist or has been removed.
            </p>
            <Link to="/packages" className="btn-primary text-lg">
              Browse All Packages
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Package Header */}
        <div className="bg-travel-blue-dark text-white py-8">
          <div className="container-custom">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{packageData.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin size={18} />
                    <span>{packageData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={18} />
                    <span>{packageData.days}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    <span>{packageData.rating} ({packageData.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Starting from</div>
                <div className="text-3xl font-bold text-travel-orange">{packageData.price}</div>
                <div className="text-sm">per person on twin sharing</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Image Gallery */}
        <section className="py-8">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                <img 
                  src={packageData.images[activeImageIndex]} 
                  alt={packageData.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                {packageData.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`h-32 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      index === activeImageIndex ? 'border-travel-orange' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${packageData.title} - Image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Package Details */}
        <section className="py-8">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Package Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">Overview</h2>
                  <p className="text-gray-700 mb-6">{packageData.overview}</p>
                  
                  <h3 className="text-xl font-semibold text-travel-blue-medium mb-3">Package Highlights</h3>
                  <ul className="space-y-2 mb-6">
                    {packageData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check size={18} className="text-travel-orange mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Clock className="w-6 h-6 text-travel-blue-dark mx-auto mb-2" />
                      <h4 className="font-medium text-travel-blue-dark">Duration</h4>
                      <p className="text-gray-600">{packageData.duration}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Users className="w-6 h-6 text-travel-blue-dark mx-auto mb-2" />
                      <h4 className="font-medium text-travel-blue-dark">Group Size</h4>
                      <p className="text-gray-600">Max {packageData.maxPeople} people</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Calendar className="w-6 h-6 text-travel-blue-dark mx-auto mb-2" />
                      <h4 className="font-medium text-travel-blue-dark">Departures</h4>
                      <p className="text-gray-600">{packageData.departureInfo}</p>
                    </div>
                  </div>
                </div>
                
                {/* Itinerary */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">Detailed Itinerary</h2>
                  
                  <div className="space-y-6">
                    {packageData.itinerary.map((day, index) => (
                      <div key={index} className="relative border-l-2 border-travel-blue-dark pl-6 pb-6">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-travel-blue-dark"></div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-travel-blue-dark">{day.day}: {day.title}</h3>
                          <p className="text-gray-700 mt-2">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Inclusions/Exclusions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-travel-blue-dark mb-4">Inclusions</h2>
                      <ul className="space-y-2">
                        {packageData.inclusions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-travel-blue-dark mb-4">Exclusions</h2>
                      <ul className="space-y-2">
                        {packageData.exclusions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1 flex-shrink-0">✕</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Booking Form */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">Book This Package</h2>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Number of Travelers</label>
                    <div className="flex items-center">
                      <button 
                        onClick={() => setTravelers(prev => Math.max(1, prev - 1))}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-l"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={travelers}
                        readOnly
                        className="w-16 py-2 px-3 text-center border-t border-b border-gray-300"
                      />
                      <button 
                        onClick={() => setTravelers(prev => Math.min(packageData.maxPeople, prev + 1))}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Select Travel Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Base Price</span>
                      <span className="text-gray-700">{packageData.price} x {travelers}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Taxes & Fees</span>
                      <span className="text-gray-700">₹{(parseInt(packageData.price.replace(/[^0-9]/g, '')) * 0.18).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                      <span className="text-travel-blue-dark">Total</span>
                      <span className="text-travel-blue-dark">₹{(parseInt(packageData.price.replace(/[^0-9]/g, '')) * travelers * 1.18).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleBookNow}
                    className="w-full py-3 btn-primary text-lg mb-4"
                  >
                    Book Now
                  </button>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    * A 20% advance payment is required to confirm your booking.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-travel-blue-dark mb-2">Need Help?</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Our travel experts are here to assist you with your booking and answer any questions.
                    </p>
                    <Link 
                      to="/contact" 
                      className="text-travel-orange hover:text-travel-blue-dark font-medium text-sm flex items-center gap-1"
                    >
                      Contact Us <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Packages */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="section-title text-center mb-12">You May Also Like</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packagesData[packageData.category === "domestic" ? "domestic" : "international"]
                .filter(pkg => pkg.id !== packageData.id)
                .slice(0, 3)
                .map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={typeof pkg.images === 'string' ? pkg.images : pkg.images[0]} 
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
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <MapPin size={16} className="text-travel-blue-medium" />
                        <span>{pkg.location}</span>
                      </div>
                      
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PackageDetail;
