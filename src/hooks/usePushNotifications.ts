// src/hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onMessageListener, showNotification, registerServiceWorker } from '../lib/firebase';

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications and service workers
    const checkNotificationSupport = () => {
      try {
        // Check if Notification is available and has the expected interface
        return typeof window !== 'undefined' &&
               'Notification' in window &&
               typeof Notification !== 'undefined' &&
               typeof Notification.requestPermission === 'function';
      } catch (e) {
        return false;
      }
    };

    const isNotificationSupported = checkNotificationSupport();
    const isServiceWorkerSupported = 'serviceWorker' in navigator;

    setIsSupported(isServiceWorkerSupported && isNotificationSupported);

    if (isNotificationSupported) {
      try {
        setPermission(Notification.permission);

        // Listen for permission changes
        const handlePermissionChange = () => {
          setPermission(Notification.permission);
        };

        Notification.requestPermission().then(handlePermissionChange);
      } catch (e) {
        console.warn('Error accessing Notification API:', e);
        setPermission('denied');
      }
    } else {
      setPermission('denied');
    }

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
      const checkNotificationSupport = () => {
        try {
          return typeof window !== 'undefined' &&
                 'Notification' in window &&
                 typeof Notification !== 'undefined' &&
                 typeof Notification.requestPermission === 'function';
        } catch (e) {
          return false;
        }
      };

      const isNotificationSupported = checkNotificationSupport();
      if (!isNotificationSupported) {
        console.warn('Notification API not supported in this browser');
        setPermission('denied');
        return null;
      }

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
