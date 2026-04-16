import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types/admin';
import { PriceDetails } from '@/components/admin/BookingPriceModal';
import { generateBillNumber } from '@/utils/billUtils';
import { whatsappService } from '@/services/whatsappService';

export const useBookingInvoiceModal = (userEmail?: string) => {
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const openPriceModal = (booking: Booking) => {
    setCurrentBooking(booking);
    setPriceModalOpen(true);
  };

  const closePriceModal = () => {
    setPriceModalOpen(false);
    setCurrentBooking(null);
  };

  const generateInvoiceWithPrice = async (priceDetails: PriceDetails) => {
    if (!currentBooking || !userEmail) {
      toast({
        title: 'Error',
        description: 'Missing booking or user information',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      // Generate bill number
      const billNumber = generateBillNumber();

      // Calculate total amount
      const ticketCost = priceDetails.ticketCost;
      const bookingCharge = priceDetails.bookingCharge;
      const passengerCount = priceDetails.passengerCount;

      const totalTicketCost = ticketCost * passengerCount;
      const totalBookingCharge = bookingCharge * passengerCount;
      let finalBookingCharge = totalBookingCharge;

      // Apply coupon discount if exists
      if (priceDetails.couponType && priceDetails.couponDiscount && priceDetails.couponDiscount > 0) {
        const discountAmount = priceDetails.couponType === 'percentage'
          ? (totalBookingCharge * priceDetails.couponDiscount / 100)
          : priceDetails.couponDiscount;
        finalBookingCharge = Math.max(0, totalBookingCharge - discountAmount);
      }

      const totalAmount = totalTicketCost + finalBookingCharge;

      // Build bill data object
      const billData: any = {
        billNumber,
        bookingId: currentBooking.id,
        customerName: currentBooking.name,
        customerPhone: currentBooking.phone,
        serviceType: currentBooking.booking_type || 'train',
        bookingType: priceDetails.bookingType,
        passengerCount: priceDetails.passengerCount,
        ticketCost: ticketCost,
        bookingCharge: bookingCharge,
        totalAmount: totalAmount,
        createdAt: serverTimestamp(),
        createdBy: userEmail,
        generatedFrom: 'status_change', // Mark as generated from status change, not WhatsApp
      };

      // Add optional fields
      if (currentBooking.email) {
        billData.customerEmail = currentBooking.email;
      }
      if (currentBooking.from) {
        billData.journeyFrom = currentBooking.from;
      }
      if (currentBooking.to) {
        billData.journeyTo = currentBooking.to;
      }
      if (currentBooking.journey_date) {
        billData.journeyDate = currentBooking.journey_date;
      }
      if (priceDetails.couponCode && priceDetails.couponCode.trim() !== '') {
        billData.couponCode = priceDetails.couponCode;
      }
      if (priceDetails.couponDiscount && priceDetails.couponDiscount > 0) {
        billData.couponDiscount = priceDetails.couponDiscount;
        billData.couponType = priceDetails.couponType;
      }
      if (priceDetails.additionalInfo && priceDetails.additionalInfo.trim() !== '') {
        billData.additionalInfo = priceDetails.additionalInfo;
      }

      // Add agent PNR and Booking Account ID if available
      if (currentBooking.agentPnr && currentBooking.agentPnr.trim() !== '') {
        billData.agentPnr = currentBooking.agentPnr;
      }
      if (currentBooking.agentBookingAccountId && currentBooking.agentBookingAccountId.trim() !== '') {
        billData.agentBookingAccountId = currentBooking.agentBookingAccountId;
      }

      // Create bill record in Firebase
      const billRef = await addDoc(collection(db, 'bills'), billData);

      // Update booking with bill reference AND set status to 'booked'
      const bookingUpdateData: any = {
        billId: billRef.id,
        billNumber: billNumber,
        invoiceGenerated: true,
        invoiceGeneratedAt: serverTimestamp(),
        status: 'booked',
        updated_at: serverTimestamp(),
        updated_by: userEmail,
      };

      // Mark WhatsApp auto-sent atomically to prevent duplicates
      const shouldSendWhatsApp = currentBooking.phone &&
        !(currentBooking.whatsapp_auto_sent && (currentBooking as any).whatsapp_auto_sent?.booked);

      if (shouldSendWhatsApp) {
        bookingUpdateData['whatsapp_auto_sent.booked'] = true;
      }

      await updateDoc(doc(db, 'bookings', currentBooking.id), bookingUpdateData);

      toast({
        title: 'Invoice Generated',
        description: `Invoice #${billNumber} has been created successfully`,
      });

      // Fire-and-forget WhatsApp "booked" notification (non-blocking)
      if (shouldSendWhatsApp) {
        whatsappService.sendStatusChangeMessage('booked', currentBooking).then((sent) => {
          if (sent) {
            toast({ title: "WhatsApp Sent", description: `Booking confirmation sent to ${currentBooking.name || 'customer'}.` });
          }
        }).catch(() => {
          console.warn('[WhatsApp Auto] Booked message send failed for booking', currentBooking.id);
        });
      }

      // Open invoice in new window
      setTimeout(() => {
        const invoiceUrl = `/invoice-print?id=${billRef.id}`;
        window.open(invoiceUrl, '_blank', 'width=1200,height=900,scrollbars=yes,resizable=yes');
      }, 500);

      closePriceModal();
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate invoice. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    priceModalOpen,
    openPriceModal,
    closePriceModal,
    currentBooking,
    generateInvoiceWithPrice,
    submitting,
  };
};
