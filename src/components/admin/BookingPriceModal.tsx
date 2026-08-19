import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Booking } from "@/types/admin";
import { calculateBookingCharge } from "@/utils/adminHelpers";

interface BookingPriceModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  booking: Booking | null;
  onSubmit: (priceDetails: PriceDetails) => Promise<void>;
  submitting?: boolean;
}

export interface PriceDetails {
  ticketCost: number;
  bookingType: string;
  classPreference: string;
  bookingCharge: number;
  passengerCount: number;
  additionalInfo?: string;
  couponCode?: string;
  couponDiscount?: number;
  couponType?: 'fixed' | 'percentage' | null;
}

const BookingPriceModal = ({
  isOpen,
  onOpenChange,
  booking,
  onSubmit,
  submitting = false,
}: BookingPriceModalProps) => {
  const [priceDetails, setPriceDetails] = useState<PriceDetails>({
    ticketCost: 0,
    bookingType: 'General Booking',
    classPreference: 'SL',
    bookingCharge: 100,
    passengerCount: 1,
    additionalInfo: '',
    couponCode: '',
    couponDiscount: 0,
    couponType: null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize price details when booking changes
  useEffect(() => {
    if (booking) {
      const initialBookingType = (() => {
        if (booking.booking_type === 'train' && booking.train_booking_type) {
          switch (booking.train_booking_type) {
            case 'general': return 'General Booking';
            case 'tatkal': return 'Tatkal Booking';
            case 'premium_tatkal': return 'Premium Booking';
            case 'advance': return 'Advance Booking';
            default: return booking.train_booking_type;
          }
        }
        return booking.booking_type ? 
          booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1) + ' Booking' 
          : 'General Booking';
      })();
      
      // Map booking train_class to dropdown value
      const mapTrainClassToDropdown = (trainClass: string | undefined): string => {
        if (!trainClass) return 'SL';
        switch (trainClass.toUpperCase()) {
          case 'SL':
          case '2S':
            return 'SL'; // Sleeper category
          case '3A':
          case '3E':
          case 'CC':
            return '3AC/3E'; // AC 3 category
          case '2A':
          case '1A':
          case 'EC':
            return '2AC'; // AC 2 and above category
          default:
            return 'SL';
        }
      };
      
      const passengerCount = Array.isArray(booking.passengers) ? booking.passengers.length : 1;
      const initialClassPreference = mapTrainClassToDropdown(booking.train_class || booking.class_preference);
      const initialBookingCharge = calculateBookingCharge(initialBookingType, initialClassPreference);

      setPriceDetails({
        ticketCost: 0,
        bookingType: initialBookingType,
        classPreference: initialClassPreference,
        bookingCharge: initialBookingCharge,
        passengerCount: passengerCount,
        additionalInfo: '',
        couponCode: booking.coupon?.code || '',
        couponDiscount: booking.coupon?.discount || 0,
        couponType: booking.coupon?.type || null,
      });
    }
  }, [booking]);

  const handleBookingTypeChange = (type: string) => {
    setPriceDetails(prev => {
      const bookingCharge = calculateBookingCharge(type, prev.classPreference);
      return {
        ...prev,
        bookingType: type,
        bookingCharge: bookingCharge
      };
    });
  };

  const handleClassPreferenceChange = (classPreference: string) => {
    setPriceDetails(prev => {
      const bookingCharge = calculateBookingCharge(prev.bookingType, classPreference);
      return {
        ...prev,
        classPreference: classPreference,
        bookingCharge: bookingCharge
      };
    });
  };

  const calculateTotal = (): number => {
    const ticketCost = priceDetails.ticketCost || 0;
    const bookingCharge = priceDetails.bookingCharge || 0;
    const passengerCount = priceDetails.passengerCount || 1;
    
    const totalTicketCost = ticketCost * passengerCount;
    const totalBookingCharge = bookingCharge * passengerCount;
    let finalBookingCharge = totalBookingCharge;
    
    if (priceDetails.couponType && priceDetails.couponDiscount && priceDetails.couponDiscount > 0) {
      const discountAmount = priceDetails.couponType === 'percentage' 
        ? (totalBookingCharge * priceDetails.couponDiscount / 100)
        : priceDetails.couponDiscount;
      
      finalBookingCharge = Math.max(0, totalBookingCharge - discountAmount);
    }
    
    return totalTicketCost + finalBookingCharge;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!priceDetails.ticketCost || priceDetails.ticketCost <= 0) {
      newErrors.ticketCost = 'Ticket cost is required and must be greater than 0';
    }
    
    if (!priceDetails.passengerCount || priceDetails.passengerCount <= 0) {
      newErrors.passengerCount = 'Passenger count must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    await onSubmit(priceDetails);
    
    // Reset form after successful submission
    setPriceDetails({
      ticketCost: 0,
      bookingType: 'General Booking',
      classPreference: 'SL',
      bookingCharge: 100,
      passengerCount: 1,
      additionalInfo: '',
      couponCode: '',
      couponDiscount: 0,
      couponType: null,
    });
    setErrors({});
  };

  const handleCancel = () => {
    // Reset form
    setPriceDetails({
      ticketCost: 0,
      bookingType: 'General Booking',
      classPreference: 'SL',
      bookingCharge: 100,
      passengerCount: 1,
      additionalInfo: '',
      couponCode: '',
      couponDiscount: 0,
      couponType: null,
    });
    setErrors({});
    onOpenChange(false);
  };

  const totalAmount = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] w-[95%] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Generate Invoice - Booking Details</DialogTitle>
        </DialogHeader>
        
        {booking && (
          <div className="space-y-4 my-4">
            {/* Booking Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Booking Information</h3>
              <div className="grid gap-2 text-sm">
                <p><span className="font-medium text-blue-700">Customer:</span> {booking.name}</p>
                <p><span className="font-medium text-blue-700">Phone:</span> {booking.phone}</p>
                <p><span className="font-medium text-blue-700">Journey:</span> {booking.from} → {booking.to}</p>
                <p><span className="font-medium text-blue-700">Date:</span> {booking.journey_date}</p>
                <p><span className="font-medium text-blue-700">Service:</span> {booking.booking_type || 'Not specified'}</p>
                {booking.train_class && (
                  <p><span className="font-medium text-blue-700">Train Class:</span> <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-900">{booking.train_class}</span></p>
                )}
                {booking.preferred_trains && (
                  <p><span className="font-medium text-blue-700">Preferred Train(s):</span> <span className="bg-purple-100 px-2 py-0.5 rounded text-purple-900 font-mono">{booking.preferred_trains}</span></p>
                )}
              </div>
            </div>

            {/* Agent Submitted PNR Details - Only show if agent has completed */}
            {booking.agentPnr && booking.agentBookingAccountId && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-lg border border-teal-200">
                <h3 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-teal-500 text-white rounded-full text-xs">✓</span>
                  Agent Submitted Details
                </h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium text-teal-700">Ticket PNR:</span> <span className="font-mono bg-teal-100 px-2 py-0.5 rounded text-teal-900">{booking.agentPnr}</span></p>
                  <p><span className="font-medium text-teal-700">Booking Account ID:</span> <span className="font-mono bg-teal-100 px-2 py-0.5 rounded text-teal-900">{booking.agentBookingAccountId}</span></p>
                  {booking.assignedAgent && (
                    <p><span className="font-medium text-teal-700">Completed By Agent:</span> {booking.assignedAgent}</p>
                  )}
                </div>
              </div>
            )}

            {/* Price Details Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingType" className="text-sm font-medium">Booking Type *</Label>
                  <select 
                    id="bookingType" 
                    className="w-full px-3 py-2 text-sm border rounded-md mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={priceDetails.bookingType} 
                    onChange={(e) => handleBookingTypeChange(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="General Booking">General Booking</option>
                    <option value="Tatkal Booking">Tatkal Booking</option>
                    <option value="Advance Booking">Advance Booking</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="classPreference" className="text-sm font-medium">Class Preference *</Label>
                  <select 
                    id="classPreference" 
                    className="w-full px-3 py-2 text-sm border rounded-md mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={priceDetails.classPreference} 
                    onChange={(e) => handleClassPreferenceChange(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="SL">Sleeper (SL)</option>
                    <option value="3AC/3E">3AC/3E</option>
                    <option value="2AC">2AC</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  Booking Charge: ₹{priceDetails.bookingCharge.toFixed(2)} per passenger
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {priceDetails.bookingType === 'General Booking' 
                    ? 'General booking: Fixed ₹100 charge'
                    : `Tatkal ${priceDetails.classPreference === 'SL' ? 'Sleeper: ₹250' : priceDetails.classPreference === '3AC/3E' ? '3AC/3E: ₹350' : '2AC: ₹400'}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketCost" className="text-sm font-medium">Ticket Cost (₹) *</Label>
                  <Input
                    id="ticketCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceDetails.ticketCost || ''}
                    onChange={(e) => {
                      const newTicketCost = parseFloat(e.target.value) || 0;
                      setPriceDetails(prev => ({...prev, ticketCost: newTicketCost}));
                    }}
                    className={`mt-1 ${errors.ticketCost ? 'border-red-500' : ''}`}
                    placeholder="Enter ticket cost"
                    disabled={submitting}
                  />
                  {errors.ticketCost && <p className="text-xs text-red-500 mt-1">{errors.ticketCost}</p>}
                </div>

                <div>
                  <Label htmlFor="passengerCount" className="text-sm font-medium">Passenger Count *</Label>
                  <Input
                    id="passengerCount"
                    type="number"
                    min="1"
                    value={priceDetails.passengerCount}
                    onChange={(e) => {
                      const newPassengerCount = parseInt(e.target.value) || 1;
                      setPriceDetails(prev => ({...prev, passengerCount: newPassengerCount}));
                    }}
                    className={`mt-1 ${errors.passengerCount ? 'border-red-500' : ''}`}
                    disabled={submitting}
                  />
                  {errors.passengerCount && <p className="text-xs text-red-500 mt-1">{errors.passengerCount}</p>}
                </div>
              </div>

              {/* Coupon Section (if exists) */}
              {priceDetails.couponCode && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-1">Coupon Applied</p>
                  <p className="text-sm text-green-700">
                    Code: <span className="font-semibold">{priceDetails.couponCode}</span> - 
                    Discount: {priceDetails.couponType === 'percentage' 
                      ? `${priceDetails.couponDiscount}%` 
                      : `₹${priceDetails.couponDiscount}`}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="additionalInfo" className="text-sm font-medium">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  value={priceDetails.additionalInfo}
                  onChange={(e) => {
                    const newInfo = e.target.value;
                    setPriceDetails(prev => ({...prev, additionalInfo: newInfo}));
                  }}
                  placeholder="Any special notes or requirements..."
                  className="mt-1 min-h-[80px]"
                  disabled={submitting}
                />
              </div>

              {/* Total Calculation */}
              {priceDetails.ticketCost > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Price Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Ticket Cost ({priceDetails.passengerCount} × ₹{priceDetails.ticketCost.toFixed(2)}):</span>
                      <span className="font-medium">₹{(priceDetails.ticketCost * priceDetails.passengerCount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Booking Charge ({priceDetails.passengerCount} × ₹{priceDetails.bookingCharge.toFixed(2)}):</span>
                      <span className="font-medium">₹{(priceDetails.bookingCharge * priceDetails.passengerCount).toFixed(2)}</span>
                    </div>
                    {priceDetails.couponDiscount && priceDetails.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount:</span>
                        <span className="font-medium">
                          - ₹{(priceDetails.couponType === 'percentage' 
                            ? (priceDetails.bookingCharge * priceDetails.passengerCount * priceDetails.couponDiscount / 100)
                            : priceDetails.couponDiscount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-purple-300">
                      <span className="font-bold text-purple-900">Total Amount:</span>
                      <span className="font-bold text-lg text-purple-900">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !priceDetails.ticketCost || priceDetails.ticketCost <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Generating Invoice...
              </>
            ) : (
              'Generate Invoice'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingPriceModal;
