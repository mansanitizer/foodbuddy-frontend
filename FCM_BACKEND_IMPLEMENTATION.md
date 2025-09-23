# Firebase Cloud Messaging (FCM) Backend Implementation Guide

## Overview
The FoodBuddy frontend has been updated with comprehensive FCM push notification support. This document provides the technical specification for implementing the backend endpoints to support push notifications.

## Frontend Implementation Status
✅ **Complete** - All frontend notification components, hooks, and UI are implemented and ready.

## Required Backend Endpoints

### 1. POST `/api/notifications/token`
**Purpose:** Register user's FCM token for push notifications

**Request Body:**
```json
{
  "token": "fcm-token-string-here",
  "userAgent": "Mozilla/5.0...",
  "platform": "web"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Token registered successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid token format
- `401 Unauthorized` - User not authenticated
- `409 Conflict` - Token already exists

### 2. POST `/api/notifications/test`
**Purpose:** Send a test notification to the current user

**Request Body:** (empty)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test notification sent",
  "notificationId": "firebase-message-id"
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - No FCM token found for user
- `500 Internal Server Error` - Failed to send notification

### 3. GET `/api/notifications/settings`
**Purpose:** Retrieve user's notification preferences

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "mealReminders": true,
  "buddyUpdates": true,
  "suggestions": true,
  "achievements": true,
  "quietHours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }
}
```

### 4. PUT `/api/notifications/settings`
**Purpose:** Update user's notification preferences

**Request Body:**
```json
{
  "mealReminders": boolean,
  "buddyUpdates": boolean,
  "suggestions": boolean,
  "achievements": boolean,
  "quietHours": {
    "enabled": boolean,
    "start": "HH:MM",
    "end": "HH:MM"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

## Firebase Admin SDK Setup

### 1. Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### 2. Initialize Firebase Admin
```javascript
const admin = require('firebase-admin');

