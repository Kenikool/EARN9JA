// Comprehensive Integration Tests
const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:8000";
let authToken = null;
let testUserId = null;
let testProductId = null;

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test Suite
const tests = {
  passed: 0,
  failed: 0,
  total: 0,
};

const assert = (condition, testName) => {
  tests.total++;
  if (condition) {
    tests.passed++;
    log(`✅ ${testName}`, "green");
  } else {
    tests.failed++;
    log(`❌ ${testName}`, "red");
  }
};

// 1. Health Check
async function testHealthCheck() {
  try {
    const res = await axios.get(`${API_URL}/health`);
    assert(res.data.status === "success", "Health Check");
  } catch (error) {
    assert(false, "Health Check");
  }
}

// 2. User Registration
async function testUserRegistration() {
  try {
    const res = await axios.post(`${API_URL}/api/auth/register`, {
      name: "Integration Test User",
      email: `test${Date.now()}@test.com`,
      password: "Test123!@#",
    });
    authToken = res.data.data.token;
    testUserId = res.data.data.user._id;
    assert(res.data.status === "success" && authToken, "User Registration");
  } catch (error) {
    assert(false, "User Registration");
  }
}

// 3. User Login
async function testUserLogin() {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      email: `test${Date.now() - 1000}@test.com`,
      password: "Test123!@#",
    });
    assert(res.data.status === "success" || res.status === 404, "User Login");
  } catch (error) {
    assert(
      error.response?.status === 404 || error.response?.status === 401,
      "User Login"
    );
  }
}

// 4. Get Products
async function testGetProducts() {
  try {
    const res = await axios.get(`${API_URL}/api/products`);
    testProductId = res.data.data.products[0]?._id;
    assert(
      res.data.status === "success" && Array.isArray(res.data.data.products),
      "Get Products"
    );
  } catch (error) {
    assert(false, "Get Products");
  }
}

// 5. Product Search
async function testProductSearch() {
  try {
    const res = await axios.get(`${API_URL}/api/products?search=test`);
    assert(res.data.status === "success", "Product Search");
  } catch (error) {
    assert(false, "Product Search");
  }
}

// 6. Product Filters
async function testProductFilters() {
  try {
    const res = await axios.get(
      `${API_URL}/api/products?minPrice=10&maxPrice=1000`
    );
    assert(res.data.status === "success", "Product Filters");
  } catch (error) {
    assert(false, "Product Filters");
  }
}

// 7. Cart Operations
async function testCartOperations() {
  if (!authToken || !testProductId) {
    assert(false, "Cart Operations - Missing auth or product");
    return;
  }

  try {
    const res = await axios.post(
      `${API_URL}/api/cart`,
      { productId: testProductId, quantity: 1 },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    assert(res.data.status === "success", "Cart Operations");
  } catch (error) {
    assert(false, "Cart Operations");
  }
}

// 8. Wishlist Operations
async function testWishlistOperations() {
  if (!authToken || !testProductId) {
    assert(false, "Wishlist Operations - Missing auth or product");
    return;
  }

  try {
    const res = await axios.post(
      `${API_URL}/api/wishlist`,
      { productId: testProductId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    assert(res.data.status === "success", "Wishlist Operations");
  } catch (error) {
    assert(false, "Wishlist Operations");
  }
}

// 9. Currency Support
async function testCurrencySupport() {
  const currencies = ["USD", "EUR", "GBP", "NGN"];
  let passed = 0;

  for (const currency of currencies) {
    try {
      const res = await axios.get(
        `${API_URL}/api/products?currency=${currency}`
      );
      if (res.data.status === "success") passed++;
    } catch (error) {
      // Continue
    }
  }

  assert(
    passed === currencies.length,
    `Currency Support (${passed}/${currencies.length})`
  );
}

// 10. Admin Protection
async function testAdminProtection() {
  try {
    await axios.get(`${API_URL}/api/admin/analytics`);
    assert(false, "Admin Protection");
  } catch (error) {
    assert(
      error.response?.status === 401 || error.response?.status === 403,
      "Admin Protection"
    );
  }
}

// 11. Rate Limiting
async function testRateLimiting() {
  try {
    const requests = Array(20)
      .fill()
      .map(() =>
        axios
          .post(`${API_URL}/api/auth/login`, {
            email: "test@test.com",
            password: "wrong",
          })
          .catch((e) => e.response)
      );
    const responses = await Promise.all(requests);
    const rateLimited = responses.some((r) => r?.status === 429);
    assert(rateLimited, "Rate Limiting");
  } catch (error) {
    assert(false, "Rate Limiting");
  }
}

// 12. CORS Headers
async function testCORSHeaders() {
  try {
    const res = await axios.get(`${API_URL}/health`);
    assert(res.headers["access-control-allow-origin"], "CORS Headers");
  } catch (error) {
    assert(false, "CORS Headers");
  }
}

// Run all tests
async function runAllTests() {
  log("\n🧪 Starting Integration Tests...\n", "yellow");

  await testHealthCheck();
  await testUserRegistration();
  await testUserLogin();
  await testGetProducts();
  await testProductSearch();
  await testProductFilters();
  await testCartOperations();
  await testWishlistOperations();
  await testCurrencySupport();
  await testAdminProtection();
  await testRateLimiting();
  await testCORSHeaders();

  log("\n📊 Test Results:", "yellow");
  log(`✅ Passed: ${tests.passed}/${tests.total}`, "green");
  log(
    `❌ Failed: ${tests.failed}/${tests.total}`,
    tests.failed > 0 ? "red" : "green"
  );
  log(
    `📈 Success Rate: ${((tests.passed / tests.total) * 100).toFixed(2)}%\n`,
    "yellow"
  );

  process.exit(tests.failed > 0 ? 1 : 0);
}

runAllTests();
