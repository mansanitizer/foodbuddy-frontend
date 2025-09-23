#!/bin/bash

# Firebase Cloud Messaging (FCM) Backend API Test Script
# This script tests all the required endpoints for push notifications

BASE_URL="https://api.foodbuddy.iarm.me"
# BASE_URL="http://localhost:8000"  # Use this for local development

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔥 Firebase Cloud Messaging Backend API Tests${NC}"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Register FCM Token
echo -e "${YELLOW}🧪 Test 1: Register FCM Token${NC}"
echo "POST /api/notifications/token"
echo ""

curl -X POST "$BASE_URL/api/notifications/token" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "token": "fcm-token-example-123456789",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "platform": "web"
  }' \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "success": true,
  "message": "Token registered successfully"
}'
echo "Status: 201 Created"
echo ""

# Test 2: Send Test Notification
echo -e "${YELLOW}🧪 Test 2: Send Test Notification${NC}"
echo "POST /api/notifications/test"
echo ""

curl -X POST "$BASE_URL/api/notifications/test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "success": true,
  "message": "Test notification sent",
  "notificationId": "firebase-message-id"
}'
echo "Status: 200 OK"
echo ""

# Test 3: Get Notification Settings
echo -e "${YELLOW}🧪 Test 3: Get Notification Settings${NC}"
echo "GET /api/notifications/settings"
echo ""

curl -X GET "$BASE_URL/api/notifications/settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "mealReminders": true,
  "buddyUpdates": true,
  "suggestions": true,
  "achievements": true,
  "quietHours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }
}'
echo "Status: 200 OK"
echo ""

# Test 4: Update Notification Settings
echo -e "${YELLOW}🧪 Test 4: Update Notification Settings${NC}"
echo "PUT /api/notifications/settings"
echo ""

curl -X PUT "$BASE_URL/api/notifications/settings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "mealReminders": false,
    "buddyUpdates": true,
    "suggestions": true,
    "achievements": false,
    "quietHours": {
      "enabled": true,
      "start": "23:00",
      "end": "07:00"
    }
  }' \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "success": true,
  "message": "Settings updated successfully"
}'
echo "Status: 200 OK"
echo ""

# Test 5: Error Handling - Invalid Token
echo -e "${YELLOW}🧪 Test 5: Error Handling - Invalid Token${NC}"
echo "POST /api/notifications/token (Invalid Token)"
echo ""

curl -X POST "$BASE_URL/api/notifications/token" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "token": "invalid-token",
    "userAgent": "Mozilla/5.0",
    "platform": "web"
  }' \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "error": "Invalid token format"
}'
echo "Status: 400 Bad Request"
echo ""

# Test 6: Error Handling - Unauthorized
echo -e "${YELLOW}🧪 Test 6: Error Handling - Unauthorized${NC}"
echo "GET /api/notifications/settings (No Auth)"
echo ""

curl -X GET "$BASE_URL/api/notifications/settings" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "error": "Unauthorized"
}'
echo "Status: 401 Unauthorized"
echo ""

# Test 7: Error Handling - Not Found
echo -e "${YELLOW}🧪 Test 7: Error Handling - No FCM Token${NC}"
echo "POST /api/notifications/test (No Token)"
echo ""

curl -X POST "$BASE_URL/api/notifications/test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "error": "No FCM token found for user"
}'
echo "Status: 404 Not Found"
echo ""

# Test 8: Error Handling - Invalid Settings
echo -e "${YELLOW}🧪 Test 8: Error Handling - Invalid Settings${NC}"
echo "PUT /api/notifications/settings (Invalid Data)"
echo ""

curl -X PUT "$BASE_URL/api/notifications/settings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "invalidSetting": true
  }' \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "error": "Invalid settings format"
}'
echo "Status: 400 Bad Request"
echo ""

echo -e "${BLUE}📋 Test Instructions:${NC}"
echo "1. Replace 'YOUR_JWT_TOKEN_HERE' with a valid JWT token"
echo "2. Update BASE_URL if testing against a different backend"
echo "3. Run each test individually or modify the script as needed"
echo ""
echo -e "${BLUE}🔍 Test Coverage:${NC}"
echo "✅ Token Registration"
echo "✅ Test Notifications"
echo "✅ Get Settings"
echo "✅ Update Settings"
echo "✅ Error Handling (400, 401, 404)"
echo "✅ Authentication"
echo "✅ Validation"
echo ""

echo -e "${GREEN}🎯 Ready to test your FCM backend implementation!${NC}"
