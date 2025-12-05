import { Router } from "express";
import { offerWallAnalyticsController } from "../controllers/offerwall-analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/revenue-report", offerWallAnalyticsController.getRevenueReport);
router.get("/compare-providers", offerWallAnalyticsController.compareProviders);
router.get(
  "/provider/:providerId",
  offerWallAnalyticsController.getProviderAnalytics
);

export default router;
