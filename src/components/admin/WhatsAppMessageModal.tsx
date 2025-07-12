import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Booking, MessageDetails } from "@/types/admin";
import { calculateBookingCharge } from "@/utils/adminHelpers";

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentBooking: Booking | null;
  messageDetails: MessageDetails;
  setMessageDetails: React.Dispatch<React.SetStateAction<MessageDetails>>;
  onSendMessage: () => void;
}

const WhatsAppMessageModal = ({
  isOpen,
  onOpenChange,
  currentBooking,
  messageDetails,
  setMessageDetails,
  onSendMessage,
}: WhatsAppMessageModalProps) => {

  const handleBookingTypeChange = (type: string) => {
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
    const bookingCharge = calculateBookingCharge(type, ticketCost).toFixed(2);
    
    setMessageDetails({
      ...messageDetails,
      bookingType: type,
      bookingCharge: bookingCharge
    });
  };

  const calculateTotal = (): { amount: string; details: string } => {
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
    const bookingCharge = parseFloat(messageDetails.bookingCharge) || 
      calculateBookingCharge(messageDetails.bookingType, ticketCost);
    const passengerCount = messageDetails.passengerCount || 1;
    
    if (!messageDetails.ticketCost) {
      return { amount: '', details: '' };
    }
    
    const totalTicketCost = ticketCost * passengerCount;
    const totalBookingCharge = bookingCharge * passengerCount;
    let finalBookingCharge = totalBookingCharge;
    let details = '';
    
    if (messageDetails.couponType && messageDetails.couponDiscount > 0) {
      const discountAmount = messageDetails.couponType === 'percentage' 
        ? (totalBookingCharge * messageDetails.couponDiscount / 100)
        : messageDetails.couponDiscount;
      
      finalBookingCharge = Math.max(0, totalBookingCharge - discountAmount);
      
      details = `Coupon Applied: ${messageDetails.couponCode}\n` +
        `Original Booking Charge: ₹${totalBookingCharge.toFixed(2)}\n` +
        `Discount: ${messageDetails.couponType === 'percentage' 
          ? `${messageDetails.couponDiscount}% (₹${discountAmount.toFixed(2)})` 
          : `₹${messageDetails.couponDiscount}`}\n` +
        `Final Booking Charge: ₹${finalBookingCharge.toFixed(2)}`;
    }
    
    const finalTotal = totalTicketCost + finalBookingCharge;
    
    return { amount: finalTotal.toFixed(2), details: details };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95%] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Send Booking Information</DialogTitle>
        </DialogHeader>
        {currentBooking && (
          <div className="space-y-4 my-4">
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <div className="grid gap-1">
                <p className="flex items-start"><span className="font-medium min-w-[80px] inline-block">Customer:</span> <span className="break-all">{currentBooking.name}</span></p>
                <p className="flex items-start"><span className="font-medium min-w-[80px] inline-block">Journey:</span><span className="break-all">{currentBooking.from} to {currentBooking.to}</span></p>
                <p className="flex items-start"><span className="font-medium min-w-[80px] inline-block">Date:</span><span>{currentBooking.journey_date}</span></p>
                <p className="flex items-start"><span className="font-medium min-w-[80px] inline-block">Service:</span><span>{currentBooking.booking_type || 'Not specified'}</span></p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="bookingType" className="text-sm">Booking Type</Label>
                <select id="bookingType" className="w-full px-3 py-2 text-sm border rounded-md mt-1" value={messageDetails.bookingType} onChange={(e) => handleBookingTypeChange(e.target.value)}>
                  <option value="General Booking">General Booking</option>
                  <option value="Tatkal Booking">Tatkal Booking</option>
                  <option value="Premium Booking">Premium Booking</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {messageDetails.bookingType === 'Tatkal Booking' ? 'Tatkal bookings have a fixed charge of ₹200.' : messageDetails.bookingType === 'Premium Booking' ? 'Premium bookings have a fixed charge of ₹250.' : 'General bookings have a fixed charge of ₹50.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="passengerCount" className="text-sm">Passengers</Label>
                  <Input id="passengerCount" type="number" min="1" value={messageDetails.passengerCount} onChange={(e) => setMessageDetails({ ...messageDetails, passengerCount: parseInt(e.target.value) || 1 })} className="mt-1 text-sm" />
                </div>
                
                <div>
                  <Label htmlFor="ticketCost" className="text-sm">Ticket Cost (₹)</Label>
                  <Input id="ticketCost" type="number" value={messageDetails.ticketCost} onChange={(e) => {
                      const newTicketCost = e.target.value;
                      const bookingCharge = calculateBookingCharge(messageDetails.bookingType, parseFloat(newTicketCost) || 0).toFixed(2);
                      setMessageDetails({ ...messageDetails, ticketCost: newTicketCost, bookingCharge: bookingCharge });
                    }} className="mt-1 text-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bookingCharge" className="text-sm">Booking Charge (₹)</Label>
                  <Input id="bookingCharge" type="number" value={messageDetails.bookingCharge} onChange={(e) => setMessageDetails({ ...messageDetails, bookingCharge: e.target.value })} className="mt-1 text-sm" />
                  <p className="text-xs text-gray-500 mt-1">Service charge per passenger</p>
                </div>
                
                <div>
                  <Label htmlFor="totalAmount" className="text-sm">Total Amount (₹)</Label>
                  <Input id="totalAmount" type="text" value={calculateTotal().amount} readOnly className={`mt-1 text-sm ${!messageDetails.ticketCost ? 'bg-gray-100 text-gray-400' : 'bg-gray-50'}`} placeholder={!messageDetails.ticketCost ? "Enter ticket cost first" : ""} />
                  {calculateTotal().details && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-line">
                      {calculateTotal().details}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {messageDetails.ticketCost ? `Including ticket cost and ${messageDetails.couponCode ? 'discounted ' : ''}booking charges` : "Enter ticket cost to calculate total"}
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="additionalInfo" className="text-sm">Additional Information</Label>
                <Textarea id="additionalInfo" value={messageDetails.additionalInfo} onChange={(e) => setMessageDetails({ ...messageDetails, additionalInfo: e.target.value })} placeholder="Any additional details or instructions..." className="mt-1 text-sm min-h-[80px]" />
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto order-2 sm:order-1">Cancel</Button>
          <Button onClick={onSendMessage} className="w-full sm:w-auto order-1 sm:order-2">Send to WhatsApp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppMessageModal;
