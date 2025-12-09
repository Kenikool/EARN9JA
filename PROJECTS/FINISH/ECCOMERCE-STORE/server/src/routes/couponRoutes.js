import express from "express";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
  sendCouponEmail,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveCoupons);
router.post("/validate", protect, validateCoupon);

// Admin routes
router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);
router.post("/:id/send-email", protect, admin, sendCouponEmail);

export default router;
