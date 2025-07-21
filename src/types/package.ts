export interface Package {
  id: string;
  title: string;
  images: string[];
  days: string;
  price: number;
  location: string;
  category: 'domestic' | 'international';
  rating?: number;
  reviews?: number;
  overview: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  maxPeople: number;
  duration: string;
  departureInfo: string;
  minAge: number;
  featured?: boolean;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface ItineraryDay {
  day: string;
  title: string;
  description: string;
}

export interface PackageFormData {
  title: string;
  images: string[];
  days: string;
  price: number;
  location: string;
  category: 'domestic' | 'international';
  overview: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  maxPeople: number;
  duration: string;
  departureInfo: string;
  minAge: number;
  featured: boolean;
  status: 'active' | 'inactive';
}
