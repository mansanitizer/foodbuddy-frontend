// src/hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onMessageListener, showNotification, registerServiceWorker } from '../lib/firebase';

// Utility function to safely access Notification API
const getNotificationAPI = () => {
  try {
    // Log detailed context information
    console.log('Checking Notification API availability:', {
      hasWindow: typeof window !== 'undefined',
      hasNotification: typeof window !== 'undefined' && 'Notification' in window,
      windowType: typeof window,
      isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : 'unknown',
      location: typeof window !== 'undefined' ? window.location?.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Additional check to see if we can actually access the Notification constructor
      try {
        const testNotification = window.Notification;
        if (testNotification && typeof testNotification === 'function') {
          console.log('Notification API is available and accessible');
          return testNotification;
        } else {
          console.warn('Notification exists but is not a constructor function');
        }
      } catch (constructorError) {
        console.warn('Notification constructor not accessible:', constructorError);
      }
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
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    console.log('Browser info:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isSecureContext: window.isSecureContext,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotification: 'Notification' in window,
      isIOS: isIOS,
      isSafari: isSafari,
      isIOSSafari: isIOS && isSafari
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
        // Try alternative approaches for iOS Safari
        console.log('Primary Notification API not available, trying alternatives...');
        
        // Check if we're in a service worker context
        if (typeof self !== 'undefined' && 'Notification' in self) {
          console.log('Found Notification API in service worker context');
          const result = await self.Notification.requestPermission();
          console.log('Service worker permission request result:', result);
          setPermission(result);
          
          if (result === 'granted') {
            // For service worker context, we can't get FCM token here
            // The main thread should handle FCM token registration
            console.log('Permission granted in service worker context');
            return 'service-worker-granted';
          }
          return null;
        }
        
        // Check if we're in a different global context
        if (typeof globalThis !== 'undefined' && 'Notification' in globalThis) {
          console.log('Found Notification API in globalThis context');
          const result = await globalThis.Notification.requestPermission();
          console.log('GlobalThis permission request result:', result);
          setPermission(result);
          
          if (result === 'granted') {
            try {
              const fcmToken = await requestNotificationPermission();
              if (fcmToken) {
                console.log('FCM token obtained successfully via globalThis');
                setToken(fcmToken);
              }
              return fcmToken || null;
            } catch (fcmError) {
              console.error('FCM token request failed via globalThis:', fcmError);
            }
          }
          return null;
        }
        
        // Special handling for iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        if (isIOS && isSafari) {
          const error = new Error('Notifications may not be supported in this iOS Safari version. Please try updating Safari or using a different browser.');
          console.error('iOS Safari Notification API not available:', error);
          throw error;
        } else {
          const error = new Error('Notification API not available in any context');
          console.error('All Notification API checks failed:', error);
          throw error;
        }
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
