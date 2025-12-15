/**
 * Test Admin Panel Endpoints
 *
 * This script tests all admin panel endpoints to identify which ones are working
 */

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:6000/api/v1";

// You need to replace this with a valid admin token
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "YOUR_ADMIN_TOKEN_HERE";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  },
});

const endpoints = [
  // Platform Settings
  { method: "GET", url: "/admin/settings", name: "Get Platform Settings" },

  // Users
  { method: "GET", url: "/admin/users", name: "Get All Users" },

  // Tasks
  { method: "GET", url: "/admin/tasks", name: "Get All Tasks" },
  { method: "GET", url: "/admin/tasks/pending", name: "Get Pending Tasks" },

  // Withdrawals
  {
    method: "GET",
    url: "/admin/withdrawals/pending",
    name: "Get Pending Withdrawals",
  },

  // Disputes
  {
    method: "GET",
    url: "/admin/disputes/pending",
    name: "Get Pending Disputes",
  },

  // Stats
  { method: "GET", url: "/admin/stats", name: "Get Platform Stats" },
  { method: "GET", url: "/admin/revenue-report", name: "Get Revenue Report" },

  // Messages
  { method: "GET", url: "/admin/messages", name: "Get Bulk Messages" },
  { method: "GET", url: "/admin/templates", name: "Get Message Templates" },

  // Versions
  { method: "GET", url: "/admin/versions", name: "Get App Versions" },
  {
    method: "GET",
    url: "/admin/versions/analytics",
    name: "Get Version Analytics",
  },
];

async function testEndpoints() {
  console.log("🧪 Testing Admin Panel Endpoints...\n");
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Using Token: ${ADMIN_TOKEN.substring(0, 20)}...\n`);

  const results = {
    working: [],
    failing: [],
  };

  for (const endpoint of endpoints) {
    try {
      const response = await api.request({
        method: endpoint.method,
        url: endpoint.url,
      });

      console.log(`✅ ${endpoint.name}`);
      console.log(`   ${endpoint.method} ${endpoint.url}`);
      console.log(`   Status: ${response.status}`);
      console.log(
        `   Data: ${JSON.stringify(response.data).substring(0, 100)}...\n`
      );

      results.working.push(endpoint.name);
    } catch (error) {
      console.log(`❌ ${endpoint.name}`);
      console.log(`   ${endpoint.method} ${endpoint.url}`);
      console.log(`   Error: ${error.response?.status || error.message}`);
      console.log(
        `   Message: ${error.response?.data?.message || error.message}\n`
      );

      results.failing.push({
        name: endpoint.name,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      });
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Working: ${results.working.length}/${endpoints.length}`);
  console.log(`❌ Failing: ${results.failing.length}/${endpoints.length}\n`);

  if (results.failing.length > 0) {
    console.log("Failed Endpoints:");
    results.failing.forEach((fail) => {
      console.log(`  - ${fail.name}: ${fail.error} (${fail.status})`);
    });
  }
}

testEndpoints().catch(console.error);
