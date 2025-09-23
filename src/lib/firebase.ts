// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCr4UejZPoSWi9JquwO32QeD8p3mJiEu4E",
  authDomain: "foodbuddy-e48dd.firebaseapp.com",
  projectId: "foodbuddy-e48dd",
  storageBucket: "foodbuddy-e48dd.firebasestorage.app",
  messagingSenderId: "803679285810",
  appId: "1:803679285810:web:c4970429ceab9eed58c22b",
  measurementId: "G-L6GL6B0D0E"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, app };

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BG4qt5vEMaH7SEjPiNpE5Ewn8M2yLxwQrqS0D9RZ3HPkHCsjzmVB7ATxxHk8BBUr8z6ls5BtrSioEQ3BKoWoW7g'
      });
      console.log('FCM Token:', token);

      // Send token to your backend
      await fetch('/api/notifications/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      return token;
    }
  } catch (error) {
    console.error('Error getting notification token:', error);
    throw error;
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      resolve(payload);
    });
  });
};

// Show notification (for foreground messages)
export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};
