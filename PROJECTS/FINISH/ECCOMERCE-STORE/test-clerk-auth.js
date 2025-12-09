/**
 * Comprehensive Authentication System Test
 * Tests all auth endpoints including Clerk integration
 */

const BASE_URL = 'http://localhost:8000/api';

// Test data
let testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Test@123456',
};

let authToken = '';
let userId = '';
let twoFactorSecret = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  logSection('TEST 1: Health Check');
  const response = await fetch('http://localhost:8000/health');
  const data = await response.json();
  
  if (response.status === 200) {
    log('✓ Server is running', 'green');
    console.log(data);
  } else {
    log('✗ Server health check failed', 'red');
  }
}

// Test 2: User Registration
async function testRegistration() {
  logSection('TEST 2: User Registration');
  const result = await makeRequest('/auth/register', 'POST', testUser);
  
  if (result.status === 201) {
    log('✓ User registered successfully', 'green');
    authToken = result.data.token;
    userId = result.data.data.user.id;
    console.log('User ID:', userId);
    console.log('Token received:', authToken ? 'Yes' : 'No');
  } else {
    log('✗ Registration failed', 'red');
    console.log(result.data);
  }
}

// Test 3: User Login
async function testLogin() {
  logSection('TEST 3: User Login');
  const result = await makeRequest('/auth/login', 'POST', {
    email: testUser.email,
    password: testUser.password,
  });
  
  if (result.status === 200) {
    log('✓ Login successful', 'green');
    authToken = result.data.token;
    console.log('New token received');
  } else {
    log('✗ Login failed', 'red');
    console.log(result.data);
  }
}

// Test 4: Get Current User Profile
async function testGetProfile() {
  logSection('TEST 4: Get User Profile');
  const result = await makeRequest('/auth/me', 'GET', null, authToken);
  
  if (result.status === 200) {
    log('✓ Profile retrieved successfully', 'green');
    console.log('User:', result.data.data.user.name);
    console.log('Email:', result.data.data.user.email);
  } else {
    log('✗ Failed to get profile', 'red');
    console.log(result.data);
  }
}

// Test 5: Update Profile
async function testUpdateProfile() {
  logSection('TEST 5: Update Profile');
  const result = await makeRequest('/auth/update-profile', 'PUT', {
    name: 'Updated Test User',
  }, authToken);
  
  if (result.status === 200) {
    log('✓ Profile updated successfully', 'green');
    console.log('New name:', result.data.data.user.name);
  } else {
    log('✗ Failed to update profile', 'red');
    console.log(result.data);
  }
}

// Test 6: Get Activity Logs
async function testActivityLogs() {
  logSection('TEST 6: Get Activity Logs');
  const result = await makeRequest('/auth/security/activity', 'GET', null, authToken);
  
  if (result.status === 200) {
    log('✓ Activity logs retrieved', 'green');
    console.log('Total activities:', result.data.data.activities.length);
  } else {
    log('✗ Failed to get activity logs', 'red');
    console.log(result.data);
  }
}

// Test 7: Get Active Sessions
async function testGetSessions() {
  logSection('TEST 7: Get Active Sessions');
  const result = await makeRequest('/auth/sessions', 'GET', null, authToken);
  
  if (result.status === 200) {
    log('✓ Sessions retrieved', 'green');
    console.log('Active sessions:', result.data.data.sessions.length);
  } else {
    log('✗ Failed to get sessions', 'red');
    console.log(result.data);
  }
}

// Test 8: Setup 2FA
async function testSetup2FA() {
  logSection('TEST 8: Setup Two-Factor Authentication');
  const result = await makeRequest('/auth/2fa/setup', 'POST', {}, authToken);
  
  if (result.status === 200) {
    log('✓ 2FA setup initiated', 'green');
    twoFactorSecret = result.data.data.secret;
    console.log('Secret received:', twoFactorSecret ? 'Yes' : 'No');
    console.log('QR Code URL available:', result.data.data.qrCode ? 'Yes' : 'No');
  } else {
    log('✗ Failed to setup 2FA', 'red');
    console.log(result.data);
  }
}

// Test 9: Get Trusted Devices
async function testGetTrustedDevices() {
  logSection('TEST 9: Get Trusted Devices');
  const result = await makeRequest('/auth/trusted-devices', 'GET', null, authToken);
  
  if (result.status === 200) {
    log('✓ Trusted devices retrieved', 'green');
    console.log('Trusted devices:', result.data.data.devices.length);
  } else {
    log('✗ Failed to get trusted devices', 'red');
    console.log(result.data);
  }
}

