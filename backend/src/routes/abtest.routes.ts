import { Router } from "express";
import { ABTestController } from "../controllers/abtest.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all A/B tests for sponsor
router.get("/", ABTestController.getSponsorABTests);

// Create A/B test
router.post("/", ABTestController.createABTest);

// Get A/B test by ID
router.get("/:id", ABTestController.getABTest);

// Start A/B test
router.post("/:id/start", ABTestController.startABTest);

// Pause A/B test
router.post("/:id/pause", ABTestController.pauseABTest);

// Resume A/B test
router.post("/:id/resume", ABTestController.resumeABTest);

// Select winner manually
router.post("/:id/select-winner", ABTestController.selectWinner);

// Get A/B test results
router.get("/:id/results", ABTestController.getResults);

// Get variant for user (traffic distribution)
router.get("/:id/variant", ABTestController.getVariant);

export default router;
