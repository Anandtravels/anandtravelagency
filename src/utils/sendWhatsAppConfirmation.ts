/**
 * Sends a WhatsApp booking confirmation to the customer using approved TEMPLATE messages.
 * Non-blocking — fire-and-forget with retry. Failures are logged but don't interrupt the booking flow.
 *
 * Template mapping:
 *   Train booking  → booking_confirmation   (params: name, bookingId, route, date, passengers)
 *   Bus booking    → bus_booking_received    (params: name, bookingId, route, date, passengers)
 *   Flight booking → flight_booking_received (params: name, bookingId, route, date, passengers)
 *   Hotel booking  → booking_confirmation    (params: name, bookingId, hotel, dates, guests)
 *   Package booking→ booking_confirmation    (params: name, bookingId, package, date, people)
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
    const shortId = bookingId.slice(-6).toUpperCase();

    let templateName = '';
    let templateParams: string[] = [];

    // All Meta-approved templates accept exactly 1 parameter: {{1}} = customer name
    if (bookingType === 'booking') {
      const subType = bookingData.booking_type;

      if (subType === 'bus') {
        templateName = 'bus_booking_received';
      } else if (subType === 'flight') {
        templateName = 'flight_booking_received';
      } else {
        // train or default
        templateName = 'booking_confirmation';
      }

      templateParams = [customerName];
    } else if (bookingType === 'hotel') {
      templateName = 'booking_confirmation';
      templateParams = [customerName];
    } else if (bookingType === 'package') {
      templateName = 'booking_confirmation';
      templateParams = [customerName];
    }

    if (!templateName) return;

    // Send template message with retry
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch('/api/whatsapp-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            type: 'template',
            templateName,
            templateParams,
            languageCode: 'en',
            customerName,
            bookingId,
            bookingType,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            console.log(
              `[BookingWhatsApp] Template "${templateName}" sent (attempt ${attempt + 1}):`,
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
