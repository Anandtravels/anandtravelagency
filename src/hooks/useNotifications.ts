import { useEffect, useCallback, useState, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, getFirebaseMessaging } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = (
  userEmail?: string,
  role: 'admin' | 'agent' = 'admin'
) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const { toast } = useToast();
  const initializedRef = useRef(false);

  // Save FCM token to Firestore so Cloud Functions can send notifications
  const saveFcmToken = useCallback(async (token: string, email: string) => {
    const tokenDocId = `${role}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await setDoc(doc(db, 'fcm_tokens', tokenDocId), {
      token,
      email,
      role,
      updatedAt: serverTimestamp(),
      userAgent: navigator.userAgent
    });
  }, [role]);

  // Request notification permission and register FCM token
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined' || !userEmail) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('VITE_FIREBASE_VAPID_KEY is not set');
          return;
        }

        const token = await getToken(messaging, { vapidKey });
        if (token) {
          setFcmToken(token);
          await saveFcmToken(token, userEmail);
          console.log('FCM token registered for', role, userEmail);
        }
      } else if (result === 'denied') {
        console.warn('Notification permission denied');
      }
    } catch (err) {
      console.error('Failed to setup notifications:', err);
    }
  }, [userEmail, role, saveFcmToken]);

  // Listen for foreground messages
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupForegroundListener = async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground notification received:', payload);

        const title = payload.data?.title || payload.notification?.title || 'Anand Travel Agency';
        const body = payload.data?.body || payload.notification?.body || 'You have a new notification';

        // Show in-app toast only (no native notification to avoid duplicates)
        toast({
          title,
          description: body,
        });
      });
    };

    setupForegroundListener();
    return () => unsubscribe?.();
  }, [toast]);

  // Auto-register token if permission already granted
  useEffect(() => {
    if (!userEmail || initializedRef.current) return;
    initializedRef.current = true;

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      requestPermission();
    }
  }, [userEmail, requestPermission]);

  return { permission, requestPermission, fcmToken };
};
