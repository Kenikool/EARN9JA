import { Router } from "express";
import { TargetingController } from "../controllers/targeting.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Estimate audience (no task ID needed)
router.post("/estimate", TargetingController.estimateAudience);

// Get states and cities
router.get("/states", TargetingController.getStates);
router.get("/cities", TargetingController.getCities);

// Task-specific targeting routes
router.post("/:taskId", TargetingController.createTargeting);
router.get("/:taskId", TargetingController.getTargeting);
router.put("/:taskId", TargetingController.updateTargeting);
router.delete("/:taskId", TargetingController.deleteTargeting);

export default router;
