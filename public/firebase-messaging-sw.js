// Firebase Messaging Service Worker (Legacy/Compatible Version)
// This version works with all hosting providers and doesn't require ES6 module support

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCr4UejZPoSWi9JquwO32QeD8p3mJiEu4E",
  authDomain: "foodbuddy-e48dd.firebaseapp.com",
  projectId: "foodbuddy-e48dd",
  storageBucket: "foodbuddy-e48dd.firebasestorage.app",
  messagingSenderId: "803679285810",
  appId: "1:803679285810:web:c4970429ceab9eed58c22b",
  measurementId: "G-L6GL6B0D0E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  // If payload.notification exists, FCM/browser will display it automatically.
  // To avoid duplicate notifications, only manually show for data-only messages.
  if (payload && !payload.notification) {
    const title = (payload.data && payload.data.title) || 'FoodBuddy';
    const body = payload.data && payload.data.body;
    const tag = payload.data && payload.data.tag;
    const clickAction = payload.data && payload.data.click_action;

    const notificationOptions = {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      tag: tag,
      data: { ...payload.data, click_action: clickAction }
    };

    return self.registration.showNotification(title, notificationOptions);
  }

  // Skip manual display to prevent duplicates when notification payload is present
  return undefined;
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Get the data from the notification
  const clickAction = event.notification.data && event.notification.data.click_action;

  if (clickAction) {
    // Open the URL in a new window/tab
    event.waitUntil(
      clients.openWindow(clickAction)
    );
  } else {
    // Default behavior: focus or open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
