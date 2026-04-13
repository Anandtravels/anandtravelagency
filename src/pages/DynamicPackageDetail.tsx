import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Clock, Users, Check, Star, Image, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendPushNotification } from "@/utils/sendPushNotification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDynamicPackages } from "@/hooks/useDynamicPackages";
import { Package } from "@/types/package";

const DynamicPackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { packages, loading, error, getPackageById, getDomesticPackages, getInternationalPackages } = useDynamicPackages();
  
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    numberOfPeople: 1,
    message: '',
    departureDate: ''
  });

  useEffect(() => {
    if (id && packages.length > 0) {
      const pkg = getPackageById(id);
      setPackageData(pkg || null);
    }
  }, [id, packages, getPackageById]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageData) return;

    setBookingLoading(true);
    try {
      const bookingDataWithPackage = {
        ...bookingData,
        packageId: packageData.id,
        packageTitle: packageData.title,
        packagePrice: packageData.price,
        totalAmount: packageData.price * bookingData.numberOfPeople,
        status: 'pending',
        created_at: serverTimestamp()
      };

      await addDoc(collection(db, 'package_bookings'), bookingDataWithPackage);
      
      // Send push notification to admin
      sendPushNotification('new_package_booking', {
        name: bookingData.fullName,
        packageName: packageData.title
      });

      toast({
        title: "Booking Submitted!",
        description: "Your booking request has been submitted successfully. We'll contact you shortly.",
      });
      
      setBookingModalOpen(false);
      setBookingData({
        fullName: '',
        email: '',
        phone: '',
        numberOfPeople: 1,
        message: '',
        departureDate: ''
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Package Not Found</h1>
            <p className="text-gray-600 mb-6">Sorry, the package you're looking for doesn't exist or has been removed.</p>
            <Link to="/packages" className="btn-primary">
              View All Packages
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedPackages = packageData.category === 'domestic' 
    ? getDomesticPackages().filter(pkg => pkg.id !== packageData.id).slice(0, 3)
    : getInternationalPackages().filter(pkg => pkg.id !== packageData.id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Header Section with Package Info */}
        <section className="bg-gradient-to-r from-slate-800 via-blue-900 to-slate-900 text-white py-6 md:py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">{packageData.title}</h1>
                <div className="flex flex-wrap items-center gap-3 md:gap-6 text-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-orange-400 flex-shrink-0" />
                    <span className="text-sm md:text-base">{packageData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-orange-400 flex-shrink-0" />
                    <span className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                      {packageData.days}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={18} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <span className="font-bold text-sm md:text-base">{packageData.rating || 4.6}</span>
                    <span className="text-gray-300 text-sm">({packageData.reviews || 210} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-gray-300 text-xs md:text-sm font-medium">Starting from</p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-400">₹{packageData.price.toLocaleString()}</p>
                <p className="text-gray-300 text-xs md:text-sm">per person</p>
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery Section */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4 h-auto lg:h-[500px] xl:h-[600px] py-6">
              {/* Main Image */}
              <div className="flex-1 lg:w-3/4">
                <div className="h-[300px] md:h-[400px] lg:h-full rounded-lg md:rounded-xl overflow-hidden shadow-lg relative group">
                  <img 
                    src={packageData.images[activeImageIndex]} 
                    alt={packageData.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  
                  {/* Navigation Arrows */}
                  {packageData.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex(activeImageIndex > 0 ? activeImageIndex - 1 : packageData.images.length - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex(activeImageIndex < packageData.images.length - 1 ? activeImageIndex + 1 : 0)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {activeImageIndex + 1} / {packageData.images.length}
                  </div>
                </div>
              </div>
              
              {/* Scrollable Thumbnail Images - Improved Design */}
              <div className="lg:w-1/4">
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 md:gap-3 lg:h-full lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-orange-400 lg:scrollbar-track-gray-100 lg:pr-2">
                  {packageData.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`relative aspect-square lg:aspect-auto lg:h-[160px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                        index === activeImageIndex 
                          ? 'ring-4 ring-orange-400 shadow-xl scale-[1.02]' 
                          : 'shadow-md hover:shadow-xl hover:scale-[1.02] opacity-80 hover:opacity-100'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${packageData.title} - Image ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      {/* Gradient overlay for better badge visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Image number badge */}
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                        {index + 1}/{packageData.images.length}
                      </div>
                      
                      {/* Active indicator */}
                      {index === activeImageIndex && (
                        <div className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          Active
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Package Details */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column - Package Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-travel-blue-dark mb-4">{packageData.title}</h1>
                  
                  <div className="flex flex-wrap gap-3 md:gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={18} className="text-travel-blue-medium flex-shrink-0" />
                      <span className="text-sm md:text-base">{packageData.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} className="text-travel-blue-medium flex-shrink-0" />
                      <span className="text-sm md:text-base">{packageData.days}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={18} className="text-travel-blue-medium flex-shrink-0" />
                      <span className="text-sm md:text-base">Max {packageData.maxPeople} people</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      <span className="font-medium text-sm md:text-base">{packageData.rating || 4.5}</span>
                      <span className="text-gray-500 text-sm">({packageData.reviews || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold text-travel-blue-dark mb-4">Overview</h2>
                  <p className="text-gray-700 mb-6 text-sm md:text-base leading-relaxed">{packageData.overview}</p>
                  
                  <h3 className="text-lg md:text-xl font-semibold text-travel-blue-medium mb-3">Package Highlights</h3>
                  <ul className="space-y-2 mb-6">
                    {packageData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check size={16} className="text-travel-orange mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-sm md:text-base">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg text-center">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 text-travel-blue-dark mx-auto mb-2" />
                      <p className="text-xs md:text-sm font-medium text-travel-blue-dark">Duration</p>
                      <p className="text-gray-600 text-sm">{packageData.duration}</p>
                    </div>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg text-center">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-travel-blue-dark mx-auto mb-2" />
                      <p className="text-xs md:text-sm font-medium text-travel-blue-dark">Group Size</p>
                      <p className="text-gray-600 text-sm">Max {packageData.maxPeople} people</p>
                    </div>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg text-center">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-travel-blue-dark mx-auto mb-2" />
                      <p className="text-xs md:text-sm font-medium text-travel-blue-dark">Departure</p>
                      <p className="text-gray-600 text-sm">{packageData.departureInfo}</p>
                    </div>
                  </div>
                </div>

                {/* Itinerary */}
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-travel-blue-dark mb-6">Detailed Itinerary</h2>
                  <div className="space-y-6">
                    {packageData.itinerary.map((day, index) => (
                      <div key={index} className="border-l-4 border-travel-orange pl-4 md:pl-6 pb-6">
                        <h3 className="text-base md:text-lg font-semibold text-travel-blue-dark mb-2">{day.day}: {day.title}</h3>
                        <p className="text-gray-700 text-sm md:text-base">{day.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inclusions & Exclusions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-green-600 mb-4">Inclusions</h3>
                    <ul className="space-y-2">
                      {packageData.inclusions.map((inclusion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check size={14} className="text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 text-sm md:text-base">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-red-600 mb-4">Exclusions</h3>
                    <ul className="space-y-2">
                      {packageData.exclusions.map((exclusion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1 flex-shrink-0 text-sm">✗</span>
                          <span className="text-gray-700 text-sm md:text-base">{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 sticky top-4">
                  <div className="text-center mb-6">
                    <p className="text-gray-600 text-sm">Starting from</p>
                    <p className="text-2xl md:text-3xl font-bold text-travel-blue-dark">₹{packageData.price.toLocaleString('en-IN')}</p>
                    <p className="text-xs md:text-sm text-gray-500">per person</p>
                  </div>
                  
                  <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-travel-orange hover:bg-travel-orange/90 text-white font-semibold py-3 mb-4">
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Book {packageData.title}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                              id="fullName"
                              required
                              value={bookingData.fullName}
                              onChange={(e) => setBookingData({...bookingData, fullName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={bookingData.email}
                              onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              required
                              value={bookingData.phone}
                              onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="numberOfPeople">Number of People *</Label>
                            <Input
                              id="numberOfPeople"
                              type="number"
                              min="1"
                              max={packageData.maxPeople}
                              required
                              value={bookingData.numberOfPeople}
                              onChange={(e) => setBookingData({...bookingData, numberOfPeople: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="departureDate">Preferred Departure Date *</Label>
                          <Input
                            id="departureDate"
                            type="date"
                            required
                            value={bookingData.departureDate}
                            onChange={(e) => setBookingData({...bookingData, departureDate: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="message">Special Requirements</Label>
                          <Textarea
                            id="message"
                            placeholder="Any special requirements or questions..."
                            value={bookingData.message}
                            onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                          />
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span>Package Price:</span>
                            <span>₹{packageData.price.toLocaleString('en-IN')} x {bookingData.numberOfPeople}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total Amount:</span>
                            <span className="text-travel-orange">₹{(packageData.price * bookingData.numberOfPeople).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button type="submit" disabled={bookingLoading} className="w-full">
                            {bookingLoading ? "Submitting..." : "Submit Booking Request"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <span>Free cancellation up to 24 hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <span>Best price guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <span>24/7 customer support</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Need Help?</h4>
                    <div className="space-y-2 text-sm">
                      <p>📞 +91 9876543210</p>
                      <p>✉️ info@anandtravels.com</p>
                      <p>🕒 Mon-Sat: 9 AM - 6 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* You May Also Like Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">You May Also Like</h2>
              <div className="w-16 md:w-20 lg:w-24 h-1 bg-orange-400 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                  {/* Package Image */}
                  <div className="h-48 md:h-56 lg:h-64 overflow-hidden relative">
                    <img 
                      src={pkg.images[0] || '/placeholder.svg'} 
                      alt={pkg.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        {pkg.days}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  
                  {/* Package Content */}
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {pkg.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin size={14} className="text-orange-500 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">{pkg.location}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Starting from</p>
                        <p className="text-xl md:text-2xl font-bold text-slate-800">
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <Link 
                        to={`/packages/${pkg.id}`} 
                        className="bg-slate-800 hover:bg-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show message if no related packages */}
            {relatedPackages.length === 0 && (
              <div className="text-center py-12 md:py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 md:w-24 h-20 md:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Image size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">No Similar Packages</h3>
                  <p className="text-gray-500 text-base md:text-lg mb-6 md:mb-8">No similar packages available at the moment.</p>
                  <Link 
                    to="/packages" 
                    className="inline-block bg-slate-800 hover:bg-orange-600 text-white px-6 md:px-8 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm md:text-base"
                  >
                    Explore All Packages
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPackageDetail;
