# Firebase Cloud Messaging (FCM) API Test Guide

## Overview
This guide provides comprehensive curl commands to test your FCM backend implementation. The tests cover all required endpoints for the FoodBuddy push notification system.

## Files
- `curl-tests.sh` - Executable script with all test commands
- `FCM_CURL_TESTS_README.md` - This documentation

## Quick Start

### 1. Set Your JWT Token
Replace `YOUR_JWT_TOKEN_HERE` in the curl commands with a valid JWT token from your authentication system.

### 2. Update Base URL
If testing against a different backend, update the `BASE_URL` variable in `curl-tests.sh`.

### 3. Run Tests
```bash
# Run all tests
./curl-tests.sh

# Or run individual curl commands from the script
```

## API Endpoints Tested

### 1. POST `/api/notifications/token`
**Purpose:** Register a user's FCM token for push notifications

**Success Response (201):**
```json
{
  "success": true,
  "message": "Token registered successfully"
}
```

**Error Responses:**
- `400` - Invalid token format
- `401` - Unauthorized
- `409` - Token already exists

### 2. POST `/api/notifications/test`
**Purpose:** Send a test notification to the current user

**Success Response (200):**
```json
{
  "success": true,
  "message": "Test notification sent",
  "notificationId": "firebase-message-id"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - No FCM token found for user
- `500` - Failed to send notification

### 3. GET `/api/notifications/settings`
**Purpose:** Retrieve user's notification preferences

**Success Response (200):**
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

**Success Response (200):**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

## Error Handling Tests

The script includes tests for various error scenarios:

1. **Invalid Token Format** - Tests validation
2. **Missing Authentication** - Tests auth middleware
3. **No FCM Token** - Tests token existence checks
4. **Invalid Settings Data** - Tests input validation

## Expected Response Codes

| Endpoint | Method | Success Code | Error Codes |
|----------|--------|--------------|-------------|
| `/token` | POST | 201 | 400, 401, 409 |
| `/test` | POST | 200 | 401, 404, 500 |
| `/settings` | GET | 200 | 401, 404 |
| `/settings` | PUT | 200 | 400, 401 |

## Database Requirements

Before running tests, ensure these tables exist:

### `user_fcm_tokens`
```sql
CREATE TABLE user_fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20) DEFAULT 'web',
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

### `user_notification_settings`
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Authentication

All endpoints (except error tests) require:
```
Authorization: Bearer <your-jwt-token>
```

Make sure your JWT token is valid and contains the user ID.

## Testing Workflow

1. **Register Token** - Start with a valid FCM token
2. **Get Settings** - Check default notification preferences
3. **Update Settings** - Modify some preferences
4. **Send Test** - Trigger a test notification
5. **Error Tests** - Verify proper error handling

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Check your JWT token is valid
   - Ensure user exists in database
   - Verify authentication middleware

2. **404 Not Found**
   - For `/test`: No FCM token registered for user
   - For `/settings`: User has no notification settings

3. **400 Bad Request**
   - Invalid JSON format
   - Missing required fields
   - Invalid data types

4. **500 Internal Server Error**
   - Firebase Admin SDK not configured
   - Database connection issues
   - Missing environment variables

### Debug Tips:

1. **Check Firebase Console** - See if messages are being sent
2. **Review Server Logs** - Look for detailed error messages
3. **Test with Postman** - Use GUI for easier debugging
4. **Verify Environment Variables** - Ensure all Firebase configs are set

## Environment Variables Required

Your backend needs these environment variables:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_DATABASE_URL=your-database-url
```

## Next Steps

After successful testing:

1. **Implement Scheduled Jobs** - Set up cron jobs for regular notifications
2. **Add Rate Limiting** - Prevent notification spam
3. **Monitor Analytics** - Track delivery and engagement rates
4. **Set Up Alerts** - Monitor for failed deliveries

## Support

If tests fail, check:
- Firebase project configuration
- Authentication middleware
- Database permissions
- Environment variables

The frontend is ready and will automatically work once these endpoints return the expected responses!
