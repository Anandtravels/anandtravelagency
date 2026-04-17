import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const REMINDER_TIMES = [
  { hour: 10, minute: 15 },
  { hour: 11, minute: 10 },
];

const STORAGE_KEY = 'ata_wallet_reminder_shown';

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

function getShownToday(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayKey()) return new Set();
    return new Set(parsed.shown || []);
  } catch {
    return new Set();
  }
}

function markShown(timeKey: string) {
  const shown = getShownToday();
  shown.add(timeKey);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date: getTodayKey(),
    shown: Array.from(shown),
  }));
}

/**
 * Client-side wallet reminder hook.
 * Shows browser notification + in-app toast at 10:15 AM and 11:10 AM IST.
 * Uses localStorage to avoid duplicate notifications on the same day.
 */
export const useWalletReminder = (agentEmail?: string) => {
  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!agentEmail) return;

    const checkTime = () => {
      const ist = getISTTime();
      const currentHour = ist.getHours();
      const currentMinute = ist.getMinutes();
      const shown = getShownToday();

      for (const time of REMINDER_TIMES) {
        const timeKey = `${time.hour}:${String(time.minute).padStart(2, '0')}`;

        // Check if within the target minute (±1 minute window)
        if (
          currentHour === time.hour &&
          currentMinute >= time.minute &&
          currentMinute <= time.minute + 1 &&
          !shown.has(timeKey)
        ) {
          markShown(timeKey);
          console.log(`[WalletReminder] Triggering reminder at ${timeKey} IST for ${agentEmail}`);

          // In-app toast
          toast({
            title: '💰 ATA Wallet Reminder',
            description: 'Please update your ATA Wallet (AC / Sleeper entry). ⚠️ If you ignore this, ₹20 may be deducted from your wallet.',
            duration: 15000,
          });

          // Browser push notification (local)
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              const notif = new Notification('💰 ATA Wallet Reminder', {
                body: 'Please update your ATA Wallet (AC / Sleeper entry).\n⚠️ If you ignore this, ₹20 may be deducted from your wallet.',
                icon: '/logo.png',
                badge: '/logo.png',
                tag: `wallet-reminder-${timeKey}`,
                requireInteraction: true,
              });
              notif.onclick = () => {
                window.focus();
                notif.close();
              };
              console.log(`[WalletReminder] Browser notification shown successfully at ${timeKey}`);
            } catch (err) {
              console.error('[WalletReminder] Failed to show browser notification:', err);
            }
          } else {
            console.warn('[WalletReminder] Browser notification permission not granted');
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
