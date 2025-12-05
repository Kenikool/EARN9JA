import { Router } from "express";
import { offerWallController } from "../controllers/offerwall.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Public endpoints (for mobile app)
router.get("/cpagrip/url", offerWallController.getCPAGripUrl);
router.get("/ogads/url", offerWallController.getOGAdsUrl);
router.get("/", offerWallController.getAvailableOfferWalls);

// Admin endpoints (require authentication)
router.post(
  "/cpagrip/configure",
  authenticate,
  // Add admin check middleware here
  offerWallController.configureCPAGrip
);

router.post(
  "/ogads/configure",
  authenticate,
  // Add admin check middleware here
  offerWallController.configureOGAds
);

router.get(
  "/postback-urls",
  authenticate,
  // Add admin check middleware here
  offerWallController.getPostbackUrls
);

export default router;
