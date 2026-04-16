/**
 * Sends a WhatsApp confirmation to a career applicant after successful form submission.
 * Non-blocking — fire-and-forget with retry. Failures are logged but don't interrupt the UI.
 *
 * Reliability guarantees:
 *  - Phone is validated and normalised to +91 format before sending.
 *  - Up to 2 automatic retries (3 attempts total) with exponential back-off.
 *  - applicationId is passed as bookingId so the server can de-duplicate.
 *  - No dependency on React state; runs purely with the data passed in.
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500; // 1.5 s, doubled on each retry

interface CareerApplicationData {
  fullName: string;
  email: string;
  phone: string;
  knowsHindi: string;
  hasLaptop: string;
  message?: string;
  resumeFileName?: string | null;
}

/**
 * Normalise an Indian phone number to digits-only with leading 91.
 * Returns null if the number doesn't look valid.
 */
function normalisePhone(raw: string): string | null {
  // Strip everything except digits
  let digits = raw.replace(/\D/g, '');

  // Remove leading zeros
  digits = digits.replace(/^0+/, '');

  // If the user typed +91 / 91 prefix, strip it so we can re-add uniformly
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  }

  // Indian mobile numbers are exactly 10 digits starting with 6-9
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
    // ── 1. Validate & normalise phone ──────────────────────────────────
    const phone = normalisePhone(applicationData.phone);
    if (!phone) {
      console.warn(
        '[CareerWhatsApp] Invalid phone number, skipping message:',
        applicationData.phone
      );
      return;
    }

    // ── 2. Build the message ───────────────────────────────────────────
    const customerName = applicationData.fullName || 'Applicant';

    const message = `📋 *ANAND TRAVELS – CAREER APPLICATION RECEIVED*

Hello *${customerName}*,

Thank you for applying at *Anand Travel Agency*! We've received your application successfully.

━━━━━━━━━━━━━━━
👤 *Name:* ${customerName}
📧 *Email:* ${applicationData.email}
📞 *Phone:* ${applicationData.phone}
🗣️ *Hindi:* ${applicationData.knowsHindi === 'yes' ? 'Yes' : 'No'}
💻 *Has Laptop:* ${applicationData.hasLaptop === 'yes' ? 'Yes' : 'No'}${applicationData.resumeFileName ? `\n📄 *Resume:* ${applicationData.resumeFileName}` : ''}
━━━━━━━━━━━━━━━

Our HR team will review your application and get back to you shortly.

📞 For any queries, reply here or call us.
Best of luck! 🙏`;

    // ── 3. Send with retry ─────────────────────────────────────────────
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
            bookingId: applicationId, // used for de-duplication on server
            bookingType: 'career',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log(
            `[CareerWhatsApp] Message sent successfully (attempt ${attempt + 1}):`,
            data.whatsappMessageId
          );
          return; // ✅ Success — exit early
        }

        // Non-OK response — log and maybe retry
        const errBody = await res.json().catch(() => ({}));
        lastError = new Error(
          `API responded ${res.status}: ${JSON.stringify(errBody)}`
        );
        console.warn(
          `[CareerWhatsApp] Attempt ${attempt + 1} failed:`,
          lastError
        );
      } catch (fetchErr) {
        lastError = fetchErr;
        console.warn(
          `[CareerWhatsApp] Attempt ${attempt + 1} network error:`,
          fetchErr
        );
      }

      // Wait before retrying (exponential back-off)
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
      }
    }

    // All attempts exhausted
    console.error(
      '[CareerWhatsApp] All retry attempts failed. Last error:',
      lastError
    );
  } catch (err) {
    // Outer catch ensures the caller is never blocked
    console.error('[CareerWhatsApp] Unexpected error (non-blocking):', err);
  }
}
