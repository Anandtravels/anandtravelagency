// Firebase Cloud Messaging Service Worker
// This runs in the background to receive push notifications even when the app is closed

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB4P5ZA4znNllXccDWrNgA3B2UTjABf9Xc",
  authDomain: "anandtravelagency-632b6.firebaseapp.com",
  projectId: "anandtravelagency-632b6",
  storageBucket: "anandtravelagency-632b6.firebasestorage.app",
  messagingSenderId: "618252472591",
  appId: "1:618252472591:web:b6efcd59203e227e11ee7a",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Anand Travel Agency';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.type || 'general',
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  // Route based on notification type
  if (data.type === 'new_booking' || data.type === 'new_package_booking' || data.type === 'new_hotel_booking') {
    targetUrl = '/admin';
  } else if (data.type === 'booking_assigned') {
    targetUrl = '/agent-dashboard';
  } else if (data.type === 'new_visa_application' || data.type === 'new_eservice') {
    targetUrl = '/admin';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(targetUrl);
    })
  );
});
