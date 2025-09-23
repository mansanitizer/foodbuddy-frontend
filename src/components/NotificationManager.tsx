// src/components/NotificationManager.tsx
import { useEffect, useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationManager = () => {
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt if notifications are supported but not granted/denied
    if (isSupported && permission === 'default') {
      // Delay showing prompt to avoid being intrusive
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
    }
  }, [isSupported, permission]);

  const handleEnableNotifications = async () => {
    const token = await requestPermission();
    if (token) {
      console.log('Successfully subscribed to notifications:', token);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Don't render anything if notifications aren't supported or already handled
  if (!isSupported || permission !== 'default') {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '20px',
            right: '20px',
            zIndex: 1000,
            maxWidth: '400px',
            margin: '0 auto'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔔</div>
              <h3 style={{
                margin: '0 0 8px 0',
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Stay Updated
              </h3>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                Get notified about meal reminders, buddy updates, and personalized suggestions!
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleEnableNotifications}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--accent-orange)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Enable Notifications
                </button>
                <button
                  onClick={handleDismiss}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
