export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  rating: number;
  reviews: number;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  policies: string[];
  priceRange: {
    min: number;
    max: number;
  };
  featured: boolean;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at?: Date;
  created_by: string;
  updated_by?: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  images: string[];
  amenities: string[];
  maxOccupancy: number;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  roomSize?: string;
  bedType: string;
  hasAC: boolean;
  hasWiFi: boolean;
  hasBreakfast: boolean;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at?: Date;
}

export interface HotelBooking {
  id: string;
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomTypeName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  numberOfGuests: number;
  totalNights: number;
  pricePerNight: number;
  totalAmount: number;
  bookingStatus: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  assignedAgent?: string;
  assignedAt?: Date;
  created_at: Date;
  updated_at?: Date;
  updated_by?: string;
  cancellationReason?: string;
  adminNotes?: string;
}

export interface HotelAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedHotels: string[];
  permissions: {
    canManageBookings: boolean;
    canBlockRooms: boolean;
    canViewReports: boolean;
  };
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at?: Date;
  created_by: string;
}

export interface RoomAvailability {
  roomTypeId: string;
  date: string;
  availableRooms: number;
  blockedRooms: number;
  bookedRooms: number;
  basePrice: number;
  dynamicPrice?: number;
}

export interface HotelSearchFilters {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  numberOfGuests?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  rating?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'availability';
  sortOrder?: 'asc' | 'desc';
}

export interface HotelFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  images: string[];
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  policies: string[];
  featured: boolean;
  status: 'active' | 'inactive';
}

export interface RoomTypeFormData {
  hotelId: string;
  name: string;
  description: string;
  images: string[];
  amenities: string[];
  maxOccupancy: number;
  pricePerNight: number;
  totalRooms: number;
  roomSize?: string;
  bedType: string;
  hasAC: boolean;
  hasWiFi: boolean;
  hasBreakfast: boolean;
  status: 'active' | 'inactive';
}

export interface HotelStats {
  totalHotels: number;
  activeHotels: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
}
