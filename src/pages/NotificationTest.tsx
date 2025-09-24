// src/pages/NotificationTest.tsx
import { useState } from 'react';
import { notificationApi, NotificationTemplates } from '../lib/notifications';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function NotificationTest() {
  const { permission, isSupported, requestPermission, subscribeToNotifications } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [reRegisterLoading, setReRegisterLoading] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

  const handleTestNotification = async (type: keyof typeof NotificationTemplates) => {
    setLoading(true);
    try {
      await notificationApi.sendTestNotification();
      setMessage(`Test notification sent! Check your device.`);

      // Also try to show a browser notification if supported
      if (permission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
        const template = NotificationTemplates[type];
        new Notification(template.title, {
          body: template.body,
          icon: '/icon-192.png',
          badge: '/icon-72.png'
        });
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);

      // Extract detailed error information
      let errorMessage = 'Failed to send test notification. ';

      if (error instanceof Error) {
        errorMessage += `Error: ${error.message}`;

        // Try to extract more details from the error
        if (error.stack) {
          console.error('Full error stack:', error.stack);
        }

        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage += ' (Network connection issue - check if backend is running)';
        }

        // Check if it's an HTTP error
        if ('status' in error && typeof error.status === 'number') {
          errorMessage += ` (HTTP ${error.status})`;
        }

        // Try to get response details if available
        if ('response' in error) {
          const response = (error as any).response;
          if (response && typeof response === 'object') {
            if (response.status) {
              errorMessage += ` - Server returned ${response.status}`;
            }
            if (response.data && typeof response.data === 'string') {
              errorMessage += `: ${response.data}`;
            } else if (response.data && response.data.message) {
              errorMessage += `: ${response.data.message}`;
            }
          }
        }
      } else {
        // Handle non-Error objects
        errorMessage += `Unexpected error: ${String(error)}`;
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReGrantPermissions = async () => {
    setPermissionLoading(true);
    setMessage('');

    try {
      const result = await requestPermission();

      if (result) {
        setMessage('✅ Notification permissions granted successfully!');

        // Also try to subscribe/re-register FCM token
        setTimeout(async () => {
          try {
            const token = await subscribeToNotifications();
            if (token) {
              setMessage(prev => prev + ` FCM token registered successfully! Token: ${token.substring(0, 20)}...`);
            } else {
              setMessage(prev => prev + ' (FCM token registration returned empty token)');
            }
          } catch (tokenError) {
            console.error('Token registration error:', tokenError);
            setMessage(prev => prev + ' (FCM token registration failed - check console for details)');
          }
        }, 1000);
      } else {
        setMessage('❌ Permission request was denied or failed.');
      }
    } catch (error) {
      console.error('Error re-granting permissions:', error);
      setMessage('❌ Failed to re-grant permissions. Please try again.');
    } finally {
      setPermissionLoading(false);
    }
  };

  const handleReRegisterToken = async () => {
    setReRegisterLoading(true);
    setMessage('');

    try {
      // Generate a new FCM token by subscribing again
      const token = await subscribeToNotifications();

      if (token) {
        setMessage(`✅ FCM token re-registered successfully! Token: ${token.substring(0, 20)}...`);
      } else {
        setMessage('❌ Failed to re-register FCM token. Please check permissions and try again.');
      }
    } catch (error) {
      console.error('Error re-registering FCM token:', error);
      setMessage('❌ Failed to re-register FCM token. Please try again.');
    } finally {
      setReRegisterLoading(false);
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

      {/* Utility Buttons */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          🔧 Utility Actions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Re-grant Permissions Button */}
          <button
            onClick={handleReGrantPermissions}
            disabled={permissionLoading}
            style={{
              backgroundColor: permissionLoading ? '#ccc' : 'var(--accent-orange)',
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: permissionLoading ? 'not-allowed' : 'pointer',
              opacity: permissionLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {permissionLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Requesting Permissions...
              </>
            ) : (
              <>
                🔓 Re-grant Permissions
              </>
            )}
          </button>

          {/* Re-register Token Button */}
          <button
            onClick={handleReRegisterToken}
            disabled={reRegisterLoading || permission !== 'granted'}
            style={{
              backgroundColor: (reRegisterLoading || permission !== 'granted') ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: (reRegisterLoading || permission !== 'granted') ? 'not-allowed' : 'pointer',
              opacity: (reRegisterLoading || permission !== 'granted') ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {reRegisterLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Re-registering Token...
              </>
            ) : (
              <>
                🔄 Re-register FCM Token
              </>
            )}
          </button>

          {permission !== 'granted' && (
            <p style={{
              margin: '8px 0 0 0',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              textAlign: 'center'
            }}>
              🔓 Grant permissions first to re-register FCM token
            </p>
          )}
        </div>
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

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
