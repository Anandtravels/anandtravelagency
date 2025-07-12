import { Booking } from '@/types/admin';

// Commission rates for different booking types
export const COMMISSION_RATES = {
  'general': 0.02, // 2%
  'tatkal': 0.03, // 3%
  'premium_tatkal': 0.04, // 4%
  'default': 0.02 // 2%
} as const;

// Calculate commission based on booking type and actual price
export const calculateCommission = (booking: Booking): number => {
  if (!booking.actual_price || booking.actual_price <= 0) return 0;
  
  const rate = COMMISSION_RATES[booking.train_booking_type as keyof typeof COMMISSION_RATES] || COMMISSION_RATES.default;
  return Math.round(booking.actual_price * rate);
};

// Calculate profit based on booking scenario
export const calculateProfit = (booking: Booking): number => {
  const actualPrice = booking.actual_price || 0;
  const ticketCost = booking.ticket_cost || 0;
  
  // Use manual commission amount if provided, otherwise calculate automatically
  const commissionAmount = (booking.commission_amount !== undefined && booking.commission_amount !== null) 
    ? booking.commission_amount 
    : calculateCommission(booking);
  
  // Always subtract commission from actual price as per requirement
  // Profit = Actual Price - Ticket Cost - Commission Amount
  return Math.max(0, actualPrice - ticketCost - commissionAmount);
};

// Get detailed profit breakdown for display
export const getProfitBreakdown = (booking: Booking): {
  actualPrice: number;
  ticketCost: number;
  commission: number;
  profit: number;
  isAgentBooking: boolean;
  agentEmail?: string;
} => {
  const actualPrice = booking.actual_price || 0;
  const ticketCost = booking.ticket_cost || 0;
  
  // Use manual commission amount if provided, otherwise calculate automatically
  const commission = (booking.commission_amount !== undefined && booking.commission_amount !== null) 
    ? booking.commission_amount 
    : calculateCommission(booking);
    
  const profit = calculateProfit(booking);
  const isAgentBooking = !!(booking.assignedAgent && booking.assignedAgent !== 'admin@anandtravels.com');
  
  return {
    actualPrice,
    ticketCost,
    commission, // Always show commission as it's always subtracted now
    profit,
    isAgentBooking,
    agentEmail: isAgentBooking ? booking.assignedAgent : undefined
  };
};

// Validate profit calculation
export const validateProfitCalculation = (booking: Booking): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if required fields are present
  if (!booking.actual_price || booking.actual_price <= 0) {
    errors.push('Actual price is required and must be greater than 0');
  }
  
  if (!booking.ticket_cost || booking.ticket_cost < 0) {
    warnings.push('Ticket cost should be specified');
  }
  
  // Check if profit calculation makes sense
  const breakdown = getProfitBreakdown(booking);
  if (breakdown.profit < 0) {
    warnings.push('Negative profit detected - please verify pricing');
  }
  
  if (breakdown.actualPrice < breakdown.ticketCost) {
    warnings.push('Actual price is less than ticket cost - please verify');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Get commission rate for booking type
export const getCommissionRate = (bookingType?: string): number => {
  return COMMISSION_RATES[bookingType as keyof typeof COMMISSION_RATES] || COMMISSION_RATES.default;
};
