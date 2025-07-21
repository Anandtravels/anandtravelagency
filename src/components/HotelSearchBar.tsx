import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Search,
  Plus,
  Minus
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useToast } from "../hooks/use-toast";

interface HotelSearchBarProps {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  numberOfGuests?: number;
  onSearch?: (filters: HotelSearchFilters) => void;
  autoSearch?: boolean;
  className?: string;
}

interface HotelSearchFilters {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  numberOfGuests: number;
}

const HotelSearchBar = ({
  city = '',
  checkInDate = '',
  checkOutDate = '',
  numberOfRooms = 1,
  numberOfGuests = 2,
  onSearch,
  autoSearch = false,
  className = ""
}: HotelSearchBarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Search state
  const [searchData, setSearchData] = useState<HotelSearchFilters>({
    city,
    checkInDate,
    checkOutDate,
    numberOfRooms,
    numberOfGuests
  });

  const [guestsPopoverOpen, setGuestsPopoverOpen] = useState(false);

  // Update search data when props change
  useEffect(() => {
    setSearchData({
      city,
      checkInDate,
      checkOutDate,
      numberOfRooms,
      numberOfGuests
    });
  }, [city, checkInDate, checkOutDate, numberOfRooms, numberOfGuests]);

  // Handle input changes
  const updateSearchData = (field: keyof HotelSearchFilters, value: string | number) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get minimum checkout date (day after checkin)
  const getMinCheckoutDate = () => {
    if (searchData.checkInDate) {
      const checkInDate = new Date(searchData.checkInDate);
      checkInDate.setDate(checkInDate.getDate() + 1);
      return checkInDate.toISOString().split('T')[0];
    }
    return getMinDate();
  };

  // Validate search data
  const validateSearch = (): boolean => {
    if (!searchData.city.trim()) {
      toast({
        title: "City Required",
        description: "Please enter a destination city",
        variant: "destructive"
      });
      return false;
    }

    if (!searchData.checkInDate) {
      toast({
        title: "Check-in Date Required",
        description: "Please select a check-in date",
        variant: "destructive"
      });
      return false;
    }

    if (!searchData.checkOutDate) {
      toast({
        title: "Check-out Date Required",
        description: "Please select a check-out date",
        variant: "destructive"
      });
      return false;
    }

    const checkIn = new Date(searchData.checkInDate);
    const checkOut = new Date(searchData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      toast({
        title: "Invalid Check-in Date",
        description: "Check-in date cannot be in the past",
        variant: "destructive"
      });
      return false;
    }

    if (checkOut <= checkIn) {
      toast({
        title: "Invalid Check-out Date",
        description: "Check-out date must be after check-in date",
        variant: "destructive"
      });
      return false;
    }

    if (searchData.numberOfRooms < 1 || searchData.numberOfRooms > 10) {
      toast({
        title: "Invalid Number of Rooms",
        description: "Number of rooms must be between 1 and 10",
        variant: "destructive"
      });
      return false;
    }

    if (searchData.numberOfGuests < 1 || searchData.numberOfGuests > 20) {
      toast({
        title: "Invalid Number of Guests",
        description: "Number of guests must be between 1 and 20",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // Handle search
  const handleSearch = () => {
    if (!validateSearch()) return;

    if (onSearch) {
      onSearch(searchData);
    } else {
      // Navigate to hotels page with search params
      const params = new URLSearchParams({
        city: searchData.city,
        checkIn: searchData.checkInDate,
        checkOut: searchData.checkOutDate,
        rooms: searchData.numberOfRooms.toString(),
        guests: searchData.numberOfGuests.toString()
      });
      navigate(`/hotels?${params.toString()}`);
    }
  };

  // Handle auto search (when used as a filter)
  useEffect(() => {
    if (autoSearch && onSearch) {
      onSearch(searchData);
    }
  }, [searchData, autoSearch, onSearch]);

  // Calculate number of nights
  const calculateNights = () => {
    if (searchData.checkInDate && searchData.checkOutDate) {
      const checkIn = new Date(searchData.checkInDate);
      const checkOut = new Date(searchData.checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Destination */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="City or hotel name"
              value={searchData.city}
              onChange={(e) => updateSearchData('city', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Check-in */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="date"
              value={searchData.checkInDate}
              onChange={(e) => updateSearchData('checkInDate', e.target.value)}
              min={getMinDate()}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Check-out */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out
            {calculateNights() > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                ({calculateNights()} night{calculateNights() > 1 ? 's' : ''})
              </span>
            )}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="date"
              value={searchData.checkOutDate}
              onChange={(e) => updateSearchData('checkOutDate', e.target.value)}
              min={getMinCheckoutDate()}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Guests & Rooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guests & Rooms
          </label>
          <Popover open={guestsPopoverOpen} onOpenChange={setGuestsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal h-10"
              >
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">
                  {searchData.numberOfGuests} guest{searchData.numberOfGuests > 1 ? 's' : ''}, {searchData.numberOfRooms} room{searchData.numberOfRooms > 1 ? 's' : ''}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                {/* Guests */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Guests</div>
                    <div className="text-sm text-gray-500">Number of guests</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchData('numberOfGuests', Math.max(1, searchData.numberOfGuests - 1))}
                      disabled={searchData.numberOfGuests <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{searchData.numberOfGuests}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchData('numberOfGuests', Math.min(20, searchData.numberOfGuests + 1))}
                      disabled={searchData.numberOfGuests >= 20}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Rooms</div>
                    <div className="text-sm text-gray-500">Number of rooms</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchData('numberOfRooms', Math.max(1, searchData.numberOfRooms - 1))}
                      disabled={searchData.numberOfRooms <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{searchData.numberOfRooms}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchData('numberOfRooms', Math.min(10, searchData.numberOfRooms + 1))}
                      disabled={searchData.numberOfRooms >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={() => setGuestsPopoverOpen(false)}
                  className="w-full"
                  size="sm"
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Search Button */}
        <div className="flex items-end">
          <Button 
            onClick={handleSearch}
            className="w-full bg-travel-orange hover:bg-travel-orange/90 text-white h-10"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Quick Info */}
      {searchData.city && searchData.checkInDate && searchData.checkOutDate && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{searchData.city}</span> • {formatDateDisplay(searchData.checkInDate)} to {formatDateDisplay(searchData.checkOutDate)} • {calculateNights()} night{calculateNights() > 1 ? 's' : ''} • {searchData.numberOfGuests} guest{searchData.numberOfGuests > 1 ? 's' : ''} • {searchData.numberOfRooms} room{searchData.numberOfRooms > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelSearchBar;
