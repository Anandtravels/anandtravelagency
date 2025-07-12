export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  from: string;
  to: string;
  journey_date: string;
  passengers: any; // Can be string or array of objects
  additional_requirements?: string;
  booking_type: 'train' | 'bus' | 'flight' | 'cab' | '';
  status: 'pending' | 'completed' | 'in_process' | 'booked' | 'hold';
  station_name?: string;
  travel_class?: string;
  boarding_point?: string;
  drop_point?: string;
  class_preference?: string;
  ticket_number?: string;
  pnr?: string;
  booking_reference?: string;
  payment_status?: 'pending' | 'paid';
  fare_details?: string;
  train_booking_type?: 'general' | 'tatkal' | 'premium_tatkal' | '';
  train_class?: string;
  preferred_trains?: string;
  admin_notes?: string;
  created_at: Date;
  updated_at?: any;
  updated_by?: string;
  assignedAgent?: string;
  assignedAt?: any;
  coupon?: {
    code: string;
    discount: number;
    type: 'fixed' | 'percentage';
  };
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  created_at: any;
}

export interface MessageDetails {
  ticketCost: string;
  bookingCharge: string;
  totalAmount: string;
  additionalInfo: string;
  bookingType: string;
  passengerCount: number;
  couponCode: string;
  couponDiscount: number;
  couponType: 'fixed' | 'percentage' | null;
}

export interface EditFormData {
  name: string;
  email: string;
  phone: string;
  from: string;
  to: string;
  journey_date: string;
  passengers: string;
  additional_requirements: string;
  booking_type: string;
  status: string;
  station_name: string;
  travel_class: string;
  boarding_point: string;
  drop_point: string;
  class_preference: string;
  ticket_number: string;
  pnr: string;
  booking_reference: string;
  payment_status: string;
  fare_details: string;
  train_booking_type: string;
  train_class: string;
  preferred_trains: string;
}
