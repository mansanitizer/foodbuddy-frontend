// src/pages/NotificationTest.tsx
import { useState } from 'react';
import { notificationApi, NotificationTemplates } from '../lib/notifications';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function NotificationTest() {
  const { permission, isSupported } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleTestNotification = async (type: keyof typeof NotificationTemplates) => {
    setLoading(true);
    try {
      await notificationApi.sendTestNotification();
      setMessage(`Test notification sent! Check your device.`);

      // Also try to show a browser notification if supported
      if (permission === 'granted') {
        const template = NotificationTemplates[type];
        new Notification(template.title, {
          body: template.body,
          icon: '/icon-192.png',
          badge: '/icon-72.png'
        });
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      setMessage('Failed to send test notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '20px',
        paddingBottom: '80px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>
            Push Notifications Not Supported
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '20px',
      paddingBottom: '80px'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          margin: 0,
          color: 'var(--text-primary)',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          🔔 Notification Test
        </h1>
      </div>

      {/* Permission Status */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        borderLeft: `4px solid ${
          permission === 'granted' ? 'var(--accent-orange)' :
          permission === 'denied' ? '#ef4444' : '#f59e0b'
        }`
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          Permission Status
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Current permission: <strong>{permission}</strong>
        </p>
        {permission === 'default' && (
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Click "Request Permission" in the browser to enable notifications
          </p>
        )}
      </div>

      {/* Test Notifications */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          Test Different Notification Types
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(NotificationTemplates).map(([type, template]) => (
            <button
              key={type}
              onClick={() => handleTestNotification(type as keyof typeof NotificationTemplates)}
              disabled={loading || permission !== 'granted'}
              style={{
                backgroundColor: permission !== 'granted' ? '#ccc' : 'var(--accent-orange)',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: permission !== 'granted' ? 'not-allowed' : 'pointer',
                opacity: permission !== 'granted' ? 0.6 : 1
              }}
            >
              {template.title} - {template.body}
            </button>
          ))}
        </div>

        {permission !== 'granted' && (
          <p style={{
            margin: '12px 0 0 0',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            Enable notifications first to test them
          </p>
        )}
      </div>

      {/* Status Messages */}
      {message && (
        <div style={{
          backgroundColor: message.includes('Failed') ? '#fee2e2' : '#d1fae5',
          border: `1px solid ${message.includes('Failed') ? '#fecaca' : '#a7f3d0'}`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: message.includes('Failed') ? '#dc2626' : '#059669'
        }}>
          {message}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '20px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
          How to Test
        </h3>
        <ol style={{
          margin: 0,
          paddingLeft: '20px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6'
        }}>
          <li>Make sure notifications are enabled in your browser settings</li>
          <li>Click "Allow" when prompted for notification permission</li>
          <li>Try different notification types above</li>
          <li>Check if notifications appear on your device</li>
          <li>Test with browser in background for push notifications</li>
        </ol>
      </div>
    </div>
  );
}