// Test 10: Clerk Status
async function testClerkStatus() {
  logSection('TEST 10: Clerk Integration Status');
  const result = await makeRequest('/auth/clerk/status', 'GET', null, authToken);
  
  if (result.status === 200) {
    log('✓ Clerk status retrieved', 'green');
    console.log('Clerk linked:', result.data.data.isLinked);
    console.log('Auth provider:', result.data.data.authProvider);
  } else {
    log('✗ Failed to get Clerk status', 'red');
    console.log(result.data);
  }
}

// Test 11: Password Change
async function testPasswordChange() {
  logSection('TEST 11: Change Password');
  const newPassword = 'NewTest@123456';
  const result = await makeRequest('/auth/change-password', 'PUT', {
    currentPassword: testUser.password,
    newPassword: newPassword,
  }, authToken);
  
  if (result.status === 200) {
    log('✓ Password changed successfully', 'green');
    testUser.password = newPassword; // Update for future tests
  } else {
    log('✗ Failed to change password', 'red');
    console.log(result.data);
  }
}

// Test 12: Account Security Settings
async function testSecuritySettings() {
  logSection('TEST 12: Get Security Settings');
  const result = await makeRequest('/auth/security/settings', 'GET', null, authToken);
  
  if (result.status === 200) {
    log('✓ Security settings retrieved', 'green');
    console.log('2FA enabled:', result.data.data.twoFactorEnabled);
    console.log('Email verified:', result.data.data.isEmailVerified);
  } else {
    log('✗ Failed to get security settings', 'red');
    console.log(result.data);
  }
}

// Test 13: Forgot Password Request
async function testForgotPassword() {
  logSection('TEST 13: Forgot Password Request');
  const result = await makeRequest('/auth/forgot-password', 'POST', {
    email: testUser.email,
  });
  
  if (result.status === 200) {
    log('✓ Password reset email sent', 'green');
    console.log('Message:', result.data.message);
  } else {
    log('✗ Failed to send reset email', 'red');
    console.log(result.data);
  }
}

// Test 14: Privacy Settings
async function testPrivacySettings() {
  logSection('TEST 14: Get Privacy Settings');
  const result = await makeRequest('/auth/privacy/settings', 'GET', null, authToken);
  
  if (result.status === 200) {
    log('✓ Privacy settings retrieved', 'green');
    console.log('Data sharing:', result.data.data.dataSharing);
  } else {
    log('✗ Failed to get privacy settings', 'red');
    console.log(result.data);
  }
}

// Test 15: Account Deletion Request
async function testAccountDeletionRequest() {
  logSection('TEST 15: Request Account Deletion');
  const result = await makeRequest('/auth/account/delete', 'POST', {
    password: testUser.password,
    reason: 'Testing account deletion flow',
  }, authToken);
  
  if (result.status === 200) {
    log('✓ Account deletion requested', 'green');
    console.log('Deletion scheduled for:', result.data.data.scheduledDeletion);
  } else {
    log('✗ Failed to request deletion', 'red');
    console.log(result.data);
  }
}

// Test 16: Cancel Account Deletion
async function testCancelDeletion() {
  logSection('TEST 16: Cancel Account Deletion');
  const result = await makeRequest('/auth/account/cancel-deletion', 'POST', {}, authToken);
  
  if (result.status === 200) {
    log('✓ Account deletion cancelled', 'green');
  } else {
    log('✗ Failed to cancel deletion', 'red');
    console.log(result.data);
  }
}

// Test 17: Logout
async function testLogout() {
  logSection('TEST 17: Logout');
  const result = await makeRequest('/auth/logout', 'POST', {}, authToken);
  
  if (result.status === 200) {
    log('✓ Logout successful', 'green');
  } else {
    log('✗ Logout failed', 'red');
    console.log(result.data);
  }
}

// Run all tests
async function runAllTests() {
  log('\n🚀 Starting Comprehensive Authentication System Tests\n', 'blue');
  log('Testing against: ' + BASE_URL, 'yellow');
  
  try {
    await testHealthCheck();
    await testRegistration();
    await testLogin();
    await testGetProfile();
    await testUpdateProfile();
    await testActivityLogs();
    await testGetSessions();
    await testSetup2FA();
    await testGetTrustedDevices();
    await testClerkStatus();
    await testPasswordChange();
    await testSecuritySettings();
    await testForgotPassword();
    await testPrivacySettings();
    await testAccountDeletionRequest();
    await testCancelDeletion();
    await testLogout();
    
    logSection('TEST SUMMARY');
    log('✓ All tests completed!', 'green');
    log('\nTest user credentials:', 'yellow');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    
  } catch (error) {
    log('\n✗ Test suite failed with error:', 'red');
    console.error(error);
  }
}

// Run tests
runAllTests();
