import { useState } from "react";
import { Hotel, HotelSearchFilters } from "../types/hotel";
import HotelCard from "./ui/hotel-card";
import { Button } from "./ui/button";
import { 
  Grid, 
  List, 
  SlidersHorizontal,
  MapPin 
} from "lucide-react";

interface HotelCardGridProps {
  hotels: Hotel[];
  loading?: boolean;
  filters?: HotelSearchFilters;
  viewMode?: 'grid' | 'list';
  showFilters?: boolean;
  onToggleFilters?: () => void;
  onUpdateFilters?: (filters: Partial<HotelSearchFilters>) => void;
  className?: string;
}

const HotelCardGrid = ({ 
  hotels, 
  loading = false,
  filters,
  viewMode = 'grid',
  showFilters = false,
  onToggleFilters,
  onUpdateFilters,
  className = ""
}: HotelCardGridProps) => {

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`grid gap-6 ${viewMode === 'grid' 
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
      : 'grid-cols-1'
    }`}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-6 bg-gray-200 rounded w-16"></div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hotels Found</h3>
        <p className="text-gray-600 mb-6">
          {filters?.city 
            ? `No hotels found in ${filters.city}. Try adjusting your search criteria.`
            : 'Try adjusting your search criteria or explore different destinations.'
          }
        </p>
        {onUpdateFilters && (
          <Button
            onClick={() => onUpdateFilters({
              city: '',
              priceRange: { min: 0, max: 10000 },
              amenities: [],
              rating: 0
            })}
            variant="outline"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );

  // Calculate number of nights for display
  const calculateNights = () => {
    if (filters?.checkInDate && filters?.checkOutDate) {
      const checkIn = new Date(filters.checkInDate);
      const checkOut = new Date(filters.checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!hotels || hotels.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={className}>
      {/* Hotels Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            checkInDate={filters?.checkInDate}
            checkOutDate={filters?.checkOutDate}
            numberOfRooms={filters?.numberOfRooms}
            numberOfGuests={filters?.numberOfGuests}
            viewMode={viewMode}
            className="h-full"
          />
        ))}
      </div>

      {/* Load More Button (if needed for pagination) */}
      {hotels.length > 0 && hotels.length % 12 === 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Hotels
          </Button>
        </div>
      )}
    </div>
  );
};

export default HotelCardGrid;