const serviceAccount = require('./path/to/service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### 3. Send Notifications Function
```javascript
async function sendNotification(userId, notification) {
  try {
    // Get user's FCM tokens from database
    const userTokens = await getUserFCMTokens(userId);

    if (userTokens.length === 0) {
      throw new Error('No FCM tokens found for user');
    }

    // Check quiet hours
    const shouldSend = await checkQuietHours(userId);
    if (!shouldSend) {
      return { success: false, reason: 'quiet_hours' };
    }

    const message = {
      tokens: userTokens,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icon-192.png',
        badge: notification.badge || '/icon-72.png',
        tag: notification.tag || notification.type
      },
      data: {
        type: notification.type,
        ...notification.data
      },
      android: {
        priority: 'high',
        notification: {
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body
            },
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Handle results
    const successCount = response.successCount;
    const failureCount = response.failureCount;

    // Remove invalid tokens
    if (failureCount > 0) {
      await removeInvalidTokens(userId, response.responses);
    }

    return {
      success: true,
      sent: successCount,
      failed: failureCount
    };

  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
```

## Database Schema Requirements

### FCM Tokens Table
```sql
CREATE TABLE user_fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20) DEFAULT 'web',
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);
CREATE INDEX idx_user_fcm_tokens_token ON user_fcm_tokens(token);
CREATE INDEX idx_user_fcm_tokens_active ON user_fcm_tokens(is_active);
```

### Notification Settings Table
```sql
CREATE TABLE user_notification_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  meal_reminders BOOLEAN DEFAULT true,
  buddy_updates BOOLEAN DEFAULT true,
  suggestions BOOLEAN DEFAULT true,
  achievements BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Notification Types & Templates

### Available Notification Types:
- `meal_reminder` - Remind users to log meals
- `buddy_update` - When buddy logs a meal
- `suggestion_ready` - AI suggestions available
- `achievement` - Achievement unlocked
- `system` - System updates/maintenance

### Example Notification Calls:

```javascript
// Meal reminder
await sendNotification(userId, {
  type: 'meal_reminder',
  title: '🍽️ Meal Reminder',
  body: 'Time for your next meal! Log your food to stay on track.',
  data: { mealType: 'lunch', suggestedCalories: 500 }
});

// Buddy update
await sendNotification(userId, {
  type: 'buddy_update',
  title: '👥 Buddy Activity',
  body: 'Your buddy just logged a delicious meal! Check it out.',
  data: { buddyId: buddyId, mealType: 'dinner' }
});

// Achievement
await sendNotification(userId, {
  type: 'achievement',
  title: '🏆 Achievement Unlocked!',
  body: 'Congratulations! You\'ve logged meals for 7 days straight!',
  data: { achievementId: 'streak_7_days' }
});
```

## Quiet Hours Implementation

```javascript
async function checkQuietHours(userId) {
  const settings = await getUserNotificationSettings(userId);

  if (!settings.quietHoursEnabled) {
    return true; // Quiet hours disabled
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTime = timeStringToMinutes(settings.quietHoursStart);
  const endTime = timeStringToMinutes(settings.quietHoursEnd);

  if (startTime <= endTime) {
    // Normal range (e.g., 22:00 to 08:00)
    return currentTime < startTime || currentTime > endTime;
  } else {
    // Overnight range (e.g., 23:00 to 07:00)
    return currentTime > endTime && currentTime < startTime;
  }
}

function timeStringToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}
```

## Scheduled Notifications

### Cron Jobs for Regular Reminders:
```javascript
// Every 4 hours during active hours (8 AM - 10 PM)
const mealReminderJob = schedule.scheduleJob('0 */4 8-22 * * *', async () => {
  const users = await getUsersWithMealRemindersEnabled();
  for (const user of users) {
    await sendNotification(user.id, {
      type: 'meal_reminder',
      title: '🍽️ Meal Reminder',
      body: 'Don\'t forget to log your meals to stay on track with your goals!'
    });
  }
});

// Daily achievement check at 9 PM
const achievementJob = schedule.scheduleJob('0 21 * * *', async () => {
  const achievements = await checkAndAwardAchievements();
  for (const achievement of achievements) {
    await sendNotification(achievement.userId, {
      type: 'achievement',
      title: '🏆 New Achievement!',
      body: achievement.message,
      data: { achievementId: achievement.id }
    });
  }
});
```

## Security Considerations

1. **Token Validation:** Always validate FCM tokens before storing
2. **Rate Limiting:** Limit notification requests to prevent spam
3. **User Consent:** Only send notifications to users who have opted in
4. **Token Cleanup:** Regularly remove expired/invalid tokens
5. **Audit Logging:** Log all notification sends for compliance

## Testing

### Manual Testing:
```javascript
// Test a single user
await sendNotification(userId, {
  type: 'test',
  title: 'Test Notification',
  body: 'This is a test notification from FoodBuddy'
});

// Test with specific data
await sendNotification(userId, {
  type: 'meal_reminder',
  title: 'Test Meal Reminder',
  body: 'Test notification with custom data',
  data: { testId: 123, timestamp: Date.now() }
});
```

### Automated Testing:
- Unit tests for notification functions
- Integration tests for API endpoints
- Load testing for high-volume notifications
- Token expiration handling tests

## Monitoring & Analytics

Track these metrics:
- Notification delivery rates
- User engagement (open/click rates)
- Opt-out rates
- Device/platform distribution
- Peak notification times

## Deployment Checklist

- [ ] Firebase Admin SDK installed and configured
- [ ] Service account key secured (environment variable)
- [ ] Database tables created and migrated
- [ ] API endpoints implemented and tested
- [ ] Cron jobs scheduled for regular notifications
- [ ] Error handling and logging implemented
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up

---

**Next Steps:**
1. Implement the endpoints listed above
2. Set up Firebase Admin SDK
3. Create database tables for tokens and settings
4. Test with the frontend notification test page
5. Schedule regular notification jobs
6. Monitor and optimize based on user engagement

The frontend is fully ready and will automatically work once these backend endpoints are implemented!
