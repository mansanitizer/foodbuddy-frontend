// src/hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onMessageListener, showNotification, registerServiceWorker } from '../lib/firebase';

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications and service workers
    // Default to supported unless we get clear errors
    const isServiceWorkerSupported = 'serviceWorker' in navigator;

    // Assume notifications are supported by default, only mark as unsupported on clear errors
    let notificationError = false;

    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        // Try to access Notification - if this fails, we'll catch it
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        // Listen for permission changes
        const handlePermissionChange = () => {
          try {
            setPermission(Notification.permission);
          } catch (e) {
            console.warn('Error checking permission change:', e);
          }
        };

        // Try to request permission - this will work if supported
        Notification.requestPermission().then(handlePermissionChange).catch(() => {
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
      // Try to request permission - if this fails, notifications aren't supported
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Register service worker for background notifications
        try {
          await registerServiceWorker();
        } catch (swError) {
          console.warn('Service worker registration failed:', swError);
          // Continue anyway - service worker is not required for foreground notifications
        }

        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          setToken(fcmToken);
        }
        return fcmToken || null;
      }

      return null;
    } catch (error) {
      console.error('Error requesting permission:', error);
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
