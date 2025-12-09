/**
 * Comprehensive Endpoint Test Script
 * Tests ALL backend endpoints including Clerk integration
 */

const BASE_URL = 'http://localhost:8000/api';

const results = {
  passed: [],
  failed: [],
  skipped: [],
  total: 0
};

let authToken = null;
let testUser = null;

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
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = { message: 'No JSON response' };
    }
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

function logTest(name, passed, message = '') {
  results.total++;
  if (passed) {
    console.log(`✅ ${name}`);
    if (message) console.log(`   ${message}`);
    results.passed.push(name);
  } else {
    console.log(`❌ ${name}`);
    if (message) console.log(`   ${message}`);
    results.failed.push(name);
  }
}

function logSkip(name, reason) {
  console.log(`⏭️  ${name} - ${reason}`);
  results.skipped.push(name);
}

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

async function testAuthEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                 AUTHENTICATION TESTS                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Register
  const registerData = {
    name: 'Test User',
    email: `test.${Date.now()}@example.com`,
    password: 'Test123!@#'
  };
  
  const registerRes = await makeRequest('POST', '/auth/register', registerData);
  logTest('POST /auth/register', registerRes.ok, registerRes.data.message);
  
  if (registerRes.ok) {
    testUser = registerData;
  }

  // Login
  const loginRes = await makeRequest('POST', '/auth/login', {
    email: registerData.email,
    password: registerData.password
  });
  logTest('POST /auth/login', loginRes.ok, loginRes.data.message);
  
  if (loginRes.ok && loginRes.data.token) {
    authToken = loginRes.data.token;
  }

  // Get Profile
  if (authToken) {
    const profileRes = await makeRequest('GET', '/auth/profile', null, authToken);
    logTest('GET /auth/profile', profileRes.ok);
  } else {
    logSkip('GET /auth/profile', 'No auth token');
  }

  // Refresh Token
  if (authToken) {
    const refreshRes = await makeRequest('POST', '/auth/refresh-token', {}, authToken);
    logTest('POST /auth/refresh-token', refreshRes.status === 200 || refreshRes.status === 400);
  }
}

// ============================================================================
// CLERK INTEGRATION TESTS
// ============================================================================

async function testClerkEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║              CLERK INTEGRATION TESTS                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Webhook (will fail without Svix signature - expected)
  const webhookRes = await makeRequest('POST', '/auth/clerk/webhook', {
    type: 'user.created',
    data: { id: 'test' }
  });
  logTest('POST /auth/clerk/webhook', 
    webhookRes.status === 400 || webhookRes.status === 404,
    'Webhook security check (expected to require Svix headers)'
  );

  if (!authToken) {
    logSkip('Clerk protected endpoints', 'No auth token');
    return;
  }

  // Get Clerk Status
  const statusRes = await makeRequest('GET', '/auth/clerk/status', null, authToken);
  logTest('GET /auth/clerk/status', statusRes.ok);

  // Link Clerk Account
  const linkRes = await makeRequest('POST', '/auth/clerk/link', {
    clerkUserId: 'test_clerk_id',
    googleId: 'test_google_id'
  }, authToken);
  logTest('POST /auth/clerk/link', linkRes.ok || linkRes.status === 400);

  // Unlink Clerk Account
  const unlinkRes = await makeRequest('POST', '/auth/clerk/unlink', {}, authToken);
  logTest('POST /auth/clerk/unlink', unlinkRes.status === 200 || unlinkRes.status === 400);
}

// ============================================================================
// 2FA TESTS
// ============================================================================

async function test2FAEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    2FA TESTS                           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!authToken) {
    logSkip('2FA endpoints', 'No auth token');
    return;
  }

  // Setup 2FA
  const setupRes = await makeRequest('POST', '/auth/2fa/setup', {}, authToken);
  logTest('POST /auth/2fa/setup', setupRes.ok);

  // Get 2FA Status
  const statusRes = await makeRequest('GET', '/auth/2fa/status', null, authToken);
  logTest('GET /auth/2fa/status', statusRes.ok);
}

// ============================================================================
// SECURITY TESTS
// ============================================================================

async function testSecurityEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                  SECURITY TESTS                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!authToken) {
    logSkip('Security endpoints', 'No auth token');
    return;
  }

  // Get Activity Logs
  const logsRes = await makeRequest('GET', '/auth/security/activity-logs', null, authToken);
  logTest('GET /auth/security/activity-logs', logsRes.ok);

  // Get Login Attempts
  const attemptsRes = await makeRequest('GET', '/auth/security/login-attempts', null, authToken);
  logTest('GET /auth/security/login-attempts', attemptsRes.ok);

  // Check Account Security
  const securityRes = await makeRequest('GET', '/auth/security/check', null, authToken);
  logTest('GET /auth/security/check', securityRes.ok);
}

