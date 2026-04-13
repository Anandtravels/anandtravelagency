import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from './firebase';

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

// Initialize messaging only if supported
const getMessagingInstance = async () => {
  if (messagingInstance) return messagingInstance;
  
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Messaging is not supported in this browser');
    return null;
  }

  messagingInstance = getMessaging(app);
  return messagingInstance;
};

// Register the service worker
const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return undefined;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (
  userEmail: string,
  userRole: 'admin' | 'agent'
): Promise<string | null> => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Register service worker
    const swRegistration = await registerServiceWorker();

    // Get messaging instance
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log('FCM Token obtained:', token.substring(0, 20) + '...');
      // Save token to Firestore
      await saveFCMToken(userEmail, userRole, token);
      return token;
    }

    console.warn('No FCM token available');
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Save FCM token to Firestore
const saveFCMToken = async (
  userEmail: string,
  userRole: 'admin' | 'agent',
  token: string
) => {
  try {
    const tokenDocRef = doc(db, 'fcm_tokens', userEmail);
    await setDoc(tokenDocRef, {
      email: userEmail,
      role: userRole,
      token,
      updatedAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    }, { merge: true });
    console.log('FCM token saved for:', userEmail);
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  getMessagingInstance().then((messaging) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  });
};

// Check if notification permission is granted
export const isNotificationPermissionGranted = (): boolean => {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
};

// Check if notification permission was denied
export const isNotificationPermissionDenied = (): boolean => {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'denied';
};

// Get current FCM token status from Firestore
export const getFCMTokenStatus = async (userEmail: string): Promise<boolean> => {
  try {
    const tokenDoc = await getDoc(doc(db, 'fcm_tokens', userEmail));
    return tokenDoc.exists() && !!tokenDoc.data()?.token;
  } catch {
    return false;
  }
};
