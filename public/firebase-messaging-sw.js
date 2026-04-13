// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB4P5ZA4znNllXccDWrNgA3B2UTjABf9Xc",
  authDomain: "anandtravelagency-632b6.firebaseapp.com",
  projectId: "anandtravelagency-632b6",
  storageBucket: "anandtravelagency-632b6.firebasestorage.app",
  messagingSenderId: "618252472591",
  appId: "1:618252472591:web:b6efcd59203e227e11ee7a",
  measurementId: "G-2VV1SH2ZCY"
});

const messaging = firebase.messaging();

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const data = payload.data || {};
  const notificationTitle = data.title || payload.notification?.title || 'Anand Travel Agency';
  const notificationOptions = {
    body: data.body || payload.notification?.body || 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    data: data,
    tag: data.type || 'default',
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click - open the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let urlPath = '/';

  // Route to the appropriate admin tab based on notification type
  if (data.type === 'new_booking') {
    urlPath = '/admin#bookings';
  } else if (data.type === 'new_package_booking') {
    urlPath = '/admin#package-bookings';
  } else if (data.type === 'new_hotel_booking') {
    urlPath = '/admin#hotel-bookings';
  } else if (data.type === 'new_contact_message') {
    urlPath = '/admin#messages';
  } else if (data.type === 'new_eservice_request') {
    urlPath = '/admin#eservices';
  } else if (data.type === 'new_visa_application') {
    urlPath = '/admin#visa-applications';
  } else if (data.type === 'new_agent_task') {
    urlPath = '/agent-dashboard';
  } else if (data.url) {
    urlPath = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlPath);
          return client.focus();
        }
      }
      // Open a new window if none exists
      return clients.openWindow(urlPath);
    })
  );
});
