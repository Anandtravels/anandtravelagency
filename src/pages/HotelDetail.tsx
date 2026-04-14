import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Wifi, 
  Car, 
  Coffee,
  Utensils,
  Waves,
  Dumbbell,
  Clock,
  ArrowLeft,
  Shield,
  Phone,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  X,
  Grid3X3,
  Bed,
  Wind,
  Tv,
  Bath,
  UtensilsCrossed,
  Baby,
  Snowflake,
  Loader2,
  MessageCircle,
  Mail,
  ThumbsUp,
  Minus,
  Plus,
  CalendarDays,
  Building2
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { HotelService } from "../services/hotelService";
import { Hotel, RoomType } from "../types/hotel";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { sendWhatsAppConfirmation } from "@/utils/sendWhatsAppConfirmation";
import { db } from "../lib/firebase";
import { usePageVisibility } from "../hooks/usePageVisibility";

interface BookingFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  numberOfGuests: number;
  specialRequests?: string;
}

const HotelDetail = () => {
  const { id: hotelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPageVisible, loading: visibilityLoading } = usePageVisibility();
  
  // State
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDirectBooking, setShowDirectBooking] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Date picker state
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | undefined>(
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined
  );
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | undefined>(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined
  );
  const [localGuests, setLocalGuests] = useState(parseInt(searchParams.get('guests') || '2'));
  const [localRooms, setLocalRooms] = useState(parseInt(searchParams.get('rooms') || '1'));

  // Get search parameters
  const checkInDate = searchParams.get('checkIn') || '';
  const checkOutDate = searchParams.get('checkOut') || '';
  const numberOfRooms = parseInt(searchParams.get('rooms') || '1');
  const numberOfGuests = parseInt(searchParams.get('guests') || '2');

  // Form handling
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BookingFormData>({
    defaultValues: {
      checkInDate,
      checkOutDate,
      numberOfRooms,
      numberOfGuests,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      specialRequests: ''
    }
  });

  // Extended amenities mapping with more icons
  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    'free wifi': Wifi,
    parking: Car,
    'free parking': Car,
    breakfast: Coffee,
    'free breakfast': Coffee,
    restaurant: Utensils,
    pool: Waves,
    'swimming pool': Waves,
    gym: Dumbbell,
    'fitness center': Dumbbell,
    ac: Snowflake,
    'air conditioning': Snowflake,
    tv: Tv,
    television: Tv,
    bathroom: Bath,
    'attached bathroom': Bath,
    kitchen: UtensilsCrossed,
    'baby cot': Baby,
  };

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const normalizedAmenity = amenity.toLowerCase();
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (normalizedAmenity.includes(key)) {
        return Icon;
      }
    }
    return CheckCircle;
  };

  // Load hotel and room types in parallel for faster loading
  useEffect(() => {
    const loadHotelData = async () => {
      if (!hotelId) return;
      
      setLoading(true);
      try {
        // Fetch hotel and room types in parallel for faster loading
        const [hotelData, roomTypesData] = await Promise.all([
          HotelService.getHotel(hotelId),
          HotelService.getRoomTypesByHotel(hotelId).catch(() => [] as RoomType[])
        ]);
        
        setHotel(hotelData);
        setRoomTypes(roomTypesData);
      } catch (error) {
        console.error('Error loading hotel data:', error);
        toast({
          title: "Loading Failed",
          description: "Failed to load hotel details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadHotelData();
  }, [hotelId, toast]);

  // Calculate number of nights
  const calculateNights = () => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  // Apply date selection
  const applyDateSelection = () => {
    if (selectedCheckIn && selectedCheckOut) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('checkIn', format(selectedCheckIn, 'yyyy-MM-dd'));
      newParams.set('checkOut', format(selectedCheckOut, 'yyyy-MM-dd'));
      newParams.set('guests', localGuests.toString());
      newParams.set('rooms', localRooms.toString());
      setSearchParams(newParams);
      setShowDatePicker(false);
      toast({
        title: "Dates Updated",
        description: "Your booking dates have been updated.",
      });
    } else {
      toast({
        title: "Select Dates",
        description: "Please select both check-in and check-out dates.",
        variant: "destructive"
      });
    }
  };

  // Get dynamic image grid layout based on image count
  const getImageGridLayout = () => {
    const imageCount = hotel?.images?.length || 0;
    
    if (imageCount === 0) {
      return { layout: 'single', showCount: 0 };
    } else if (imageCount === 1) {
      return { layout: 'single', showCount: 1 };
    } else if (imageCount === 2) {
      return { layout: 'two', showCount: 2 };
    } else if (imageCount === 3) {
      return { layout: 'three', showCount: 3 };
    } else if (imageCount === 4) {
      return { layout: 'four', showCount: 4 };
    } else {
      return { layout: 'five-plus', showCount: 5 };
    }
  };

  // Handle room selection
  const handleRoomSelect = (roomType: RoomType) => {
    setSelectedRoom(roomType);
    setShowBookingForm(true);
    
    // Set form defaults
    setValue('guestName', '');
    setValue('guestEmail', '');
    setValue('guestPhone', '');
    setValue('checkInDate', checkInDate);
    setValue('checkOutDate', checkOutDate);
    setValue('numberOfRooms', numberOfRooms);
    setValue('numberOfGuests', numberOfGuests);
  };

  // Handle direct booking (without room type)
  const handleDirectBooking = () => {
    setSelectedRoom(null);
    setShowDirectBooking(true);
    
    // Set form defaults
    setValue('guestName', '');
    setValue('guestEmail', '');
    setValue('guestPhone', '');
    setValue('checkInDate', checkInDate);
    setValue('checkOutDate', checkOutDate);
    setValue('numberOfRooms', numberOfRooms);
    setValue('numberOfGuests', numberOfGuests);
  };

  // Handle booking submission
  const onSubmitBooking = async (data: BookingFormData) => {
    if (!hotel || !selectedRoom) return;
    
    setBookingLoading(true);
    
    try {
      // Validate dates
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) {
        toast({
          title: "Invalid Date",
          description: "Check-in date cannot be in the past",
          variant: "destructive"
        });
        return;
      }
      
      if (checkOut <= checkIn) {
        toast({
          title: "Invalid Date",
          description: "Check-out date must be after check-in date",
          variant: "destructive"
        });
        return;
      }

      // Check room availability
      const isAvailable = await HotelService.checkRoomAvailability(
        selectedRoom.id,
        data.checkInDate,
        data.checkOutDate,
        data.numberOfRooms
      );

      if (!isAvailable) {
        toast({
          title: "Room Unavailable",
          description: "Selected rooms are not available for the chosen dates",
          variant: "destructive"
        });
        return;
      }

      // Calculate total
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = selectedRoom.pricePerNight * data.numberOfRooms * nights;

      // Create booking
      const bookingData = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomTypeId: selectedRoom.id,
        roomTypeName: selectedRoom.name,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: '+91' + data.guestPhone.replace(/^\+91/, ''),
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numberOfRooms: data.numberOfRooms,
        numberOfGuests: data.numberOfGuests,
        totalNights: nights,
        pricePerNight: selectedRoom.pricePerNight,
        totalAmount,
        bookingStatus: 'pending' as const,
        paymentStatus: 'pending' as const,
        specialRequests: data.specialRequests || ''
      };

      const bookingId = await HotelService.createHotelBooking(bookingData);

      // Send WhatsApp booking confirmation to customer
      sendWhatsAppConfirmation(bookingData, 'hotel', bookingId);
      
      toast({
        title: "Booking Successful",
        description: "Your hotel booking has been submitted successfully. You will receive a confirmation email shortly.",
      });

      // Navigate to booking confirmation or success page
      navigate(`/hotel-booking-success?bookingId=${bookingId}`);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle direct inquiry submission (without specific room type)
  const onSubmitDirectInquiry = async (data: BookingFormData) => {
    if (!hotel) return;
    
    setBookingLoading(true);
    
    try {
      // Validate dates
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) {
        toast({
          title: "Invalid Date",
          description: "Check-in date cannot be in the past",
          variant: "destructive"
        });
        return;
      }
      
      if (checkOut <= checkIn) {
        toast({
          title: "Invalid Date",
          description: "Check-out date must be after check-in date",
          variant: "destructive"
        });
        return;
      }

      // Calculate total nights and estimated amount
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const estimatedAmount = hotel.priceRange.min * data.numberOfRooms * nights;

      // Create inquiry booking
      const bookingData = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomTypeId: '',
        roomTypeName: 'To be assigned',
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: '+91' + data.guestPhone.replace(/^\+91/, ''),
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numberOfRooms: data.numberOfRooms,
        numberOfGuests: data.numberOfGuests,
        totalNights: nights,
        pricePerNight: hotel.priceRange.min,
        totalAmount: estimatedAmount,
        bookingStatus: 'pending' as const,
        paymentStatus: 'pending' as const,
        specialRequests: data.specialRequests || '',
        isInquiry: true
      };

      const bookingId = await HotelService.createHotelBooking(bookingData);
      
      toast({
        title: "Inquiry Submitted",
        description: "Your booking inquiry has been submitted. We will contact you shortly with room availability.",
      });

      // Navigate to booking confirmation or success page
      navigate(`/hotel-booking-success?bookingId=${bookingId}`);
      
    } catch (error) {
      console.error('Error creating inquiry:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Check if hotels page is visible
  const showHotels = isPageVisible('hotels');

  // Show "not available" page if hotels are hidden
  if (!visibilityLoading && !showHotels) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-4 py-16">
            <Building2 className="w-20 h-20 mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Hotels Coming Soon</h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Our hotel booking service is currently under maintenance. Please check back later.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-6 py-3 bg-travel-orange text-white font-medium rounded-lg hover:bg-travel-orange/90 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-travel-blue-dark mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading hotel details...</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Hotel Not Found</h2>
            <p className="text-gray-600 mb-6">The hotel you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => navigate('/hotels')} 
              className="bg-travel-blue-dark hover:bg-travel-blue-dark/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Hotels
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Image navigation handlers
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === hotel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? hotel.images.length - 1 : prev - 1
    );
  };

  // Share handler
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `Check out ${hotel.name} in ${hotel.city}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Hotel link has been copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Image Gallery - Modern Airbnb Style */}
        <div className="relative bg-white">
          <div className="container-custom">
            {/* Mobile Image Carousel */}
            <div className="md:hidden relative">
              <div className="relative h-72 overflow-hidden rounded-b-2xl">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={hotel.images[currentImageIndex] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {hotel.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {hotel.images.length}
                </div>

                {/* Back Button */}
                <button
                  onClick={() => navigate('/hotels')}
                  className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleShare}
                    className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full shadow-lg transition-all ${
                      isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Image Grid - Dynamic Airbnb Style */}
            <div className="hidden md:block py-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => navigate('/hotels')}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="font-medium">Back to Hotels</span>
                </button>
                
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={isLiked ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>

              {/* Dynamic Image Grid based on image count */}
              {(() => {
                const { layout } = getImageGridLayout();
                const images = hotel.images || [];
                
                // Single image layout
                if (layout === 'single' || images.length === 0) {
                  return (
                    <div 
                      className="rounded-2xl overflow-hidden cursor-pointer h-[400px] relative group"
                      onClick={() => images.length > 0 && setShowGallery(true)}
                    >
                      <img
                        src={images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  );
                }
                
                // Two images layout
                if (layout === 'two') {
                  return (
                    <div 
                      className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden cursor-pointer h-[400px]"
                      onClick={() => setShowGallery(true)}
                    >
                      {images.slice(0, 2).map((image, index) => (
                        <div key={index} className="relative group overflow-hidden">
                          <img
                            src={image}
                            alt={`${hotel.name} ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
                
                // Three images layout
                if (layout === 'three') {
                  return (
                    <div 
                      className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden cursor-pointer h-[400px]"
                      onClick={() => setShowGallery(true)}
                    >
                      <div className="col-span-2 relative group overflow-hidden">
                        <img
                          src={images[0]}
                          alt={hotel.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="grid grid-rows-2 gap-2">
                        {images.slice(1, 3).map((image, index) => (
                          <div key={index} className="relative group overflow-hidden">
                            <img
                              src={image}
                              alt={`${hotel.name} ${index + 2}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                // Four images layout
                if (layout === 'four') {
                  return (
                    <div 
                      className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden cursor-pointer h-[400px]"
                      onClick={() => setShowGallery(true)}
                    >
                      <div className="col-span-2 row-span-2 relative group overflow-hidden">
                        <img
                          src={images[0]}
                          alt={hotel.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="col-span-2 relative group overflow-hidden">
                        <img
                          src={images[1]}
                          alt={`${hotel.name} 2`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      {images.slice(2, 4).map((image, index) => (
                        <div key={index} className="relative group overflow-hidden">
                          <img
                            src={image}
                            alt={`${hotel.name} ${index + 3}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
                
                // Five or more images layout
                return (
                  <div 
                    className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden cursor-pointer h-[400px] relative"
                    onClick={() => setShowGallery(true)}
                  >
                    <div className="col-span-2 row-span-2 relative group overflow-hidden">
                      <img
                        src={images[0]}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {images.slice(1, 5).map((image, index) => (
                      <div key={index} className="relative group overflow-hidden">
                        <img
                          src={image}
                          alt={`${hotel.name} ${index + 2}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {index === 3 && images.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-lg font-medium">
                              +{images.length - 5} photos
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Show All Photos Button */}
                    <button 
                      className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-colors z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowGallery(true);
                      }}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <span className="text-sm font-medium">Show all {images.length} photos</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Hotel Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hotel Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    {hotel.featured && (
                      <Badge className="bg-travel-orange text-white mb-2">Featured Hotel</Badge>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-5 h-5 mr-2 text-travel-orange" />
                      <span>{hotel.address}, {hotel.city}, {hotel.state}</span>
                    </div>
                  </div>
                  
                  {/* Rating Badge - only show if there are reviews */}
                  {hotel.rating > 0 && hotel.reviews > 0 && (
                    <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl font-bold text-gray-900">{hotel.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{hotel.reviews}</span> reviews
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 py-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-travel-blue-dark" />
                    <span>Check-in: {hotel.checkInTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-travel-blue-dark" />
                    <span>Check-out: {hotel.checkOutTime}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Hotel</h3>
                  <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
                </div>
              </motion.div>

              {/* Amenities Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities.map((amenity) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div key={amenity} className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-xl">
                        <Icon className="w-5 h-5 mr-3 text-travel-blue-dark" />
                        <span className="capitalize text-sm">{amenity.replace('_', ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Policies Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Policies</h3>
                <div className="space-y-3">
                  {hotel.policies.map((policy, index) => (
                    <div key={index} className="flex items-start">
                      <Shield className="w-5 h-5 mr-3 text-travel-orange mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{policy}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Room Types Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Choose Your Room</h3>
                  {checkInDate && checkOutDate && (
                    <Badge variant="outline" className="text-travel-blue-dark border-travel-blue-dark">
                      {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Search Details Banner */}
                {checkInDate && checkOutDate && (
                  <div className="bg-travel-blue-dark/5 border border-travel-blue-dark/20 rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-travel-blue-dark" />
                          <span className="font-medium">{checkInDate}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="font-medium">{checkOutDate}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{numberOfGuests} guest{numberOfGuests > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/hotels')}
                      >
                        Change Dates
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Room Cards */}
                <div className="space-y-4">
                  {roomTypes.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Bed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Request a Room</h4>
                      <p className="text-gray-600 mb-4">Room details will be confirmed after your booking request.</p>
                      <Button 
                        onClick={handleDirectBooking}
                        className="bg-travel-orange hover:bg-travel-orange/90 text-white px-8"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book This Hotel
                      </Button>
                    </div>
                  ) : (
                    roomTypes.map((roomType) => (
                      <motion.div
                        key={roomType.id}
                        whileHover={{ scale: 1.01 }}
                        className="border-2 border-gray-200 hover:border-travel-orange rounded-xl p-4 md:p-6 transition-all"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Room Image */}
                          {roomType.images && roomType.images.length > 0 && (
                            <div className="md:w-48 h-40 md:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                              <img
                                src={roomType.images[0]}
                                alt={roomType.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{roomType.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{roomType.description}</p>
                              </div>
                              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                                roomType.availableRooms > 0 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {roomType.availableRooms > 0 
                                  ? `${roomType.availableRooms} room${roomType.availableRooms > 1 ? 's' : ''} left` 
                                  : 'Sold out'}
                              </div>
                            </div>

                            {/* Room Details */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                <Users className="w-3 h-3 mr-1" />
                                Max {roomType.maxOccupancy} guests
                              </span>
                              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                <Bed className="w-3 h-3 mr-1" />
                                {roomType.bedType}
                              </span>
                              {roomType.roomSize && (
                                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  {roomType.roomSize}
                                </span>
                              )}
                              {roomType.hasAC && (
                                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  <Snowflake className="w-3 h-3 mr-1" />
                                  AC
                                </span>
                              )}
                              {roomType.hasWiFi && (
                                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  <Wifi className="w-3 h-3 mr-1" />
                                  WiFi
                                </span>
                              )}
                              {roomType.hasBreakfast && (
                                <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                  <Coffee className="w-3 h-3 mr-1" />
                                  Breakfast
                                </span>
                              )}
                            </div>

                            {/* Price and Book */}
                            <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-gray-100">
                              <div>
                                <div className="text-2xl font-bold text-travel-blue-dark">
                                  ₹{roomType.pricePerNight.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">per night</div>
                              </div>
                              <Button
                                onClick={() => handleRoomSelect(roomType)}
                                disabled={roomType.availableRooms === 0}
                                className={`${
                                  roomType.availableRooms > 0 
                                    ? 'bg-travel-orange hover:bg-travel-orange/90' 
                                    : 'bg-gray-300 cursor-not-allowed'
                                } text-white px-6`}
                              >
                                {roomType.availableRooms > 0 ? 'Book Now' : 'Sold Out'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Sticky Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24"
              >
                <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-travel-blue-dark">
                          ₹{hotel.priceRange.min.toLocaleString()}
                        </span>
                        <span className="text-gray-500">/ night</span>
                      </div>
                      {hotel.priceRange.min !== hotel.priceRange.max && (
                        <p className="text-sm text-gray-500 mt-1">
                          Prices range from ₹{hotel.priceRange.min.toLocaleString()} to ₹{hotel.priceRange.max.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {checkInDate && checkOutDate ? (
                      <div className="space-y-4">
                        {/* Booking Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Check-in</span>
                            <span className="font-medium">{format(new Date(checkInDate), 'dd MMM yyyy')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Check-out</span>
                            <span className="font-medium">{format(new Date(checkOutDate), 'dd MMM yyyy')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nights</span>
                            <span className="font-medium">{calculateNights()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Guests</span>
                            <span className="font-medium">{numberOfGuests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rooms</span>
                            <span className="font-medium">{numberOfRooms}</span>
                          </div>
                        </div>

                        {/* Change Dates Button */}
                        <Button
                          onClick={() => setShowDatePicker(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <CalendarDays className="w-4 h-4 mr-2" />
                          Change Dates
                        </Button>

                        {/* Book Now Button - Direct booking when no room types or easy access */}
                        {roomTypes.length === 0 && (
                          <Button
                            onClick={handleDirectBooking}
                            className="w-full bg-travel-orange hover:bg-travel-orange/90"
                          >
                            <Bed className="w-4 h-4 mr-2" />
                            Book This Hotel
                          </Button>
                        )}

                        {/* Total */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total (est.)</span>
                            <span className="text-travel-blue-dark">
                              ₹{(hotel.priceRange.min * calculateNights()).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Final price depends on room selected</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-4 bg-gray-50 rounded-xl">
                          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 text-sm">Select dates to see pricing</p>
                        </div>
                        <Button
                          onClick={() => setShowDatePicker(true)}
                          className="w-full bg-travel-orange hover:bg-travel-orange/90"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Select Dates
                        </Button>
                        {/* Direct booking option when no rooms configured */}
                        {roomTypes.length === 0 && (
                          <Button
                            onClick={handleDirectBooking}
                            variant="outline"
                            className="w-full border-travel-orange text-travel-orange hover:bg-travel-orange/10"
                          >
                            <Bed className="w-4 h-4 mr-2" />
                            Book Without Dates
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Contact Options */}
                    <div className="mt-6 space-y-3">
                      <Button 
                        onClick={() => window.location.href = 'tel:+918985816481'}
                        className="w-full bg-travel-blue-dark hover:bg-travel-blue-dark/90"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call to Book: 8985816481
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(`https://wa.me/918985816481?text=Hi, I'm interested in booking ${hotel.name}`, '_blank')}
                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp Us
                      </Button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span>Trusted by 1000+ travelers</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Complete Your Booking</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Hotel & Room Summary */}
                <div className="bg-gradient-to-r from-travel-blue-dark/10 to-travel-orange/10 rounded-xl p-4 mb-6">
                  <div className="flex gap-4">
                    {selectedRoom.images && selectedRoom.images[0] && (
                      <img
                        src={selectedRoom.images[0]}
                        alt={selectedRoom.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{hotel?.name}</h4>
                      <p className="text-sm text-gray-600">{selectedRoom.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Max {selectedRoom.maxOccupancy} guests
                        </span>
                        <span className="flex items-center">
                          <Bed className="w-4 h-4 mr-1" />
                          {selectedRoom.bedType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Booking Form */}
                <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
                  {/* Date Selection if not already selected */}
                  {(!checkInDate || !checkOutDate) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-in Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          {...register("checkInDate", { required: "Check-in date is required" })}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.checkInDate && (
                          <p className="text-red-500 text-sm mt-1">{errors.checkInDate.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          {...register("checkOutDate", { required: "Check-out date is required" })}
                          min={watch("checkInDate") || new Date().toISOString().split('T')[0]}
                        />
                        {errors.checkOutDate && (
                          <p className="text-red-500 text-sm mt-1">{errors.checkOutDate.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Booking Summary with dates */}
                  {checkInDate && checkOutDate && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-2 bg-white rounded-lg">
                          <div className="text-gray-500 text-xs">Check-in</div>
                          <div className="font-medium">{format(new Date(checkInDate), 'dd MMM')}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg">
                          <div className="text-gray-500 text-xs">Check-out</div>
                          <div className="font-medium">{format(new Date(checkOutDate), 'dd MMM')}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg">
                          <div className="text-gray-500 text-xs">Nights</div>
                          <div className="font-medium">{calculateNights()}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg">
                          <div className="text-gray-500 text-xs">Rooms</div>
                          <div className="font-medium">{numberOfRooms}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guest Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register("guestName", { required: "Full name is required" })}
                        placeholder="Enter your full name"
                      />
                      {errors.guestName && (
                        <p className="text-red-500 text-sm mt-1">{errors.guestName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        {...register("guestEmail", { 
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address"
                          }
                        })}
                        placeholder="Enter your email"
                      />
                      {errors.guestEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.guestEmail.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="bg-gray-100 flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md">
                        <span className="text-gray-600 font-medium">+91</span>
                      </div>
                      <Input
                        {...register("guestPhone", { 
                          required: "Phone number is required",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Invalid phone number"
                          }
                        })}
                        placeholder="Enter 10-digit phone number"
                        className="rounded-l-none"
                      />
                    </div>
                    {errors.guestPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.guestPhone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <Textarea
                      {...register("specialRequests")}
                      placeholder="Any special requests or requirements..."
                      rows={3}
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="bg-travel-blue-dark/5 rounded-xl p-4 border border-travel-blue-dark/20">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>₹{selectedRoom.pricePerNight.toLocaleString()} × {calculateNights()} night{calculateNights() > 1 ? 's' : ''} × {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-travel-blue-dark">
                        ₹{(selectedRoom.pricePerNight * numberOfRooms * calculateNights()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 bg-travel-orange hover:bg-travel-orange/90 text-white"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Direct Booking Form Modal (when no room types) */}
        {showDirectBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Book This Hotel</h3>
                  <button
                    onClick={() => setShowDirectBooking(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Hotel Summary */}
                <div className="bg-gradient-to-r from-travel-blue-dark/10 to-travel-orange/10 rounded-xl p-4 mb-6">
                  <div className="flex gap-4">
                    {hotel?.images && hotel.images[0] && (
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{hotel?.name}</h4>
                      <p className="text-sm text-gray-600">{hotel?.city}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-travel-orange/10 text-travel-orange px-2 py-1 rounded-full">
                          Starting from ₹{hotel?.priceRange.min.toLocaleString()}/night
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Booking Form */}
                <form onSubmit={handleSubmit(onSubmitDirectInquiry)} className="space-y-4">
                  {/* Date Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        {...register("checkInDate", { required: "Check-in date is required" })}
                        min={new Date().toISOString().split('T')[0]}
                        defaultValue={checkInDate}
                      />
                      {errors.checkInDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.checkInDate.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        {...register("checkOutDate", { required: "Check-out date is required" })}
                        min={watch("checkInDate") || new Date().toISOString().split('T')[0]}
                        defaultValue={checkOutDate}
                      />
                      {errors.checkOutDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.checkOutDate.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Room and Guest Count */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Rooms <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("numberOfRooms", { required: true })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-travel-orange focus:border-transparent"
                        defaultValue={numberOfRooms}
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Guests <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("numberOfGuests", { required: true })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-travel-orange focus:border-transparent"
                        defaultValue={numberOfGuests}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Guest Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register("guestName", { required: "Full name is required" })}
                        placeholder="Enter your full name"
                      />
                      {errors.guestName && (
                        <p className="text-red-500 text-sm mt-1">{errors.guestName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        {...register("guestEmail", { 
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address"
                          }
                        })}
                        placeholder="Enter your email"
                      />
                      {errors.guestEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.guestEmail.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="bg-gray-100 flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md">
                        <span className="text-gray-600 font-medium">+91</span>
                      </div>
                      <Input
                        {...register("guestPhone", { 
                          required: "Phone number is required",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Invalid phone number"
                          }
                        })}
                        placeholder="Enter 10-digit phone number"
                        className="rounded-l-none"
                      />
                    </div>
                    {errors.guestPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.guestPhone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests or Room Preference (Optional)
                    </label>
                    <Textarea
                      {...register("specialRequests")}
                      placeholder="E.g., AC room, Non-AC room, Sea-facing, any special requirements..."
                      rows={3}
                    />
                  </div>

                  {/* Price Estimate */}
                  <div className="bg-travel-blue-dark/5 rounded-xl p-4 border border-travel-blue-dark/20">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>Estimated starting price</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Estimated Total</span>
                      <span className="text-2xl font-bold text-travel-blue-dark">
                        ₹{(hotel?.priceRange.min || 0 * parseInt(watch("numberOfRooms")?.toString() || "1") * (calculateNights() || 1)).toLocaleString()}+
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">* Final price will be confirmed based on room availability</p>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowDirectBooking(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 bg-travel-orange hover:bg-travel-orange/90 text-white"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Submit Booking Request'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Date Picker Modal */}
        <AnimatePresence>
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowDatePicker(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Select Dates</h3>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Check-in Date */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedCheckIn ? format(selectedCheckIn, 'PPP') : 'Select check-in date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedCheckIn}
                          onSelect={setSelectedCheckIn}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Check-out Date */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedCheckOut ? format(selectedCheckOut, 'PPP') : 'Select check-out date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedCheckOut}
                          onSelect={setSelectedCheckOut}
                          disabled={(date) => date <= (selectedCheckIn || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Guests */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-700">Number of guests</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setLocalGuests(Math.max(1, localGuests - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{localGuests}</span>
                        <button
                          type="button"
                          onClick={() => setLocalGuests(localGuests + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rooms</label>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-700">Number of rooms</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setLocalRooms(Math.max(1, localRooms - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{localRooms}</span>
                        <button
                          type="button"
                          onClick={() => setLocalRooms(localRooms + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-travel-orange hover:bg-travel-orange/90"
                      onClick={applyDateSelection}
                    >
                      Apply Dates
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Screen Gallery Modal */}
        <AnimatePresence>
          {showGallery && hotel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
            >
              <div className="h-full flex flex-col">
                {/* Gallery Header */}
                <div className="flex items-center justify-between p-4 text-white">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowGallery(false)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-medium">{currentImageIndex + 1} / {hotel.images.length}</span>
                  </div>
                  <h3 className="text-lg font-medium">{hotel.name}</h3>
                </div>

                {/* Gallery Content */}
                <div className="flex-1 flex items-center justify-center relative px-16">
                  <button
                    onClick={prevImage}
                    className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={hotel.images[currentImageIndex]}
                    alt={`${hotel.name} ${currentImageIndex + 1}`}
                    className="max-h-[80vh] max-w-full object-contain"
                  />
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="p-4 overflow-x-auto">
                  <div className="flex gap-2 justify-center">
                    {hotel.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          index === currentImageIndex ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
};

export default HotelDetail;
