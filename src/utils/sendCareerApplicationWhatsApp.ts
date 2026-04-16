/**
 * Sends a WhatsApp confirmation to a career applicant using an approved TEMPLATE message.
 * Non-blocking — fire-and-forget with retry. Failures are logged but don't interrupt the UI.
 *
 * Template: career_application_received (params: name, applicationId)
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

interface CareerApplicationData {
  fullName: string;
  email: string;
  phone: string;
  knowsHindi: string;
  hasLaptop: string;
  message?: string;
  resumeFileName?: string | null;
}

function normalisePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
    return null;
  }
  return `91${digits}`;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendCareerApplicationWhatsApp(
  applicationData: CareerApplicationData,
  applicationId: string
): Promise<void> {
  try {
    const phone = normalisePhone(applicationData.phone);
    if (!phone) {
      console.warn(
        '[CareerWhatsApp] Invalid phone number, skipping message:',
        applicationData.phone
      );
      return;
    }

    const customerName = applicationData.fullName || 'Applicant';

    // Send template message with retry
    // Meta-approved template accepts exactly 1 parameter: {{1}} = customer name
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch('/api/whatsapp-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            type: 'template',
            templateName: 'career_application_received',
            templateParams: [customerName],
            languageCode: 'en',
            customerName,
            bookingId: applicationId,
            bookingType: 'career',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            console.log(
              `[CareerWhatsApp] Template sent (attempt ${attempt + 1}):`,
              data.whatsappMessageId
            );
            return;
          }
          lastError = new Error(`API returned success=false: ${JSON.stringify(data)}`);
        } else {
          const errBody = await res.json().catch(() => ({}));
          lastError = new Error(`API responded ${res.status}: ${JSON.stringify(errBody)}`);
        }

        console.warn(`[CareerWhatsApp] Attempt ${attempt + 1} failed:`, lastError);
      } catch (fetchErr) {
        lastError = fetchErr;
        console.warn(`[CareerWhatsApp] Attempt ${attempt + 1} network error:`, fetchErr);
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
      }
    }

    console.error('[CareerWhatsApp] All retry attempts failed. Last error:', lastError);
  } catch (err) {
    console.error('[CareerWhatsApp] Unexpected error (non-blocking):', err);
  }
}
