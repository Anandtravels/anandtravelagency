import { useState } from 'react';
import { Booking, MessageDetails } from '@/types/admin';

export const useWhatsAppModal = () => {
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [messageDetails, setMessageDetails] = useState<MessageDetails>({
    ticketCost: '', bookingCharge: '', totalAmount: '', additionalInfo: '',
    bookingType: 'General Booking', passengerCount: 1, couponCode: '',
    couponDiscount: 0, couponType: null
  });

  const handleWhatsapp = (phone: string, booking?: Booking) => {
    if (booking) {
      setCurrentBooking(booking);
      setWhatsappModal(true);
      
      const initialBookingType = (() => {
        if (booking.booking_type === 'train' && booking.train_booking_type) {
          switch (booking.train_booking_type) {
            case 'general': return 'General Booking';
            case 'tatkal': return 'Tatkal Booking';
            case 'premium_tatkal': return 'Premium Booking';
            default: return booking.train_booking_type;
          }
        }
        return booking.booking_type ? 
          booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1) + ' Booking' 
          : 'General Booking';
      })();
      
      let initialPassengerCount = Array.isArray(booking.passengers) ? booking.passengers.length : 1;
      const initialBookingCharge = calculateBookingCharge(initialBookingType, 0);

      if (booking.coupon) {
        setMessageDetails({
          ticketCost: '',
          bookingCharge: initialBookingCharge.toString(),
          totalAmount: '',
          additionalInfo: '',
          bookingType: initialBookingType,
          passengerCount: initialPassengerCount,
          couponCode: booking.coupon.code,
          couponDiscount: booking.coupon.discount,
          couponType: booking.coupon.type
        });
      } else {
        setMessageDetails({
          ticketCost: '',
          bookingCharge: initialBookingCharge.toString(),
          totalAmount: '',
          additionalInfo: '',
          bookingType: initialBookingType,
          passengerCount: initialPassengerCount,
          couponCode: '',
          couponDiscount: 0,
          couponType: null
        });
      }
    } else {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const calculateBookingCharge = (bookingType: string, ticketCost: number): number => {
    switch(bookingType) {
      case 'Tatkal Booking': return 200;
      case 'Premium Booking': return 250;
      case 'General Booking': default: return 50;
    }
  };

  const sendWhatsappMessage = () => {
    if (!currentBooking) return;

    const formatPassengerInfo = () => {
      if (Array.isArray(currentBooking.passengers)) {
        let info = `*Passengers:* ${currentBooking.passengers.length}\n`;
        currentBooking.passengers.forEach((p: any, i: number) => {
          info += `   ${i + 1}. ${p.name} (${p.age} yrs, ${p.gender})`;
          // Add DOB if available
          if (p.dob) {
            try {
              const date = new Date(p.dob);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              info += ` - DOB: ${day}/${month}/${year}`;
            } catch (e) {
              // If date parsing fails, skip DOB
            }
          }
          info += '\n';
        });
        return info;
      }
      return `*Passengers:* ${currentBooking.passengers}\n`;
    };

    const passengerInfo = formatPassengerInfo();
    const bookingCharge = parseFloat(messageDetails.bookingCharge) || calculateBookingCharge(messageDetails.bookingType, parseFloat(messageDetails.ticketCost) || 0);
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;

    let pricingDetails = 
`*Pricing Details:*
${messageDetails.bookingType} Cost: ₹${ticketCost.toFixed(2)} × ${messageDetails.passengerCount} = ₹${(ticketCost * messageDetails.passengerCount).toFixed(2)}
${messageDetails.bookingType} Charge: ₹${bookingCharge.toFixed(2)} × ${messageDetails.passengerCount} = ₹${(bookingCharge * messageDetails.passengerCount).toFixed(2)}`;

    if (messageDetails.couponCode && messageDetails.couponDiscount > 0) {
      const originalCharge = bookingCharge * messageDetails.passengerCount;
      const discountAmount = messageDetails.couponType === 'percentage' 
        ? (originalCharge * messageDetails.couponDiscount / 100)
        : messageDetails.couponDiscount;
      const finalCharge = Math.max(0, originalCharge - discountAmount);

      pricingDetails += `
-----------------
*Coupon Applied:* ${messageDetails.couponCode}
Discount: ${messageDetails.couponType === 'percentage' ? `${messageDetails.couponDiscount}% OFF` : `₹${messageDetails.couponDiscount} OFF`}
Original Booking Charge: ₹${originalCharge.toFixed(2)}
Savings: ₹${discountAmount.toFixed(2)}
Final Booking Charge: ₹${finalCharge.toFixed(2)}`;
      const total = (ticketCost * messageDetails.passengerCount) + finalCharge;
      pricingDetails += `\n*Total Amount: ₹${total.toFixed(2)}*`;
    } else {
      const total = (ticketCost * messageDetails.passengerCount) + (bookingCharge * messageDetails.passengerCount);
      pricingDetails += `\n*Total Amount: ₹${total.toFixed(2)}*`;
    }

    const message = 
`Dear *${currentBooking.name}*,

Thank you for your booking request with Anand Travels!
------------------
*Booking Details:*
Journey: ${currentBooking.from} to ${currentBooking.to}
Date: ${currentBooking.journey_date}
Service Type: ${messageDetails.bookingType}
${passengerInfo}
${currentBooking.additional_requirements ? `Special Requirements: ${currentBooking.additional_requirements}\n` : ''}
------------------
${pricingDetails}

${messageDetails.additionalInfo ? `\n${messageDetails.additionalInfo}\n` : ''}
------------------

*Payment Information:*
PhonePe/UPI: 8985816481 or 9676138010
Account Holder: Pinisetty Naga Satya Surya Shiva Anand
------------------
Please complete the payment to confirm your booking.
For any queries, feel free to contact us.

Thank you for choosing Anand Travels!`;

    window.open(`https://wa.me/${currentBooking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    setWhatsappModal(false);
  };

  return { 
    whatsappModal, setWhatsappModal, currentBooking, messageDetails, setMessageDetails,
    handleWhatsapp, sendWhatsappMessage, calculateBookingCharge 
  };
};
