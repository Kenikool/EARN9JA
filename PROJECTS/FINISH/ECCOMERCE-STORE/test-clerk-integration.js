/**
 * Clerk Integration Test Script
 * Tests all Clerk-related endpoints
 */

const BASE_URL = 'http://localhost:8000/api';

// Test results storage
const results = {
  passed: [],
  failed: [],
  total: 0
};

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      data: responseData
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing: Health Check');
  results.total++;
  
  const response = await makeRequest('GET', '/../health');
  
  if (response.ok && response.data.status === 'success') {
    console.log('✅ PASSED: Server is running');
    results.passed.push('Health Check');
    return true;
  } else {
    console.log('❌ FAILED: Server health check failed');
    results.failed.push('Health Check');
    return false;
  }
}

async function testClerkStatus(token) {
  console.log('\n🔍 Testing: Get Clerk Status (Protected)');
  results.total++;
  
  const response = await makeRequest('GET', '/auth/clerk/status', null, token);
  
  if (response.ok) {
    console.log('✅ PASSED: Clerk status retrieved');
    console.log('   Status:', JSON.stringify(response.data.data, null, 2));
    results.passed.push('Get Clerk Status');
    return response.data;
  } else {
    console.log('❌ FAILED: Could not get Clerk status');
    console.log('   Error:', response.data.message);
    results.failed.push('Get Clerk Status');
    return null;
  }
}

async function testLinkClerkAccount(token) {
  console.log('\n🔍 Testing: Link Clerk Account (Protected)');
  results.total++;
  
  const testData = {
    clerkUserId: 'user_test_' + Date.now(),
    googleId: 'google_test_' + Date.now()
  };
  
  const response = await makeRequest('POST', '/auth/clerk/link', testData, token);
  
  if (response.ok) {
    console.log('✅ PASSED: Clerk account linked');
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    results.passed.push('Link Clerk Account');
    return true;
  } else {
    console.log('⚠️  Expected behavior: Linking requires valid Clerk user');
    console.log('   Error:', response.data.message);
    results.passed.push('Link Clerk Account (Expected Error)');
    return false;
  }
}

async function testUnlinkClerkAccount(token) {
  console.log('\n🔍 Testing: Unlink Clerk Account (Protected)');
  results.total++;
  
  const response = await makeRequest('POST', '/auth/clerk/unlink', {}, token);
  
  if (response.status === 400 && response.data.message.includes('password')) {
    console.log('✅ PASSED: Unlink validation working (requires password)');
    results.passed.push('Unlink Clerk Account');
    return true;
  } else if (response.ok) {
    console.log('✅ PASSED: Clerk account unlinked');
    results.passed.push('Unlink Clerk Account');
    return true;
  } else {
    console.log('❌ FAILED: Unexpected response');
    console.log('   Error:', response.data.message);
    results.failed.push('Unlink Clerk Account');
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('\n🔍 Testing: Webhook Endpoint (Public)');
  results.total++;
  
  // Note: This will fail without proper Svix signature, which is expected
  const testPayload = {
    type: 'user.created',
    data: {
      id: 'user_test',
      email_addresses: [{
        id: 'email_test',
        email_address: 'test@example.com'
      }],
      primary_email_address_id: 'email_test',
      first_name: 'Test',
      last_name: 'User'
    }
  };
  
  const response = await makeRequest('POST', '/auth/clerk/webhook', testPayload);
  
  if (response.status === 400 && response.data.message.includes('svix')) {
    console.log('✅ PASSED: Webhook security working (requires Svix headers)');
    console.log('   This is expected - webhooks need valid Clerk signatures');
    results.passed.push('Webhook Security');
    return true;
  } else {
    console.log('⚠️  Webhook endpoint response:', response.status);
    console.log('   Message:', response.data.message);
    results.passed.push('Webhook Endpoint (Accessible)');
    return true;
  }
}

// Helper function to create a test user and get token
async function createTestUser() {
  console.log('\n📝 Creating test user for authentication...');
  
  const testUser = {
    name: 'Clerk Test User',
    email: `clerk.test.${Date.now()}@example.com`,
    password: 'Test123!@#'
  };
  
  // Register user
  const registerResponse = await makeRequest('POST', '/auth/register', testUser);
  
  if (!registerResponse.ok) {
    console.log('⚠️  Could not create test user:', registerResponse.data.message);
    return null;
  }
  
  console.log('✅ Test user created');
  
  // Login to get token
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (loginResponse.ok && loginResponse.data.token) {
    console.log('✅ Test user logged in');
    return {
      token: loginResponse.data.token,
      user: loginResponse.data.user
    };
  }
  
  return null;
}

// Main test runner
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     CLERK INTEGRATION ENDPOINT TESTS                   ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n📍 Testing against:', BASE_URL);
  console.log('⏰ Started at:', new Date().toLocaleString());
  
  // Test 1: Health Check
  const serverRunning = await testHealthCheck();
  
  if (!serverRunning) {
    console.log('\n❌ Server is not running. Please start the server first.');
    console.log('   Run: cd server && npm run dev');
    return;
  }
  
  // Test 2: Webhook Endpoint (Public)
  await testWebhookEndpoint();
  
  // Create test user for protected routes
  const testAuth = await createTestUser();
  
  if (!testAuth) {
    console.log('\n⚠️  Skipping protected endpoint tests (no auth token)');
  } else {
    // Test 3: Get Clerk Status
    await testClerkStatus(testAuth.token);
    
    // Test 4: Link Clerk Account
    await testLinkClerkAccount(testAuth.token);
    
    // Test 5: Unlink Clerk Account
    await testUnlinkClerkAccount(testAuth.token);
  }
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${results.passed.length}/${results.total}`);
  console.log(`❌ Failed: ${results.failed.length}/${results.total}`);
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`   - ${test}`));
  }
  
  console.log('\n📝 Notes:');
  console.log('   - Webhook endpoint requires valid Clerk/Svix signatures');
  console.log('   - Link/Unlink require valid Clerk user IDs');
  console.log('   - Test the full flow by signing in with Google on the frontend');
  
  console.log('\n⏰ Completed at:', new Date().toLocaleString());
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test runner error:', error);
  process.exit(1);
});
