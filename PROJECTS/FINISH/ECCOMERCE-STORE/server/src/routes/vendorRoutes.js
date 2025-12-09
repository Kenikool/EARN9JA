import express from "express";
import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getVendorOrders,
  getVendorProducts,
  getVendorPayouts,
  requestPayout,
  getVendorReviews,
} from "../controllers/vendorController.js";
import {
  getAllVendors,
  approveVendor,
  suspendVendor,
  updateCommission,
  processPayouts,
  getAllPayouts,
} from "../controllers/adminVendorController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Vendor routes
router.post("/register", protect, registerVendor);
router.get("/profile", protect, getVendorProfile);
router.put("/profile", protect, updateVendorProfile);
router.get("/dashboard", protect, getVendorDashboard);
router.get("/orders", protect, getVendorOrders);
router.get("/products", protect, getVendorProducts);
router.get("/payouts", protect, getVendorPayouts);
router.post("/payout/request", protect, requestPayout);
router.get("/reviews", protect, getVendorReviews);

// Admin vendor management routes
router.get("/admin/all", protect, admin, getAllVendors);
router.put("/admin/:id/approve", protect, admin, approveVendor);
router.put("/admin/:id/suspend", protect, admin, suspendVendor);
router.put("/admin/:id/commission", protect, admin, updateCommission);
router.get("/admin/payouts", protect, admin, getAllPayouts);
router.post("/admin/payouts/process", protect, admin, processPayouts);

export default router;
