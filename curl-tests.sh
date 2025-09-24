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

# =============================================
# LIKES AND COMMENTS API TESTS
# =============================================

echo -e "${BLUE}❤️ Likes and Comments API Tests${NC}"
echo "Testing both API patterns: with and without /api/ prefix"
echo ""

# Test Variables
MEAL_ID="123"  # Replace with actual meal ID
COMMENT_TEXT="This is a test comment from curl!"
BASE_URL="https://api.foodbuddy.iarm.me"

# Test 1: Get Like Status (without /api/ prefix - matching frontend)
echo -e "${YELLOW}🧪 Test 1: Get Like Status${NC}"
echo "GET /meals/{id}/likes"
echo ""

curl -X GET "$BASE_URL/meals/$MEAL_ID/likes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "meal_id": 123,
  "likes_count": 5,
  "liked_by_me": true
}'
echo "Status: 200 OK"
echo ""

# Test 2: Get Like Status (with /api/ prefix - matching notifications)
echo -e "${YELLOW}🧪 Test 2: Get Like Status (with /api/ prefix)${NC}"
echo "GET /api/meals/{id}/likes"
echo ""

curl -X GET "$BASE_URL/api/meals/$MEAL_ID/likes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "meal_id": 123,
  "likes_count": 5,
  "liked_by_me": true
}'
echo "Status: 200 OK"
echo ""

# Test 3: Like a Meal (without /api/ prefix)
echo -e "${YELLOW}🧪 Test 3: Like a Meal${NC}"
echo "POST /meals/{id}/like"
echo ""

curl -X POST "$BASE_URL/meals/$MEAL_ID/like" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "meal_id": 123,
  "likes_count": 6,
  "liked_by_me": true
}'
echo "Status: 200 OK"
echo ""

# Test 4: Like a Meal (with /api/ prefix)
echo -e "${YELLOW}🧪 Test 4: Like a Meal (with /api/ prefix)${NC}"
echo "POST /api/meals/{id}/like"
echo ""

curl -X POST "$BASE_URL/api/meals/$MEAL_ID/like" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "meal_id": 123,
  "likes_count": 6,
  "liked_by_me": true
}'
echo "Status: 200 OK"
echo ""

# Test 5: Get Comments (without /api/ prefix)
echo -e "${YELLOW}🧪 Test 5: Get Comments${NC}"
echo "GET /meals/{id}/comments"
echo ""

curl -X GET "$BASE_URL/meals/$MEAL_ID/comments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '[
  {
    "id": 1,
    "meal_id": 123,
    "user_id": 456,
    "comment": "Great meal!",
    "created_at": "2025-01-01T10:00:00Z"
  }
]'
echo "Status: 200 OK"
echo ""

# Test 6: Get Comments (with /api/ prefix)
echo -e "${YELLOW}🧪 Test 6: Get Comments (with /api/ prefix)${NC}"
echo "GET /api/meals/{id}/comments"
echo ""

curl -X GET "$BASE_URL/api/meals/$MEAL_ID/comments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '[
  {
    "id": 1,
    "meal_id": 123,
    "user_id": 456,
    "comment": "Great meal!",
    "created_at": "2025-01-01T10:00:00Z"
  }
]'
echo "Status: 200 OK"
echo ""

# Test 7: Post Comment (without /api/ prefix)
echo -e "${YELLOW}🧪 Test 7: Post Comment${NC}"
echo "POST /meals/{id}/comments"
echo ""

curl -X POST "$BASE_URL/meals/$MEAL_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"comment\": \"$COMMENT_TEXT\"}" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "id": 2,
  "meal_id": 123,
  "user_id": 456,
  "comment": "This is a test comment from curl!",
  "created_at": "2025-01-01T11:00:00Z"
}'
echo "Status: 201 Created"
echo ""

# Test 8: Post Comment (with /api/ prefix)
echo -e "${YELLOW}🧪 Test 8: Post Comment (with /api/ prefix)${NC}"
echo "POST /api/meals/{id}/comments"
echo ""

curl -X POST "$BASE_URL/api/meals/$MEAL_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"comment\": \"$COMMENT_TEXT\"}" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "id": 2,
  "meal_id": 123,
  "user_id": 456,
  "comment": "This is a test comment from curl!",
  "created_at": "2025-01-01T11:00:00Z"
}'
echo "Status: 201 Created"
echo ""

# Test 9: Error Handling - Unauthorized
echo -e "${YELLOW}🧪 Test 9: Error Handling - Unauthorized${NC}"
echo "POST /meals/{id}/like (No Auth)"
echo ""

curl -X POST "$BASE_URL/meals/$MEAL_ID/like" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "error": "Unauthorized"
}'
echo "Status: 401 Unauthorized"
echo ""

# Test 10: Error Handling - Invalid Meal ID
echo -e "${YELLOW}🧪 Test 10: Error Handling - Invalid Meal ID${NC}"
echo "POST /meals/invalid/like"
echo ""

curl -X POST "$BASE_URL/meals/invalid/like" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -w "\nStatus: %{http_code}\n\n" \
  -s

echo -e "${YELLOW}📝 Expected Response:${NC}"
echo '{
  "error": "Invalid meal ID"
}'
echo "Status: 400 Bad Request"
echo ""

echo -e "${BLUE}📋 Test Instructions for Likes/Comments:${NC}"
echo "1. Replace 'YOUR_JWT_TOKEN_HERE' with a valid JWT token"
echo "2. Replace '123' with an actual meal ID from your database"
echo "3. Frontend now calls endpoints WITH /api/ prefix (just pushed to main)"
echo "4. All endpoints should work consistently with your backend routing"
echo "5. Test the live app to verify likes and comments now persist"
echo ""
echo -e "${GREEN}✅ SOLUTION APPLIED:${NC}"
echo "• Frontend API calls now use /api/ prefix to match backend routing"
echo "• All endpoints: /api/meals/{id}/like, /api/meals/{id}/comments, etc."
echo "• This should resolve the integration issue"
echo ""
echo -e "${YELLOW}🧪 Testing Steps:${NC}"
echo "1. Deploy the updated frontend to your live environment"
echo "2. Test liking a meal in the app"
echo "3. Test commenting on a meal in the app"
echo "4. Verify that likes and comments persist in the database"
echo ""
echo -e "${GREEN}🎯 Ready to debug your likes and comments backend integration!${NC}"
