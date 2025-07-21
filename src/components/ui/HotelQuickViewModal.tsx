import { useState } from "react";
import { X, MapPin, Star, Clock, Users, Bed, Wifi, Car, Coffee, Utensils, Waves, Dumbbell, ChevronLeft, ChevronRight, Phone, Calendar } from "lucide-react";
import { Dialog, DialogContent } from "./dialog";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Hotel } from "../../types/hotel";
import { Link } from "react-router-dom";

interface HotelQuickViewModalProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  numberOfGuests?: number;
}

const HotelQuickViewModal = ({
  hotel,
  isOpen,
  onClose,
  checkInDate,
  checkOutDate,
  numberOfRooms = 1,
  numberOfGuests = 2
}: HotelQuickViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!hotel) return null;

  // Available amenities with icons
  const amenityIcons: Record<string, any> = {
    'wifi': Wifi,
    'free wifi': Wifi,
    'parking': Car,
    'free parking': Car,
    'breakfast': Coffee,
    'free breakfast': Coffee,
    'restaurant': Utensils,
    'pool': Waves,
    'swimming pool': Waves,
    'gym': Dumbbell,
    'fitness center': Dumbbell,
  };

  const getAmenityIcon = (amenity: string) => {
    const normalizedAmenity = amenity.toLowerCase().replace(/[^a-z\s]/g, '');
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (normalizedAmenity.includes(key)) {
        return Icon;
      }
    }
    return null;
  };

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

  const calculateNights = () => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const nights = calculateNights();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Gallery */}
          <div className="relative h-80 overflow-hidden">
            {hotel.images && hotel.images.length > 0 ? (
              <img
                src={hotel.images[currentImageIndex]}
                alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}

            {/* Image Navigation */}
            {hotel.images && hotel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
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

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {hotel.featured && (
                <Badge className="bg-travel-orange text-white">
                  Featured
                </Badge>
              )}
              <div className="bg-black/70 text-white px-3 py-1 rounded-md flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{hotel.rating.toFixed(1)}</span>
                {hotel.reviews > 0 && (
                  <span className="text-xs">({hotel.reviews})</span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Hotel Info */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h2>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{hotel.address}, {hotel.city}, {hotel.state}</span>
                  </div>
                  
                  {/* Check-in/Check-out Times */}
                  <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Check-in: {hotel.checkInTime} | Check-out: {hotel.checkOutTime}</span>
                  </div>
                </div>

                {/* Description */}
                {hotel.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">About This Hotel</h3>
                    <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
                  </div>
                )}

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {hotel.amenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div key={amenity} className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          {Icon && <Icon className="w-4 h-4 mr-2 text-travel-blue-dark" />}
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Policies */}
                {hotel.policies && hotel.policies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Hotel Policies</h3>
                    <div className="space-y-2">
                      {hotel.policies.map((policy, index) => (
                        <div key={index} className="flex items-start text-sm text-gray-600">
                          <span className="w-2 h-2 bg-travel-blue-dark rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{policy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-travel-blue-dark">
                        ₹{hotel.priceRange.min.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        per night{nights > 1 ? ` • ₹${(hotel.priceRange.min * nights).toLocaleString()} total` : ''}
                      </div>
                    </div>

                    {/* Booking Details */}
                    {checkInDate && checkOutDate && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(checkInDate)} - {formatDate(checkOutDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{numberOfGuests} guests • {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bed className="w-4 h-4 text-gray-500" />
                            <span>{nights} night{nights > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Options */}
                    <div className="space-y-3 mb-4">
                      <button
                        onClick={() => window.location.href = 'tel:+918985816481'}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-travel-blue-dark text-travel-blue-dark hover:bg-travel-blue-dark hover:text-white transition-colors rounded-lg"
                      >
                        <Phone className="w-4 h-4" />
                        Call for Booking
                      </button>
                    </div>

                    {/* View Details Button */}
                    <Link
                      to={`/hotels/${hotel.id}${checkInDate && checkOutDate 
                        ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}&rooms=${numberOfRooms}&guests=${numberOfGuests}` 
                        : ''}`}
                      className="w-full btn-primary py-3 px-4 text-center block"
                      onClick={onClose}
                    >
                      View Full Details & Book
                    </Link>

                    {/* Price Range Note */}
                    {hotel.priceRange.min !== hotel.priceRange.max && (
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Prices from ₹{hotel.priceRange.min.toLocaleString()} to ₹{hotel.priceRange.max.toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelQuickViewModal;
