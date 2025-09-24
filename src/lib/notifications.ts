// src/lib/notifications.ts - Notification utilities and types

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

// Backend API endpoints for notifications
const API_BASE_URL = 'https://api.foodbuddy.iarm.me';

export const notificationApi = {
  // Send FCM token to backend for storage
  async registerToken(fcmToken: string) {
    const authToken = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/notifications/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({ token: fcmToken })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to register notification token: ${errorData.detail || response.statusText}`);
    }

    return response.json();
  },

  // Test notification endpoint
  async sendTestNotification() {
    const authToken = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to send test notification: ${errorData.detail || response.statusText}`);
    }

    return response.json();
  },

  // Get notification settings
  async getSettings() {
    const authToken = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/notifications/settings`, {
      method: 'GET',
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to get notification settings: ${errorData.detail || response.statusText}`);
    }

    return response.json();
  },

  // Update notification settings
  async updateSettings(settings: any) {
    const authToken = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/notifications/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to update notification settings: ${errorData.detail || response.statusText}`);
    }

    return response.json();
  }
};

// Notification types for different events
export const NotificationTypes = {
  MEAL_REMINDER: 'meal_reminder',
  BUDDY_UPDATE: 'buddy_update',
  SUGGESTION_READY: 'suggestion_ready',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system'
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

// Predefined notification templates
export const NotificationTemplates = {
  [NotificationTypes.MEAL_REMINDER]: {
    title: '🍽️ Meal Reminder',
    body: 'Time for your next meal! Log your food to stay on track with your goals.'
  },
  [NotificationTypes.BUDDY_UPDATE]: {
    title: '👥 Buddy Activity',
    body: 'Your buddy just logged a new meal! Check it out and stay connected.'
  },
  [NotificationTypes.SUGGESTION_READY]: {
    title: '💡 New Suggestions',
    body: 'Personalized meal suggestions are ready based on your daily intake!'
  },
  [NotificationTypes.ACHIEVEMENT]: {
    title: '🏆 Achievement Unlocked!',
    body: 'Congratulations! You\'ve reached a new milestone in your fitness journey.'
  },
  [NotificationTypes.SYSTEM]: {
    title: 'FoodBuddy Update',
    body: 'Important update or maintenance notification.'
  }
};
