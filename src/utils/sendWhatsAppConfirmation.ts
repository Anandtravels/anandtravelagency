/**
 * Sends a WhatsApp booking confirmation to the customer.
 * Non-blocking — fire-and-forget. Failures are logged but don't interrupt the booking flow.
 */
export async function sendWhatsAppConfirmation(
  bookingData: Record<string, any>,
  bookingType: 'booking' | 'hotel' | 'package',
  bookingId: string
) {
  try {
    const phone = bookingData.phone || bookingData.guestPhone || '';
    if (!phone) {
      console.warn('No phone number for WhatsApp confirmation');
      return;
    }

    const customerName =
      bookingData.name || bookingData.guestName || bookingData.fullName || 'Customer';

    let message = '';

    if (bookingType === 'booking') {
      const type =
        bookingData.booking_type === 'train'
          ? '🚆 Train'
          : bookingData.booking_type === 'flight'
          ? '✈️ Flight'
          : bookingData.booking_type === 'bus'
          ? '🚌 Bus'
          : '🎫 Travel';

      const passengerCount = Array.isArray(bookingData.passengers)
        ? bookingData.passengers.length
        : bookingData.passengers || 1;

      message = `🎫 *ANAND TRAVELS - BOOKING CONFIRMED*

Hello *${customerName}*,

Your booking has been received successfully!

━━━━━━━━━━━━━━━
📋 *Booking ID:* ${bookingId}
${type} Booking
🚏 *Route:* ${bookingData.from} → ${bookingData.to}
📅 *Date:* ${bookingData.journey_date}
👥 *Passengers:* ${passengerCount}
━━━━━━━━━━━━━━━

Our team will process your booking shortly. You\'ll receive updates on this chat.

📞 For queries, reply here or call us.
Thank you for choosing *Anand Travels*! 🙏`;
    } else if (bookingType === 'hotel') {
      message = `🏨 *ANAND TRAVELS - HOTEL BOOKING CONFIRMED*

Hello *${customerName}*,

Your hotel booking has been received!

━━━━━━━━━━━━━━━
📋 *Booking ID:* ${bookingId}
🏨 *Hotel:* ${bookingData.hotelName || 'N/A'}
🛏️ *Room:* ${bookingData.roomTypeName || 'N/A'}
📅 *Check-in:* ${bookingData.checkInDate || 'N/A'}
📅 *Check-out:* ${bookingData.checkOutDate || 'N/A'}
👥 *Guests:* ${bookingData.numberOfGuests || 1}
━━━━━━━━━━━━━━━

We\'ll confirm your reservation shortly.

📞 For queries, reply here or call us.
Thank you for choosing *Anand Travels*! 🙏`;
    } else if (bookingType === 'package') {
      message = `📦 *ANAND TRAVELS - PACKAGE BOOKING CONFIRMED*

Hello *${customerName}*,

Your package booking has been received!

━━━━━━━━━━━━━━━
📋 *Booking ID:* ${bookingId}
🎯 *Package:* ${bookingData.packageTitle || 'N/A'}
📅 *Departure:* ${bookingData.departureDate || 'N/A'}
👥 *People:* ${bookingData.numberOfPeople || 1}
💰 *Amount:* ₹${bookingData.totalAmount || 'N/A'}
━━━━━━━━━━━━━━━

Our team will get in touch shortly.

📞 For queries, reply here or call us.
Thank you for choosing *Anand Travels*! 🙏`;
    }

    if (!message) return;

    await fetch('/api/whatsapp-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        type: 'text',
        message,
        customerName,
        bookingId,
        bookingType,
      }),
    });
  } catch (err) {
    console.error('WhatsApp confirmation failed (non-blocking):', err);
  }
}
