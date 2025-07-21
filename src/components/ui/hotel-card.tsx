import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Star, 
  Wifi, 
  Car, 
  Coffee,
  Utensils,
  Waves,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Eye,
  Heart,
  Share2,
  Phone,
  Clock
} from "lucide-react";
import { Hotel } from "../../types/hotel";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import HotelQuickViewModal from "./HotelQuickViewModal";

interface HotelCardProps {
  hotel: Hotel;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  numberOfGuests?: number;
  className?: string;
  viewMode?: 'grid' | 'list';
}

const HotelCard = ({ 
  hotel, 
  checkInDate, 
  checkOutDate, 
  numberOfRooms = 1, 
  numberOfGuests = 2,
  className = "",
  viewMode = 'grid'
}: HotelCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

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

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const normalizedAmenity = amenity.toLowerCase().replace(/[^a-z\s]/g, '');
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (normalizedAmenity.includes(key)) {
        return Icon;
      }
    }
    return null;
  };

  // Navigate image gallery
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === hotel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? hotel.images.length - 1 : prev - 1
    );
  };

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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const nights = calculateNights();

  // Handle like toggle
  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Handle share
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `Check out ${hotel.name} in ${hotel.city}`,
        url: window.location.origin + `/hotels/${hotel.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/hotels/${hotel.id}`);
    }
  };

  // Handle quick call
  const handleQuickCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = 'tel:+918985816481';
  };

  // List view layout
  if (viewMode === 'list') {
    return (
      <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}>
        <div className="flex">
          {/* Image Section */}
          <div className="relative w-80 h-64 flex-shrink-0">
            {hotel.images && hotel.images.length > 0 ? (
              <img
                src={hotel.images[currentImageIndex]}
                alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
            
            {/* Image Navigation for List View */}
            {hotel.images && hotel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleLikeToggle}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Featured Badge */}
            {hotel.featured && (
              <Badge className="absolute top-3 left-3 bg-travel-orange text-white">
                Featured
              </Badge>
            )}

            {/* Rating Badge */}
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{hotel.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Content Section for List View */}
          <CardContent className="flex-1 p-6">
            <div className="flex justify-between h-full">
              <div className="flex-1">
                {/* Hotel Name and Location */}
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{hotel.address}, {hotel.city}</span>
                  </div>
                </div>

                {/* Description */}
                {hotel.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {hotel.description}
                  </p>
                )}

                {/* Amenities */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 6).map((amenity) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div key={amenity} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {Icon && <Icon className="w-3 h-3 mr-1" />}
                          <span className="truncate">{amenity}</span>
                        </div>
                      );
                    })}
                    {hotel.amenities.length > 6 && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        +{hotel.amenities.length - 6} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                {checkInDate && checkOutDate && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(checkInDate)} - {formatDate(checkOutDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{numberOfGuests} guests, {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {nights} night{nights > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col justify-between items-end ml-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-travel-blue-dark">
                    ₹{hotel.priceRange.min.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    per night{nights > 1 ? ` • ₹${(hotel.priceRange.min * nights).toLocaleString()} total` : ''}
                  </div>
                  {hotel.reviews > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {hotel.reviews} review{hotel.reviews > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleQuickCall}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-travel-blue-dark text-travel-blue-dark hover:bg-travel-blue-dark hover:text-white transition-colors rounded-lg"
                  >
                    <Phone className="w-4 h-4" />
                    Quick Call
                  </button>
                  
                  <Link
                    to={`/hotels/${hotel.id}${checkInDate && checkOutDate 
                      ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}&rooms=${numberOfRooms}&guests=${numberOfGuests}` 
                      : ''}`}
                    className="btn-primary text-sm px-4 py-2 text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid view layout (original with enhancements)
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}>
      <div className="relative">
        {/* Image Gallery */}
        <div className="relative h-64 overflow-hidden">
          {hotel.images && hotel.images.length > 0 ? (
            <img
              src={hotel.images[currentImageIndex]}
              alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setImageLoaded(true)}
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
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {hotel.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleLikeToggle}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Featured Badge */}
          {hotel.featured && (
            <Badge className="absolute top-3 left-3 bg-travel-orange text-white">
              Featured
            </Badge>
          )}

          {/* Rating Badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{hotel.rating.toFixed(1)}</span>
          </div>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="absolute bottom-3 left-3 bg-white/90 text-gray-700 px-3 py-1 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-white"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Quick View
          </button>
        </div>

        <CardContent className="p-4">
          {/* Hotel Name and Location */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
              {hotel.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{hotel.address}, {hotel.city}</span>
            </div>
          </div>

          {/* Check-in/Check-out Times */}
          <div className="mb-3 flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
            <Clock className="w-3 h-3 mr-1" />
            <span>Check-in: {hotel.checkInTime} | Check-out: {hotel.checkOutTime}</span>
          </div>

          {/* Amenities */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.slice(0, 4).map((amenity) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div key={amenity} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {Icon && <Icon className="w-3 h-3 mr-1" />}
                    <span className="truncate">{amenity}</span>
                  </div>
                );
              })}
              {hotel.amenities.length > 4 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  +{hotel.amenities.length - 4} more
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          {checkInDate && checkOutDate && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(checkInDate)} - {formatDate(checkOutDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{numberOfGuests} guests, {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {nights} night{nights > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-travel-blue-dark">
                ₹{hotel.priceRange.min.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                per night{nights > 1 ? ` • ₹${(hotel.priceRange.min * nights).toLocaleString()} total` : ''}
              </div>
              {hotel.reviews > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {hotel.reviews} review{hotel.reviews > 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleQuickCall}
                className="flex items-center gap-1 px-2 py-1 text-xs border border-travel-blue-dark text-travel-blue-dark hover:bg-travel-blue-dark hover:text-white transition-colors rounded"
              >
                <Phone className="w-3 h-3" />
                Call
              </button>
              
              <Link
                to={`/hotels/${hotel.id}${checkInDate && checkOutDate 
                  ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}&rooms=${numberOfRooms}&guests=${numberOfGuests}` 
                  : ''}`}
                className="btn-primary text-sm px-4 py-2 text-center"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* Hotel Description Preview */}
          {hotel.description && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
              {hotel.description}
            </p>
          )}
        </CardContent>
      </div>

      {/* Quick View Modal */}
      <HotelQuickViewModal
        hotel={hotel}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        numberOfRooms={numberOfRooms}
        numberOfGuests={numberOfGuests}
      />
    </Card>
  );
};

export default HotelCard;
