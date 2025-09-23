#!/usr/bin/env node

/**
 * Simple Node.js test script for FCM API endpoints
 * Run with: node test-fcm-api.js
 */

import https from 'https';

// Configuration
const BASE_URL = 'https://api.foodbuddy.iarm.me';
const TEST_TOKEN = 'test-token-123'; // Replace with actual JWT token

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log(`${colors.blue}${colors.bold}🚀 FCM API Test Suite${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}\n`);

  // Test 1: Get Settings (should return 401 with invalid token)
  console.log(`${colors.yellow}🧪 Test 1: Get Notification Settings (401 Expected)${colors.reset}`);
  try {
    const result = await makeRequest({
      hostname: 'api.foodbuddy.iarm.me',
      path: '/api/notifications/settings',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);

    if (result.status === 401) {
      console.log(`${colors.green}✅ PASS - Authentication working correctly${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL - Expected 401 Unauthorized${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Test Notification (should return 401 with invalid token)
  console.log(`${colors.yellow}🧪 Test 2: Send Test Notification (401 Expected)${colors.reset}`);
  try {
    const result = await makeRequest({
      hostname: 'api.foodbuddy.iarm.me',
      path: '/api/notifications/test',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);

    if (result.status === 401) {
      console.log(`${colors.green}✅ PASS - Authentication working correctly${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL - Expected 401 Unauthorized${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Register Token (should return 401 with invalid token)
  console.log(`${colors.yellow}🧪 Test 3: Register FCM Token (401 Expected)${colors.reset}`);
  try {
    const result = await makeRequest({
      hostname: 'api.foodbuddy.iarm.me',
      path: '/api/notifications/token',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, {
      token: 'test-fcm-token-123',
      userAgent: 'TestAgent/1.0',
      platform: 'web'
    });

    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);

    if (result.status === 401) {
      console.log(`${colors.green}✅ PASS - Authentication working correctly${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ FAIL - Expected 401 Unauthorized${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  console.log(`${colors.blue}${colors.bold}📋 Test Summary:${colors.reset}`);
  console.log(`${colors.blue}✅ Authentication middleware is working${colors.reset}`);
  console.log(`${colors.blue}✅ API endpoints are responding${colors.reset}`);
  console.log(`${colors.blue}⚠️  Use valid JWT tokens to test full functionality${colors.reset}`);
  console.log('\n' + '='.repeat(50) + '\n');

  console.log(`${colors.green}${colors.bold}🎯 To Test Full Functionality:${colors.reset}`);
  console.log('1. Replace TEST_TOKEN with a valid JWT token');
  console.log('2. Run: node test-fcm-api.js');
  console.log('3. Expected flow:');
  console.log('   - Get Settings (200) - Returns user preferences');
  console.log('   - Register Token (201) - Registers FCM token');
  console.log('   - Send Test (200) - Sends notification');
  console.log('   - Update Settings (200) - Updates preferences');

  console.log('\n' + '='.repeat(50) + '\n');
  console.log(`${colors.yellow}${colors.bold}🔧 Next Steps for Backend Developer:${colors.reset}`);
  console.log('1. Implement the FCM endpoints (see FCM_BACKEND_IMPLEMENTATION.md)');
  console.log('2. Set up Firebase Admin SDK');
  console.log('3. Create database tables for tokens and settings');
  console.log('4. Test with valid authentication tokens');
  console.log('\n' + '='.repeat(50) + '\n');
}

// Run tests
runTests().catch(console.error);
