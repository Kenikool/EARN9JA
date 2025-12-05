import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/analytics/worker
 * @desc    Get worker analytics
 * @access  Private (Worker)
 * @query   period (day|week|month|year)
 */
router.get(
  "/worker",
  requireRole("worker"),
  AnalyticsController.getWorkerAnalytics
);

/**
 * @route   GET /api/v1/analytics/sponsor/overview
 * @desc    Get sponsor overview analytics
 * @access  Private (Sponsor)
 * @query   period (day|week|month|year)
 */
router.get(
  "/sponsor/overview",
  requireRole("sponsor"),
  AnalyticsController.getSponsorOverview
);

/**
 * @route   GET /api/v1/analytics/sponsor/campaign/:campaignId
 * @desc    Get campaign-specific analytics
 * @access  Private (Sponsor - campaign owner)
 */
router.get(
  "/sponsor/campaign/:campaignId",
  requireRole("sponsor"),
  AnalyticsController.getCampaignAnalytics
);

/**
 * @route   GET /api/v1/analytics/platform
 * @desc    Get platform-wide analytics
 * @access  Private (Admin)
 * @query   period (day|week|month|year)
 */
router.get(
  "/platform",
  requireRole("admin"),
  AnalyticsController.getPlatformAnalytics
);

/**
 * @route   GET /api/v1/analytics/realtime
 * @desc    Get real-time metrics
 * @access  Private (Admin)
 */
router.get(
  "/realtime",
  requireRole("admin"),
  AnalyticsController.getRealtimeMetrics
);

export default router;
