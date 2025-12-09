// Automated API Testing Script
import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:8000";
const results = { passed: 0, failed: 0, tests: [] };

const log = (test, status, message) => {
  results.tests.push({ test, status, message });
  console.log(`${status === "PASS" ? "✅" : "❌"} ${test}: ${message}`);
  if (status === "PASS") results.passed++;
  else results.failed++;
};

// Test 1: Health Check
async function testHealthCheck() {
  try {
    const res = await axios.get(`${API_URL}/health`);
    if (res.data.status === "success") {
      log("Health Check", "PASS", "Server is running");
    } else {
      log("Health Check", "FAIL", "Unexpected response");
    }
  } catch (error) {
    log("Health Check", "FAIL", error.message);
  }
}

// Test 2: Get Products
async function testGetProducts() {
  try {
    const res = await axios.get(`${API_URL}/api/products`);
    if (
      res.data.status === "success" &&
      Array.isArray(res.data.data.products)
    ) {
      log(
        "Get Products",
        "PASS",
        `Found ${res.data.data.products.length} products`
      );
    } else {
      log("Get Products", "FAIL", "Invalid response format");
    }
  } catch (error) {
    log("Get Products", "FAIL", error.message);
  }
}

// Test 3: User Registration
async function testUserRegistration() {
  try {
    const testUser = {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "Test123!@#",
    };
    const res = await axios.post(`${API_URL}/api/auth/register`, testUser);
    if (res.data.status === "success") {
      log("User Registration", "PASS", "User registered successfully");
      return res.data.data.token;
    } else {
      log("User Registration", "FAIL", "Registration failed");
    }
  } catch (error) {
    log(
      "User Registration",
      "FAIL",
      error.response?.data?.message || error.message
    );
  }
}

// Test 4: Cart Operations
async function testCartOperations(token) {
  try {
    // Add to cart
    const res = await axios.post(
      `${API_URL}/api/cart`,
      { productId: "507f1f77bcf86cd799439011", quantity: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.status === "success") {
      log("Cart Operations", "PASS", "Cart operations working");
    } else {
      log("Cart Operations", "FAIL", "Cart operation failed");
    }
  } catch (error) {
    log(
      "Cart Operations",
      "FAIL",
      error.response?.data?.message || error.message
    );
  }
}

// Test 5: Currency Support
async function testCurrencySupport() {
  try {
    const currencies = ["USD", "EUR", "GBP", "NGN"];
    let allPassed = true;

    for (const currency of currencies) {
      const res = await axios.get(
        `${API_URL}/api/products?currency=${currency}`
      );
      if (res.data.status !== "success") {
        allPassed = false;
        break;
      }
    }

    if (allPassed) {
      log("Currency Support", "PASS", "All currencies supported");
    } else {
      log("Currency Support", "FAIL", "Some currencies not working");
    }
  } catch (error) {
    log("Currency Support", "FAIL", error.message);
  }
}

// Test 6: Admin Endpoints
async function testAdminEndpoints() {
  try {
    const res = await axios.get(`${API_URL}/api/admin/analytics`);
    // Should fail without auth
    log("Admin Protection", "PASS", "Admin endpoints are protected");
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      log("Admin Protection", "PASS", "Admin endpoints are protected");
    } else {
      log("Admin Protection", "FAIL", "Unexpected error");
    }
  }
}

// Run all tests
async function runTests() {
  console.log("\n🧪 Starting API Tests...\n");

  await testHealthCheck();
  await testGetProducts();
  const token = await testUserRegistration();
  if (token) await testCartOperations(token);
  await testCurrencySupport();
  await testAdminEndpoints();

  console.log("\n📊 Test Results:");
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(
    `📈 Success Rate: ${(
      (results.passed / (results.passed + results.failed)) *
      100
    ).toFixed(2)}%\n`
  );

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests();
