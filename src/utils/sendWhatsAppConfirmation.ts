/**
 * Sends a WhatsApp booking confirmation to the customer.
 * Non-blocking — fire-and-forget with retry. Failures are logged but don't interrupt the booking flow.
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function normalisePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
    return null;
  }
  return `91${digits}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendWhatsAppConfirmation(
  bookingData: Record<string, any>,
  bookingType: 'booking' | 'hotel' | 'package',
  bookingId: string
) {
  try {
    const rawPhone = bookingData.phone || bookingData.guestPhone || '';
    if (!rawPhone) {
      console.warn('[BookingWhatsApp] No phone number for confirmation');
      return;
    }

    const phone = normalisePhone(rawPhone);
    if (!phone) {
      console.warn('[BookingWhatsApp] Invalid phone number, skipping:', rawPhone);
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

      message = `🎫 *ANAND TRAVELS - SLOT  CONFIRMED*

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

    // Send with retry
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch('/api/whatsapp-send', {
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

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            console.log(
              `[BookingWhatsApp] Confirmation sent (attempt ${attempt + 1}):`,
              data.whatsappMessageId
            );
            return; // Success
          }
          // API returned 200 but success=false
          lastError = new Error(`API returned success=false: ${JSON.stringify(data)}`);
        } else {
          const errBody = await res.json().catch(() => ({}));
          lastError = new Error(`API ${res.status}: ${JSON.stringify(errBody)}`);
        }

        console.warn(`[BookingWhatsApp] Attempt ${attempt + 1} failed:`, lastError);
      } catch (fetchErr) {
        lastError = fetchErr;
        console.warn(`[BookingWhatsApp] Attempt ${attempt + 1} network error:`, fetchErr);
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
      }
    }

    console.error('[BookingWhatsApp] All retry attempts failed:', lastError);
  } catch (err) {
    console.error('[BookingWhatsApp] Unexpected error (non-blocking):', err);
  }
}
