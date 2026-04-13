// Helper to send push notification via Vercel API
export async function sendPushNotification(
  type: string,
  payload: Record<string, any>
) {
  try {
    const res = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Push notification API error:', err);
    }
  } catch (err) {
    // Silent fail — don't block user flow for notification failures
    console.warn('Failed to send push notification:', err);
  }
}
