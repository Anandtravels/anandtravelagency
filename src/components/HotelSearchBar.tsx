import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Search,
  Plus,
  Minus,
  X
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useToast } from "../hooks/use-toast";
import { HotelService } from "../services/hotelService";
import { Hotel } from "../types/hotel";

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
  
  // Autocomplete state
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{type: 'city' | 'hotel', value: string, city?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all hotels for autocomplete
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const hotelsData = await HotelService.getAllHotels();
        // Filter to only active hotels for display
        const activeHotels = hotelsData.filter(h => h.status === 'active');
        setAllHotels(activeHotels);
        
        // Extract unique cities from ALL hotels and sort alphabetically
        const uniqueCities = new Set<string>();
        hotelsData.forEach(hotel => {
          if (hotel.city && hotel.city.trim()) {
            uniqueCities.add(hotel.city.trim());
          }
        });
        const sortedCities = Array.from(uniqueCities)
          .filter(city => city) // Remove empty strings
          .sort((a, b) => a.localeCompare(b));
        setAllCities(sortedCities);
        
        console.log('Loaded cities:', sortedCities); // Debug log
      } catch (error) {
        console.error('Error loading hotels for autocomplete:', error);
      }
    };
    loadHotels();
  }, []);

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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input changes and trigger search as user types
  const updateSearchData = (field: keyof HotelSearchFilters, value: string | number) => {
    const newData = {
      ...searchData,
      [field]: value
    };
    setSearchData(newData);

    // Handle autocomplete for city field
    if (field === 'city' && typeof value === 'string') {
      handleCityInputChange(value);
      
      // Trigger search as user types (debounced effect via parent)
      if (onSearch) {
        onSearch(newData);
      }
    }
  };

  // Handle city input change for autocomplete
  const handleCityInputChange = (input: string) => {
    if (!input.trim()) {
      // Show all cities alphabetically when input is empty
      const citySuggestions = allCities.map(cityName => ({
        type: 'city' as const,
        value: cityName
      }));
      setSuggestions(citySuggestions);
      setShowSuggestions(citySuggestions.length > 0);
      setActiveSuggestionIndex(-1);
      return;
    }

    const searchTerm = input.toLowerCase().trim();
    const hotelSuggestions: Array<{type: 'city' | 'hotel', value: string, city?: string}> = [];

    // Add matching cities from allCities (prioritize cities that start with the search term)
    const matchingCities = allCities
      .filter(cityName => cityName.toLowerCase().includes(searchTerm))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(searchTerm);
        const bStarts = b.toLowerCase().startsWith(searchTerm);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      });

    matchingCities.forEach(cityName => {
      hotelSuggestions.push({
        type: 'city',
        value: cityName
      });
    });

    // Add matching hotel names
    allHotels.forEach(hotel => {
      if (hotel.name.toLowerCase().includes(searchTerm)) {
        hotelSuggestions.push({
          type: 'hotel',
          value: hotel.name,
          city: hotel.city
        });
      }
    });

    // Limit suggestions to 15 items (cities first, then hotels)
    setSuggestions(hotelSuggestions.slice(0, 15));
    setShowSuggestions(hotelSuggestions.length > 0);
    setActiveSuggestionIndex(-1);
  };

  // Show default city suggestions on focus
  const handleInputFocus = () => {
    if (!searchData.city.trim() && allCities.length > 0) {
      const citySuggestions = allCities.map(cityName => ({
        type: 'city' as const,
        value: cityName
      }));
      setSuggestions(citySuggestions);
      setShowSuggestions(true);
    } else if (searchData.city && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: {type: 'city' | 'hotel', value: string, city?: string}) => {
    if (suggestion.type === 'city') {
      setSearchData(prev => ({ ...prev, city: suggestion.value }));
    } else {
      // For hotel, set the city
      setSearchData(prev => ({ ...prev, city: suggestion.city || suggestion.value }));
    }
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
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
        title: "Search Required",
        description: "Please enter a city or hotel name to search",
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
      const params = new URLSearchParams();
      if (searchData.city) params.set('city', searchData.city);
      navigate(`/hotels?${params.toString()}`);
    }
  };

  // Handle auto search (when used as a filter)
  useEffect(() => {
    if (autoSearch && onSearch) {
      onSearch(searchData);
    }
  }, [searchData, autoSearch, onSearch]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Destination Search */}
        <div className="flex-1" ref={wrapperRef}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search city or hotel name..."
              value={searchData.city}
              onChange={(e) => updateSearchData('city', e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              className="pl-10 pr-10 h-12 text-base"
              autoComplete="off"
            />
            {/* Clear Button */}
            {searchData.city && (
              <button
                onClick={() => {
                  setSearchData(prev => ({ ...prev, city: '' }));
                  setSuggestions([]);
                  setShowSuggestions(false);
                  if (onSearch) {
                    onSearch({ ...searchData, city: '' });
                  }
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    className={`px-4 py-2.5 cursor-pointer flex items-start gap-2 ${
                      index === activeSuggestionIndex 
                        ? 'bg-travel-orange/10' 
                        : 'hover:bg-gray-50'
                    } transition-colors`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                  >
                    <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      suggestion.type === 'city' ? 'text-travel-orange' : 'text-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {suggestion.value}
                      </div>
                      {suggestion.type === 'hotel' && suggestion.city && (
                        <div className="text-xs text-gray-500">
                          {suggestion.city}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {suggestion.type === 'city' ? 'City' : 'Hotel'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="bg-travel-orange hover:bg-travel-orange/90 text-white h-12 px-6 sm:w-auto w-full"
        >
          <Search className="w-4 h-4 mr-2" />
          Search Hotels
        </Button>
      </div>

      {/* Active Filter Display */}
      {searchData.city && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-500">Showing results for:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-travel-orange/10 text-travel-orange">
            <MapPin className="w-3 h-3 mr-1" />
            {searchData.city}
            <button
              onClick={() => {
                setSearchData(prev => ({ ...prev, city: '' }));
                if (onSearch) {
                  onSearch({ ...searchData, city: '' });
                }
              }}
              className="ml-2 hover:text-travel-orange/70"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default HotelSearchBar;
