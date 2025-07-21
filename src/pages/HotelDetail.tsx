import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
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
  AlertCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { HotelService } from "../services/hotelService";
import { Hotel, RoomType } from "../types/hotel";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useForm } from "react-hook-form";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

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
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Available amenities mapping
  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    parking: Car,
    breakfast: Coffee,
    restaurant: Utensils,
    pool: Waves,
    gym: Dumbbell,
  };

  // Load hotel and room types
  useEffect(() => {
    const loadHotelData = async () => {
      if (!hotelId) return;
      
      setLoading(true);
      try {
        const [hotelData, roomTypesData] = await Promise.all([
          HotelService.getHotel(hotelId),
          HotelService.getRoomTypesByHotel(hotelId)
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hotel details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h2>
            <p className="text-gray-600 mb-4">The hotel you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/hotels')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hotels
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="container-custom py-4">
            <Button
              onClick={() => navigate('/hotels')}
              variant="ghost"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hotels
            </Button>
          </div>
        </div>

        {/* Hotel Images Gallery */}
        <div className="bg-white">
          <div className="container-custom py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
              {/* Main Image */}
              <div className="lg:col-span-2">
                <img
                  src={hotel.images[currentImageIndex] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                  alt={hotel.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {hotel.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${hotel.name} ${index + 1}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-full h-full object-cover rounded-lg cursor-pointer border-2 transition-all ${
                      currentImageIndex === index ? 'border-travel-orange' : 'border-transparent hover:border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Information */}
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hotel Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-5 h-5 mr-2" />
                      {hotel.address}, {hotel.city}, {hotel.state}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${
                              i < Math.floor(hotel.rating) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-medium text-gray-900">
                        {hotel.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-600">
                        ({hotel.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || CheckCircle;
                    return (
                      <div key={amenity} className="flex items-center text-gray-700">
                        <Icon className="w-5 h-5 mr-3 text-travel-orange" />
                        <span className="capitalize">{amenity.replace('_', ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Policies */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Hotel Policies</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-travel-orange" />
                    <span className="text-gray-700">
                      Check-in: {hotel.checkInTime} | Check-out: {hotel.checkOutTime}
                    </span>
                  </div>
                  {hotel.policies.map((policy, index) => (
                    <div key={index} className="flex items-start">
                      <Shield className="w-5 h-5 mr-3 text-travel-orange mt-0.5" />
                      <span className="text-gray-700">{policy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Types */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Rooms</h3>
                {checkInDate && checkOutDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between text-blue-800">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {checkInDate} to {checkOutDate}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {numberOfGuests} guests, {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''}
                        </div>
                      </div>
                      <span className="font-medium">{calculateNights()} night{calculateNights() > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  {roomTypes.map((roomType) => (
                    <div key={roomType.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{roomType.name}</h4>
                          <p className="text-gray-600 mb-3">{roomType.description}</p>
                          
                          {/* Room Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                            <div>Max Occupancy: {roomType.maxOccupancy}</div>
                            <div>Bed: {roomType.bedType}</div>
                            {roomType.roomSize && <div>Size: {roomType.roomSize}</div>}
                            <div className={`font-medium ${roomType.availableRooms > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {roomType.availableRooms > 0 ? `${roomType.availableRooms} rooms left` : 'Sold out'}
                            </div>
                          </div>
                          
                          {/* Room Amenities */}
                          <div className="flex flex-wrap gap-2">
                            {roomType.hasAC && (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                AC
                              </span>
                            )}
                            {roomType.hasWiFi && (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Free WiFi
                              </span>
                            )}
                            {roomType.hasBreakfast && (
                              <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                Free Breakfast
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Price and Book Button */}
                        <div className="ml-6 text-right">
                          <div className="text-2xl font-bold text-travel-blue-dark mb-1">
                            ₹{roomType.pricePerNight.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 mb-3">per night</div>
                          <Button
                            onClick={() => handleRoomSelect(roomType)}
                            disabled={roomType.availableRooms === 0}
                            className="bg-travel-orange hover:bg-travel-orange/90 text-white"
                          >
                            {roomType.availableRooms > 0 ? 'Book Now' : 'Sold Out'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                
                {checkInDate && checkOutDate ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium">{checkInDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium">{checkOutDate}</span>
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
                    <hr className="my-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Starting from</p>
                      <p className="text-2xl font-bold text-travel-blue-dark">
                        ₹{hotel.priceRange.min.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">per night</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Select your dates to see pricing and availability</p>
                    <Button
                      onClick={() => navigate('/hotels')}
                      variant="outline"
                      className="w-full"
                    >
                      Update Search
                    </Button>
                  </div>
                )}
                
                {/* Contact Hotel */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Call us at +91 8985816481</span>
                  </div>
                  <p className="text-xs text-gray-500">Available 24/7 for assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Complete Your Booking</h3>
                  <Button
                    onClick={() => setShowBookingForm(false)}
                    variant="ghost"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
                
                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">{selectedRoom.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Check-in: {checkInDate}</div>
                    <div>Check-out: {checkOutDate}</div>
                    <div>Nights: {calculateNights()}</div>
                    <div>Rooms: {numberOfRooms}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-xl font-bold text-travel-blue-dark">
                        ₹{(selectedRoom.pricePerNight * numberOfRooms * calculateNights()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Booking Form */}
                <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
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
                      {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default HotelDetail;
