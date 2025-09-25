// src/hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onMessageListener, showNotification, registerServiceWorker } from '../lib/firebase';

// Utility function to safely access Notification API
const getNotificationAPI = () => {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      console.log('Notification API is available');
      return Notification;
    } else {
      console.warn('Notification API not available in window object');
    }
  } catch (e) {
    console.warn('Notification API not accessible:', e);
  }
  return null;
};

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Log browser and device information for debugging
    console.log('Browser info:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isSecureContext: window.isSecureContext,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotification: 'Notification' in window
    });

    // Check if browser supports notifications and service workers
    // Default to supported unless we get clear errors
    const isServiceWorkerSupported = 'serviceWorker' in navigator;

    // Assume notifications are supported by default, only mark as unsupported on clear errors
    let notificationError = false;

    try {
      const NotificationAPI = getNotificationAPI();
      if (NotificationAPI) {
        // Try to access Notification - if this fails, we'll catch it
        const currentPermission = NotificationAPI.permission;
        setPermission(currentPermission);

        // Listen for permission changes
        const handlePermissionChange = () => {
          try {
            const updatedAPI = getNotificationAPI();
            if (updatedAPI) {
              setPermission(updatedAPI.permission);
            }
          } catch (e) {
            console.warn('Error checking permission change:', e);
          }
        };

        // Try to request permission - this will work if supported
        NotificationAPI.requestPermission().then(handlePermissionChange).catch(() => {
          // If this fails, notifications might not be fully supported
          console.warn('Notification.requestPermission failed');
        });
      } else {
        // Fallback for browsers that don't have Notification in window
        setPermission('default');
      }
    } catch (e) {
      console.warn('Error accessing Notification API:', e);
      notificationError = true;
      setPermission('denied');
    }

    // Only mark as unsupported if we had a clear error
    setIsSupported(isServiceWorkerSupported && !notificationError);

    // Register service worker if supported
    if (isServiceWorkerSupported) {
      registerServiceWorker().catch(console.error);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    if (permission !== 'granted') return;

    onMessageListener().then((payload: any) => {
      if (payload) {
        showNotification(
          payload.notification?.title || 'FoodBuddy',
          {
            body: payload.notification?.body,
            icon: '/icon-192.png',
            badge: '/icon-72.png',
            tag: payload.notification?.tag,
            data: payload.data
          }
        );
      }
    });

    return () => {
      // Cleanup foreground message listener if needed
    };
  }, [permission]);

  const requestPermission = useCallback(async () => {
    try {
      console.log('Attempting to request notification permission...');
      
      // Try to request permission - if this fails, notifications aren't supported
      const NotificationAPI = getNotificationAPI();
      if (!NotificationAPI) {
        const error = new Error('Notification API not available in this context');
        console.error('Notification API check failed:', error);
        throw error;
      }

      console.log('Notification API found, requesting permission...');
      const result = await NotificationAPI.requestPermission();
      console.log('Permission request result:', result);
      setPermission(result);

      if (result === 'granted') {
        console.log('Permission granted, setting up notifications...');
        
        // Register service worker for background notifications
        try {
          await registerServiceWorker();
          console.log('Service worker registered successfully');
        } catch (swError) {
          console.warn('Service worker registration failed:', swError);
          // Continue anyway - service worker is not required for foreground notifications
        }

        try {
          const fcmToken = await requestNotificationPermission();
          if (fcmToken) {
            console.log('FCM token obtained successfully');
            setToken(fcmToken);
          } else {
            console.warn('FCM token was not obtained');
          }
          return fcmToken || null;
        } catch (fcmError) {
          console.error('FCM token request failed:', fcmError);
          throw fcmError;
        }
      } else {
        console.log('Permission denied or dismissed:', result);
      }

      return null;
    } catch (error) {
      console.error('Error requesting permission:', error);
      // Set permission to denied to prevent further attempts
      setPermission('denied');
      return null;
    }
  }, []);

  const subscribeToNotifications = useCallback(async () => {
    if (permission !== 'granted') {
      return await requestPermission();
    }

    try {
      // Ensure service worker is registered for background notifications
      try {
        await registerServiceWorker();
      } catch (swError) {
        console.warn('Service worker registration failed:', swError);
        // Continue anyway - service worker is not required for basic functionality
      }

      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setToken(fcmToken);
      }
      return fcmToken || null;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return null;
    }
  }, [permission, requestPermission]);

  return {
    token,
    permission,
    isSupported,
    requestPermission,
    subscribeToNotifications
  };
};
