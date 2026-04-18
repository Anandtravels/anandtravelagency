import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const REMINDER_HOUR = 12;
const REMINDER_MINUTE = 0;
const STORAGE_KEY = 'ata_pdf_reminder_shown';

/** Returns current time in IST */
function getISTTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + istOffset);
}

function getTodayKey() {
  const ist = getISTTime();
  return `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, '0')}-${String(ist.getDate()).padStart(2, '0')}`;
}

function wasShownToday(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.date === getTodayKey();
  } catch {
    return false;
  }
}

function markShown() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey() }));
}

/**
 * Client-side PDF reminder hook.
 * Shows browser notification + in-app toast at 12:00 PM IST daily.
 * Reminds agents to send today's booked PDFs to Anand.
 * Uses localStorage to avoid duplicate notifications on the same day.
 */
export const usePdfReminder = (agentEmail?: string) => {
  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!agentEmail) return;

    const checkTime = () => {
      const ist = getISTTime();
      const currentHour = ist.getHours();
      const currentMinute = ist.getMinutes();

      // Check if within 12:00 PM (±1 minute window)
      if (
        currentHour === REMINDER_HOUR &&
        currentMinute >= REMINDER_MINUTE &&
        currentMinute <= REMINDER_MINUTE + 1 &&
        !wasShownToday()
      ) {
        markShown();
        console.log(`[PdfReminder] Triggering 12 PM reminder for ${agentEmail}`);

        // In-app toast
        toast({
          title: '📄 PDF Reminder',
          description: 'Please send today\'s booked ticket PDFs to Anand.',
          duration: 20000,
        });

        // Browser push notification (local)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            const notif = new Notification('📄 ATA — Send Booked PDFs', {
              body: 'Please send today\'s booked ticket PDFs to Anand.',
              icon: '/logo.png',
              badge: '/logo.png',
              tag: 'pdf-reminder-12pm',
              requireInteraction: true,
            });
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch (err) {
            console.error('[PdfReminder] Failed to show browser notification:', err);
          }
        }
      }
    };

    // Check immediately on mount
    checkTime();

    // Check every 30 seconds
    intervalRef.current = setInterval(checkTime, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [agentEmail, toast]);
};
