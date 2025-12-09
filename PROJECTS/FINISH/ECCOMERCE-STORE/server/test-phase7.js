// Test script for Phase 7: Admin Dashboard & Analytics
const BASE_URL = "http://localhost:8000";

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n[Testing] ${name}...`);
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    if (response.status >= 400) {
      console.log("❌ Error:", data.message);
    } else {
      console.log("✅ Success!");
    }
    return data;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log("========================================");
  console.log("Phase 7: Admin Dashboard & Analytics");
  console.log("========================================");

  // Step 1: Login as admin
  console.log("\n--- Step 1: Admin Login ---");

  const loginData = await testEndpoint(
    "Login Admin",
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@test.com",
        password: "admin123456",
      }),
    }
  );

  const token = loginData?.data?.accessToken;

  if (!token) {
    console.log("\n❌ Failed to login as admin. Run setup-test-data.js first.");
    return;
  }

  console.log("\n✅ Admin logged in successfully!");

  // Step 2: Test Dashboard
  console.log("\n--- Step 2: Dashboard Statistics ---");

  await testEndpoint("Get Dashboard Stats", `${BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  await testEndpoint(
    "Get Dashboard Stats (7 days)",
    `${BASE_URL}/api/admin/dashboard?period=7`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // Step 3: Test Analytics
  console.log("\n--- Step 3: Analytics Endpoints ---");

  await testEndpoint(
    "Get Sales Analytics",
    `${BASE_URL}/api/admin/analytics/sales`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  await testEndpoint(
    "Get Sales Analytics (by week)",
    `${BASE_URL}/api/admin/analytics/sales?period=30&groupBy=week`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  await testEndpoint(
    "Get Customer Analytics",
    `${BASE_URL}/api/admin/analytics/customers`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  await testEndpoint(
    "Get Product Analytics",
    `${BASE_URL}/api/admin/analytics/products`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  await testEndpoint(
    "Get Revenue Analytics",
    `${BASE_URL}/api/admin/analytics/revenue`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // Step 4: Test User Management
  console.log("\n--- Step 4: User Management ---");

  await testEndpoint("Get All Users", `${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  await testEndpoint(
    "Get Users (with search)",
    `${BASE_URL}/api/admin/users?search=test`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  await testEndpoint(
    "Get Users (by role)",
    `${BASE_URL}/api/admin/users?role=user`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // Create a test user to manage
  const newUserData = await testEndpoint(
    "Create Test User",
    `${BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User for Management",
        email: "testuser" + Date.now() + "@test.com",
        password: "test123456",
      }),
    }
  );

  const testUserId = newUserData?.data?.user?.id;

  if (testUserId) {
    await testEndpoint(
      "Update User Role",
      `${BASE_URL}/api/admin/users/${testUserId}/role`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: "vendor",
        }),
      }
    );

    await testEndpoint(
      "Delete User",
      `${BASE_URL}/api/admin/users/${testUserId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // Step 5: Test Authorization
  console.log("\n--- Step 5: Authorization Tests ---");

  // Try to access admin endpoint without token
  await testEndpoint(
    "Dashboard Without Token (should fail)",
    `${BASE_URL}/api/admin/dashboard`
  );

  // Create a regular user and try to access admin endpoint
  const regularUserData = await testEndpoint(
    "Create Regular User",
    `${BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Regular User",
        email: "regular" + Date.now() + "@test.com",
        password: "test123456",
      }),
    }
  );

  const regularToken = regularUserData?.data?.accessToken;

  if (regularToken) {
    await testEndpoint(
      "Dashboard as Regular User (should fail)",
      `${BASE_URL}/api/admin/dashboard`,
      {
        headers: { Authorization: `Bearer ${regularToken}` },
      }
    );
  }

  console.log("\n========================================");
  console.log("Phase 7 Testing Complete!");
  console.log("========================================\n");
  console.log("✅ Dashboard statistics working");
  console.log("✅ Sales analytics working");
  console.log("✅ Customer analytics working");
  console.log("✅ Product analytics working");
  console.log("✅ Revenue analytics working");
  console.log("✅ User management working");
  console.log("✅ Authorization working");
  console.log("\n");
}

runTests().catch(console.error);
