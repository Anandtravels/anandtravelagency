import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Wifi, 
  Car, 
  Coffee,
  Utensils,
  Waves,
  Dumbbell,
  SlidersHorizontal,
  Grid,
  List,
  MapPin,
  Filter
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HotelSearchBar from "./HotelSearchBar";
import HotelCardGrid from "./HotelCardGrid";
import { HotelService } from "../services/hotelService";
import { Hotel, HotelSearchFilters } from "../types/hotel";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const HotelsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Search filters
  const [filters, setFilters] = useState<HotelSearchFilters>({
    city: searchParams.get('city') || '',
    checkInDate: '',
    checkOutDate: '',
    numberOfRooms: 1,
    numberOfGuests: 2,
    priceRange: { min: 0, max: 10000 },
    amenities: [],
    rating: 0,
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  // Available amenities
  const availableAmenities = [
    { id: 'wifi', label: 'Free WiFi', icon: Wifi },
    { id: 'parking', label: 'Free Parking', icon: Car },
    { id: 'breakfast', label: 'Free Breakfast', icon: Coffee },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils },
    { id: 'pool', label: 'Swimming Pool', icon: Waves },
    { id: 'gym', label: 'Fitness Center', icon: Dumbbell },
  ];

  // Load hotels with real-time updates
  useEffect(() => {
    setLoading(true);
    
    // Use real-time listener for instant updates when hotels are added/modified
    const unsubscribe = HotelService.onHotelsChange((allHotels) => {
      // Filter for active hotels only on user-facing page
      const activeHotels = allHotels.filter(hotel => hotel.status === 'active');
      setHotels(activeHotels);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    let filtered = [...hotels];

    // Apply search filter (matches city OR hotel name)
    if (filters.city && filters.city.trim()) {
      const searchLower = filters.city.toLowerCase().trim();
      filtered = filtered.filter(hotel => 
        hotel.city.toLowerCase().includes(searchLower) ||
        hotel.name.toLowerCase().includes(searchLower) ||
        (hotel.address && hotel.address.toLowerCase().includes(searchLower))
      );
    }

    // Apply price filter
    if (filters.priceRange) {
      filtered = filtered.filter(hotel => 
        hotel.priceRange.min <= filters.priceRange!.max && 
        hotel.priceRange.max >= filters.priceRange!.min
      );
    }

    // Apply rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(hotel => hotel.rating >= filters.rating!);
    }

    // Apply amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(hotel => 
        filters.amenities!.some(amenity => hotel.amenities.includes(amenity))
      );
    }

    // Sort hotels
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any = a[filters.sortBy!];
        let bValue: any = b[filters.sortBy!];
        
        if (filters.sortBy === 'price') {
          aValue = a.priceRange.min;
          bValue = b.priceRange.min;
        }
        
        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [hotels, filters]);

  // Update search filters
  const updateFilters = (newFilters: Partial<HotelSearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    // Update URL params - only city for clean URLs
    const params = new URLSearchParams();
    if (updated.city) params.set('city', updated.city);
    
    setSearchParams(params, { replace: true });
  };

  // Handle search from search bar
  const handleSearch = (searchData: any) => {
    updateFilters({
      city: searchData.city
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <div className="relative bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium py-16">
          <div className="container-custom">
            <div className="text-center text-white mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
              <p className="text-xl max-w-3xl mx-auto opacity-90">
                Discover comfortable hotels with great amenities at the best prices
              </p>
            </div>
            
            {/* Search Form */}
            <HotelSearchBar
              city={filters.city}
              onSearch={handleSearch}
              className="max-w-4xl mx-auto"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="container-custom py-8">
          {/* Results Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filters.city ? `Search results for "${filters.city}"` : 'All Available Hotels'}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} found
                {filters.city && hotels.length !== filteredHotels.length && ` (${hotels.length} total)`}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-white rounded-lg border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-travel-blue-dark text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-travel-blue-dark text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              
              {/* Sort Options */}
              <Select 
                value={`${filters.sortBy}-${filters.sortOrder}`} 
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  updateFilters({ sortBy: sortBy as any, sortOrder: sortOrder as 'asc' | 'desc' });
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
                  <SelectItem value="rating-asc">Rating (Low to High)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80 space-y-6">
                {/* Sort Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sort & Filter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Price per night</label>
                      <Slider
                        value={[filters.priceRange?.min || 0, filters.priceRange?.max || 10000]}
                        onValueChange={([min, max]) => updateFilters({ priceRange: { min, max } })}
                        max={10000}
                        min={0}
                        step={500}
                        className="mb-3"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₹{filters.priceRange?.min || 0}</span>
                        <span>₹{filters.priceRange?.max || 10000}</span>
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Minimum Rating</label>
                      <Select
                        value={filters.rating?.toString() || '0'}
                        onValueChange={(value) => updateFilters({ rating: parseFloat(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any rating</SelectItem>
                          <SelectItem value="3">3+ stars</SelectItem>
                          <SelectItem value="3.5">3.5+ stars</SelectItem>
                          <SelectItem value="4">4+ stars</SelectItem>
                          <SelectItem value="4.5">4.5+ stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amenities Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Amenities</label>
                      <div className="space-y-3">
                        {availableAmenities.map((amenity) => (
                          <div key={amenity.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity.id}
                              checked={filters.amenities?.includes(amenity.label) || false}
                              onCheckedChange={(checked) => {
                                const updatedAmenities = checked
                                  ? [...(filters.amenities || []), amenity.label]
                                  : (filters.amenities || []).filter(a => a !== amenity.label);
                                updateFilters({ amenities: updatedAmenities });
                              }}
                            />
                            <label htmlFor={amenity.id} className="flex items-center text-sm cursor-pointer">
                              <amenity.icon className="w-4 h-4 mr-2 text-travel-blue-dark" />
                              {amenity.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      onClick={() => updateFilters({
                        priceRange: { min: 0, max: 10000 },
                        amenities: [],
                        rating: 0
                      })}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Hotel Results */}
            <div className="flex-1">
              <HotelCardGrid
                hotels={filteredHotels}
                loading={loading}
                filters={filters}
                viewMode={viewMode}
                className={showFilters ? 'w-full' : 'w-full'}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HotelsPage;