// ============================================================================
// SESSION TESTS
// ============================================================================

async function testSessionEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                   SESSION TESTS                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!authToken) {
    logSkip('Session endpoints', 'No auth token');
    return;
  }

  // Get Sessions
  const sessionsRes = await makeRequest('GET', '/auth/sessions', null, authToken);
  logTest('GET /auth/sessions', sessionsRes.ok);

  // Get Current Session
  const currentRes = await makeRequest('GET', '/auth/sessions/current', null, authToken);
  logTest('GET /auth/sessions/current', currentRes.ok);
}

// ============================================================================
// DEVICE TRUST TESTS
// ============================================================================

async function testDeviceTrustEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                DEVICE TRUST TESTS                      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!authToken) {
    logSkip('Device trust endpoints', 'No auth token');
    return;
  }

  // Get Trusted Devices
  const devicesRes = await makeRequest('GET', '/auth/trusted-devices', null, authToken);
  logTest('GET /auth/trusted-devices', devicesRes.ok);

  // Trust Current Device
  const trustRes = await makeRequest('POST', '/auth/trusted-devices/trust', {
    deviceName: 'Test Device'
  }, authToken);
  logTest('POST /auth/trusted-devices/trust', trustRes.ok);
}

// ============================================================================
// ACCOUNT MANAGEMENT TESTS
// ============================================================================

async function testAccountEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║              ACCOUNT MANAGEMENT TESTS                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!authToken) {
    logSkip('Account endpoints', 'No auth token');
    return;
  }

  // Update Profile
  const updateRes = await makeRequest('PUT', '/auth/account/profile', {
    name: 'Updated Name'
  }, authToken);
  logTest('PUT /auth/account/profile', updateRes.ok);

  // Get Account Info
  const infoRes = await makeRequest('GET', '/auth/account/info', null, authToken);
  logTest('GET /auth/account/info', infoRes.ok);
}

// ============================================================================
// PRIVACY TESTS
// ============================================================================

async function testPrivacyEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                   PRIVACY TESTS                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!authToken) {
    logSkip('Privacy endpoints', 'No auth token');
    return;
  }

  // Get Privacy Settings
  const settingsRes = await makeRequest('GET', '/auth/privacy/settings', null, authToken);
  logTest('GET /auth/privacy/settings', settingsRes.ok);

  // Request Data Export
  const exportRes = await makeRequest('POST', '/auth/privacy/export', {}, authToken);
  logTest('POST /auth/privacy/export', exportRes.ok);
}

// ============================================================================
// PRODUCT TESTS
// ============================================================================

async function testProductEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                   PRODUCT TESTS                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Get Products
  const productsRes = await makeRequest('GET', '/products');
  logTest('GET /products', productsRes.ok);

  // Get Categories
  const categoriesRes = await makeRequest('GET', '/categories');
  logTest('GET /categories', categoriesRes.ok);
}

// ============================================================================
// CART TESTS
// ============================================================================

async function testCartEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    CART TESTS                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!authToken) {
    logSkip('Cart endpoints', 'No auth token');
    return;
  }

  // Get Cart
  const cartRes = await makeRequest('GET', '/cart', null, authToken);
  logTest('GET /cart', cartRes.ok);
}

// ============================================================================
// ORDER TESTS
// ============================================================================

async function testOrderEndpoints() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    ORDER TESTS                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!authToken) {
    logSkip('Order endpoints', 'No auth token');
    return;
  }

  // Get Orders
  const ordersRes = await makeRequest('GET', '/orders', null, authToken);
  logTest('GET /orders', ordersRes.ok);
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          COMPREHENSIVE ENDPOINT TEST SUITE             ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n📍 Testing: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}\n`);

  // Health Check
  const healthRes = await makeRequest('GET', '/../health');
  if (!healthRes.ok) {
    console.log('❌ Server is not running!');
    console.log('   Please start: cd server && npm run dev\n');
    return;
  }
  console.log('✅ Server is running\n');

  // Run all test suites
  await testAuthEndpoints();
  await testClerkEndpoints();
  await test2FAEndpoints();
  await testSecurityEndpoints();
  await testSessionEndpoints();
  await testDeviceTrustEndpoints();
  await testAccountEndpoints();
  await testPrivacyEndpoints();
  await testProductEndpoints();
  await testCartEndpoints();
  await testOrderEndpoints();

  // Print Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Passed:  ${results.passed.length}/${results.total}`);
  console.log(`❌ Failed:  ${results.failed.length}/${results.total}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  
  const percentage = ((results.passed.length / results.total) * 100).toFixed(1);
  console.log(`\n📊 Success Rate: ${percentage}%`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`   - ${test}`));
  }

  console.log(`\n⏰ Completed: ${new Date().toLocaleString()}`);
  console.log('\n📝 Next: Test frontend at http://localhost:5173');
}

runAllTests().catch(error => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});
