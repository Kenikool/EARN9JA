import { Router } from "express";
import { SponsorController } from "../controllers/sponsor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
const sponsorController = new SponsorController();

// Public routes
router.get("/packages", sponsorController.getPackages);
router.get("/packages/:id", sponsorController.getPackageById);

// Protected routes (require authentication)
router.post("/subscribe", authenticate, sponsorController.subscribeToPackage);
router.post(
  "/complete-onboarding",
  authenticate,
  sponsorController.completeOnboarding
);
router.get(
  "/onboarding-status",
  authenticate,
  sponsorController.getOnboardingStatus
);
router.get("/analytics", authenticate, sponsorController.getAnalytics);

export default router;
