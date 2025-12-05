import { Router } from "express";
import { adminAnalyticsController } from "../controllers/adminAnalytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { analyticsQuerySchema } from "../validators/adminAnalytics.validator.js";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);

/**
 * @route   GET /api/v1/admin/analytics/admob
 * @desc    Get AdMob performance analytics
 * @access  Private (Admin only)
 * @query   startDate, endDate, platform, groupBy
 */
router.get(
  "/admob",
  validateRequest(analyticsQuerySchema),
  adminAnalyticsController.getAdMobAnalytics
);

/**
 * @route   GET /api/v1/admin/analytics/admob/export
 * @desc    Export AdMob analytics as CSV
 * @access  Private (Admin only)
 * @query   startDate, endDate, platform, groupBy
 */
router.get(
  "/admob/export",
  validateRequest(analyticsQuerySchema),
  adminAnalyticsController.exportAnalytics
);

export default router;
