// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Utility function to safely access Notification API
const getNotificationAPI = () => {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification;
    }
  } catch (e) {
    console.warn('Notification API not accessible:', e);
  }
  return null;
};

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

// Register Firebase service worker for background notifications
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered successfully:', registration.scope);

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('Service workers not supported in this browser');
    throw new Error('Service workers not supported');
  }
};

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const NotificationAPI = getNotificationAPI();
    if (!NotificationAPI) {
      throw new Error('Notification API not supported in this browser');
    }

    const permission = await NotificationAPI.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BG4qt5vEMaH7SEjPiNpE5Ewn8M2yLxwQrqS0D9RZ3HPkHCsjzmVB7ATxxHk8BBUr8z6ls5BtrSioEQ3BKoWoW7g'
      });

      if (token) {
        console.log('FCM Token:', token);

        // Get auth token from localStorage
        const authToken = localStorage.getItem('token');

        // Send token to backend
        const response = await fetch('https://api.foodbuddy.iarm.me/api/notifications/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
          },
          body: JSON.stringify({
            token: token,
            platform: 'web',
            userAgent: navigator.userAgent
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to register token: ${errorData.detail || response.statusText}`);
        }

        const result = await response.json();
        console.log('Token registration result:', result);

        return token;
      } else {
        throw new Error('Failed to get FCM token from Firebase');
      }
    } else {
      throw new Error('Notification permission denied');
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
  try {
    const NotificationAPI = getNotificationAPI();
    if (NotificationAPI && NotificationAPI.permission === 'granted') {
      const notification = new NotificationAPI(title, {
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  } catch (e) {
    console.warn('Failed to show notification:', e);
  }
};
