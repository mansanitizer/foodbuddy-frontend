// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // TODO: Replace with your actual Firebase project configuration
  // You can find these values in your Firebase project settings
  apiKey: "your-firebase-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };

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
