import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Star, 
  Clock,
  Users,
  Bed,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Waves,
  Dumbbell,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  Check,
  ArrowLeft,
  Wind
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "../hooks/use-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Hotel, RoomType, HotelBooking } from "../types/hotel";
import { HotelService } from "../services/hotelService";

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

const HotelDetailPage = () => {
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
        
        if (!hotelData) {
          toast({
            title: "Hotel Not Found",
            description: "The requested hotel could not be found",
            variant: "destructive"
          });
          navigate('/hotels');
        }
      } catch (error) {
        console.error('Error loading hotel data:', error);
        toast({
          title: "Loading Failed",
          description: "Failed to load hotel details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadHotelData();
  }, [hotelId, toast, navigate]);

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
    setValue('checkInDate', checkInDate);
    setValue('checkOutDate', checkOutDate);
    setValue('numberOfRooms', numberOfRooms);
    setValue('numberOfGuests', numberOfGuests);
    setShowBookingForm(true);
  };

  // Handle booking submission
  const onSubmitBooking = async (data: BookingFormData) => {
    if (!selectedRoom || !hotel) return;

    setBookingLoading(true);
    try {
      const nights = calculateNights();
      const totalAmount = selectedRoom.pricePerNight * nights * data.numberOfRooms;

      const bookingData: Omit<HotelBooking, 'id' | 'created_at'> = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomTypeId: selectedRoom.id,
        roomTypeName: selectedRoom.name,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone.startsWith('+91') ? data.guestPhone : `+91${data.guestPhone}`,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numberOfRooms: data.numberOfRooms,
        numberOfGuests: data.numberOfGuests,
        totalNights: nights,
        pricePerNight: selectedRoom.pricePerNight,
        totalAmount,
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        specialRequests: data.specialRequests
      };

      const bookingId = await HotelService.createHotelBooking(bookingData);
      
      toast({
        title: "Booking Successful!",
        description: "Your hotel booking has been submitted successfully",
      });

      // Navigate to booking success page
      navigate(`/hotels/booking-success?bookingId=${bookingId}`);
      
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

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const normalizedAmenity = amenity.toLowerCase().replace(/[^a-z]/g, '');
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (normalizedAmenity.includes(key)) {
        return Icon;
      }
    }
    return null;
  };

  // Navigate images
  const nextImage = () => {
    if (hotel && hotel.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === hotel.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hotel && hotel.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? hotel.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-blue-dark mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hotel details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h2>
            <p className="text-gray-600 mb-4">The requested hotel could not be found.</p>
            <Button onClick={() => navigate('/hotels')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hotels
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Images */}
        <div className="relative">
          <div className="h-96 md:h-[500px] relative overflow-hidden">
            {hotel.images && hotel.images.length > 0 ? (
              <img
                src={hotel.images[currentImageIndex]}
                alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xl">No Image Available</span>
              </div>
            )}
            
            {/* Image Navigation */}
            {hotel.images && hotel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {hotel.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Back Button */}
            <Button
              onClick={() => navigate('/hotels')}
              variant="secondary"
              className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hotels
            </Button>

            {/* Featured Badge */}
            {hotel.featured && (
              <Badge className="absolute top-4 right-4 bg-travel-orange text-white">
                Featured Hotel
              </Badge>
            )}
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hotel Info */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                        {hotel.name}
                      </CardTitle>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{hotel.address}, {hotel.city}, {hotel.state} - {hotel.pincode}</span>
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
                        <span className="text-lg font-semibold text-gray-900">
                          {hotel.rating.toFixed(1)}
                        </span>
                        {hotel.reviews > 0 && (
                          <span className="text-gray-600">
                            ({hotel.reviews} review{hotel.reviews > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-travel-blue-dark mb-1">
                        ₹{hotel.priceRange.min.toLocaleString()}
                      </div>
                      <div className="text-gray-600">starting from / night</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {hotel.description}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Hotel Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div key={amenity} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {Icon ? (
                            <Icon className="w-5 h-5 text-travel-blue-dark" />
                          ) : (
                            <Check className="w-5 h-5 text-travel-blue-dark" />
                          )}
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Hotel Policies */}
              <Card>
                <CardHeader>
                  <CardTitle>Hotel Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-travel-blue-dark" />
                        <span className="font-medium">Check-in/Check-out</span>
                      </div>
                      <p className="text-gray-600 mb-1">Check-in: {hotel.checkInTime}</p>
                      <p className="text-gray-600">Check-out: {hotel.checkOutTime}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-medium">Hotel Policies</span>
                      </div>
                      <ul className="space-y-2">
                        {hotel.policies.map((policy, index) => (
                          <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {policy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Rooms</CardTitle>
                  {checkInDate && checkOutDate && (
                    <p className="text-gray-600">
                      {checkInDate} to {checkOutDate} • {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roomTypes.length > 0 ? roomTypes.map((roomType) => (
                      <div key={roomType.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                  {roomType.name}
                                </h3>
                                <p className="text-gray-600 mb-2">{roomType.description}</p>
                              </div>
                            </div>

                            {/* Room Features */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>Max {roomType.maxOccupancy} guests</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Bed className="w-4 h-4" />
                                <span>{roomType.bedType}</span>
                              </div>
                              {roomType.roomSize && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>{roomType.roomSize}</span>
                                </div>
                              )}
                              {roomType.hasAC && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Wind className="w-4 h-4" />
                                  <span>AC</span>
                                </div>
                              )}
                            </div>

                            {/* Room Amenities */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {roomType.hasWiFi && (
                                <Badge variant="secondary" className="text-xs">
                                  <Wifi className="w-3 h-3 mr-1" />
                                  Free WiFi
                                </Badge>
                              )}
                              {roomType.hasBreakfast && (
                                <Badge variant="secondary" className="text-xs">
                                  <Coffee className="w-3 h-3 mr-1" />
                                  Breakfast
                                </Badge>
                              )}
                              {roomType.amenities.map((amenity) => (
                                <Badge key={amenity} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Price and Book */}
                          <div className="text-center lg:text-right lg:min-w-[200px]">
                            <div className="text-2xl font-bold text-travel-blue-dark mb-1">
                              ₹{roomType.pricePerNight.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">per night</div>
                            {checkInDate && checkOutDate && (
                              <div className="text-sm text-gray-500 mb-3">
                                Total: ₹{(roomType.pricePerNight * calculateNights()).toLocaleString()}
                              </div>
                            )}
                            <Button 
                              onClick={() => handleRoomSelect(roomType)}
                              className="bg-travel-orange hover:bg-travel-orange/90 text-white w-full lg:w-auto"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No rooms available for the selected dates.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Book Card */}
                {checkInDate && checkOutDate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Stay</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{checkInDate} to {checkOutDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{numberOfGuests} guest{numberOfGuests > 1 ? 's' : ''}, {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{calculateNights()} night{calculateNights() > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-travel-orange" />
                        <div>
                          <p className="font-medium">Call us</p>
                          <a href="tel:+918985816481" className="text-sm text-travel-blue-dark hover:underline">
                            +91 8985816481
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-travel-orange" />
                        <div>
                          <p className="font-medium">Email us</p>
                          <a href="mailto:info@anandtravelagency.com" className="text-sm text-travel-blue-dark hover:underline">
                            info@anandtravelagency.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Your Stay</DialogTitle>
          </DialogHeader>
          
          {selectedRoom && (
            <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-6">
              {/* Room Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedRoom.name}</h3>
                <p className="text-gray-600 mb-3">{hotel.name}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Check-in:</span>
                    <p className="font-medium">{watch('checkInDate')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-out:</span>
                    <p className="font-medium">{watch('checkOutDate')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Guests:</span>
                    <p className="font-medium">{watch('numberOfGuests')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rooms:</span>
                    <p className="font-medium">{watch('numberOfRooms')}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-travel-blue-dark">
                      ₹{(selectedRoom.pricePerNight * calculateNights() * watch('numberOfRooms')).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    ₹{selectedRoom.pricePerNight.toLocaleString()} × {calculateNights()} night{calculateNights() > 1 ? 's' : ''} × {watch('numberOfRooms')} room{watch('numberOfRooms') > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Guest Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      {...register('guestName', { required: 'Full name is required' })}
                      placeholder="Enter your full name"
                    />
                    {errors.guestName && (
                      <p className="text-red-500 text-sm mt-1">{errors.guestName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      {...register('guestEmail', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/,
                          message: 'Please enter a valid email'
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    {...register('guestPhone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Please enter a valid 10-digit phone number'
                      }
                    })}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.guestPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.guestPhone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <Textarea
                    {...register('specialRequests')}
                    placeholder="Any special requirements or requests"
                    rows={3}
                  />
                </div>
              </div>

              {/* Booking Dates */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Booking Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date *
                    </label>
                    <Input
                      type="date"
                      {...register('checkInDate', { required: 'Check-in date is required' })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.checkInDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.checkInDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date *
                    </label>
                    <Input
                      type="date"
                      {...register('checkOutDate', { required: 'Check-out date is required' })}
                      min={watch('checkInDate') || new Date().toISOString().split('T')[0]}
                    />
                    {errors.checkOutDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.checkOutDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedRoom.maxOccupancy}
                      {...register('numberOfGuests', { 
                        required: 'Number of guests is required',
                        min: { value: 1, message: 'At least 1 guest required' },
                        max: { value: selectedRoom.maxOccupancy, message: `Maximum ${selectedRoom.maxOccupancy} guests allowed` }
                      })}
                    />
                    {errors.numberOfGuests && (
                      <p className="text-red-500 text-sm mt-1">{errors.numberOfGuests.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Rooms *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      {...register('numberOfRooms', { 
                        required: 'Number of rooms is required',
                        min: { value: 1, message: 'At least 1 room required' },
                        max: { value: 5, message: 'Maximum 5 rooms allowed' }
                      })}
                    />
                    {errors.numberOfRooms && (
                      <p className="text-red-500 text-sm mt-1">{errors.numberOfRooms.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-travel-orange hover:bg-travel-orange/90"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default HotelDetailPage;
