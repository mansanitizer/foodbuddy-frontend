// src/components/NotificationSettings.tsx
import { useState, useEffect } from 'react';
import { notificationApi } from '../lib/notifications';

interface NotificationSettings {
  mealReminders: boolean;
  buddyUpdates: boolean;
  suggestions: boolean;
  achievements: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    mealReminders: true,
    buddyUpdates: true,
    suggestions: true,
    achievements: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await notificationApi.getSettings();
      setSettings(prev => ({ ...prev, ...userSettings }));
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await notificationApi.updateSettings(settings);
      console.log('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '20px',
      margin: '16px 0'
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        color: 'var(--text-primary)',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        🔔 Notification Settings
      </h3>

      {/* Meal Reminders */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>
            🍽️ Meal Reminders
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Reminders to log your meals
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.mealReminders}
            onChange={(e) => updateSetting('mealReminders', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.mealReminders ? 'var(--accent-orange)' : '#ccc',
            transition: '.4s',
            borderRadius: '24px'
          }}></span>
          <span style={{
            position: 'absolute',
            content: '',
            height: '18px',
            width: '18px',
            left: '3px',
            bottom: '3px',
            backgroundColor: 'white',
            transition: '.4s',
            borderRadius: '50%',
            transform: settings.mealReminders ? 'translateX(20px)' : 'translateX(0)'
          }}></span>
        </label>
      </div>

      {/* Buddy Updates */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>
            👥 Buddy Updates
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Notifications when your buddy logs meals
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.buddyUpdates}
            onChange={(e) => updateSetting('buddyUpdates', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.buddyUpdates ? 'var(--accent-orange)' : '#ccc',
            transition: '.4s',
            borderRadius: '24px'
          }}></span>
          <span style={{
            position: 'absolute',
            content: '',
            height: '18px',
            width: '18px',
            left: '3px',
            bottom: '3px',
            backgroundColor: 'white',
            transition: '.4s',
            borderRadius: '50%',
            transform: settings.buddyUpdates ? 'translateX(20px)' : 'translateX(0)'
          }}></span>
        </label>
      </div>

      {/* Suggestions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>
            💡 Suggestions
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            When new meal suggestions are ready
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.suggestions}
            onChange={(e) => updateSetting('suggestions', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.suggestions ? 'var(--accent-orange)' : '#ccc',
            transition: '.4s',
            borderRadius: '24px'
          }}></span>
          <span style={{
            position: 'absolute',
            content: '',
            height: '18px',
            width: '18px',
            left: '3px',
            bottom: '3px',
            backgroundColor: 'white',
            transition: '.4s',
            borderRadius: '50%',
            transform: settings.suggestions ? 'translateX(20px)' : 'translateX(0)'
          }}></span>
        </label>
      </div>

      {/* Achievements */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>
            🏆 Achievements
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            When you unlock new achievements
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.achievements}
            onChange={(e) => updateSetting('achievements', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.achievements ? 'var(--accent-orange)' : '#ccc',
            transition: '.4s',
            borderRadius: '24px'
          }}></span>
          <span style={{
            position: 'absolute',
            content: '',
            height: '18px',
            width: '18px',
            left: '3px',
            bottom: '3px',
            backgroundColor: 'white',
            transition: '.4s',
            borderRadius: '50%',
            transform: settings.achievements ? 'translateX(20px)' : 'translateX(0)'
          }}></span>
        </label>
      </div>

      {/* Quiet Hours */}
      <div style={{
        padding: '16px 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>
              🌙 Quiet Hours
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Pause notifications during sleep hours
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
            <input
              type="checkbox"
              checked={settings.quietHours.enabled}
              onChange={(e) => updateSetting('quietHours', { ...settings.quietHours, enabled: e.target.checked })}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings.quietHours.enabled ? 'var(--accent-orange)' : '#ccc',
              transition: '.4s',
              borderRadius: '24px'
            }}></span>
            <span style={{
              position: 'absolute',
              content: '',
              height: '18px',
              width: '18px',
              left: '3px',
              bottom: '3px',
              backgroundColor: 'white',
              transition: '.4s',
              borderRadius: '50%',
              transform: settings.quietHours.enabled ? 'translateX(20px)' : 'translateX(0)'
            }}></span>
          </label>
        </div>

        {settings.quietHours.enabled && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Start Time</label>
              <input
                type="time"
                value={settings.quietHours.start}
                onChange={(e) => updateSetting('quietHours', { ...settings.quietHours, start: e.target.value })}
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>End Time</label>
              <input
                type="time"
                value={settings.quietHours.end}
                onChange={(e) => updateSetting('quietHours', { ...settings.quietHours, end: e.target.value })}
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ padding: '16px 0 0 0', textAlign: 'center' }}>
        <button
          onClick={saveSettings}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : 'var(--accent-orange)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};
