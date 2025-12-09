import express from "express";
import {
  getDashboardStats,
  getSalesAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getRevenueAnalytics,
  getComprehensiveAnalytics,
  getUsers,
  updateUserRole,
  deleteUser,
  getIPWhitelist,
  addIPToWhitelist,
  removeIPFromWhitelist,
  updateIPWhitelist,
  getRateLimitViolations,
  getRateLimitAnalytics,
  getRateLimitViolationById,
  resolveRateLimitViolation,
  bulkResolveViolations,
  cleanupResolvedViolations,
  getRateLimitDashboard,
  getSettings,
  updateSettings,
} from "../controllers/adminController.js";
import {
  getShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} from "../controllers/shippingController.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/adminNotificationController.js";
import { globalSearch } from "../controllers/adminSearchController.js";
import {
  getFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
} from "../controllers/adminFlashSalesController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Analytics
router.get("/analytics", getComprehensiveAnalytics);
router.get("/analytics/sales", getSalesAnalytics);
router.get("/analytics/customers", getCustomerAnalytics);
router.get("/analytics/products", getProductAnalytics);
router.get("/analytics/revenue", getRevenueAnalytics);

// User Management
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// IP Whitelist Management
router.get("/ip-whitelist", getIPWhitelist);
router.post("/ip-whitelist", addIPToWhitelist);
router.put("/ip-whitelist/:id", updateIPWhitelist);
router.delete("/ip-whitelist/:id", removeIPFromWhitelist);

// Rate Limit Monitoring
router.get("/rate-limit-dashboard", getRateLimitDashboard);
router.get("/rate-limit-violations", getRateLimitViolations);
router.get("/rate-limit-analytics", getRateLimitAnalytics);
router.get("/rate-limit-violations/:id", getRateLimitViolationById);
router.put("/rate-limit-violations/:id/resolve", resolveRateLimitViolation);
router.put("/rate-limit-violations/bulk-resolve", bulkResolveViolations);
router.delete("/rate-limit-violations/cleanup", cleanupResolvedViolations);

// Shipping Management
router.get("/shipping", getShippingMethods);
router.get("/shipping/:id", getShippingMethodById);
router.post("/shipping", createShippingMethod);
router.put("/shipping/:id", updateShippingMethod);
router.delete("/shipping/:id", deleteShippingMethod);

// Settings Management
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Notifications
router.get("/notifications", getNotifications);
router.patch("/notifications/:notificationId/read", markAsRead);
router.patch("/notifications/read-all", markAllAsRead);
router.delete("/notifications/:notificationId", deleteNotification);

// Search
router.get("/search", globalSearch);

// Flash Sales Management
router.get("/flash-sales", getFlashSales);
router.post("/flash-sales", createFlashSale);
router.put("/flash-sales/:id", updateFlashSale);
router.delete("/flash-sales/:id", deleteFlashSale);

export default router;
