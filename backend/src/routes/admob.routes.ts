import { Router } from "express";
import { adMobController } from "../controllers/admob.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { adWatchSchema } from "../validators/admob.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/admob/watch
 * @desc    Process ad watch and credit reward
 * @access  Private (Service Worker)
 */
router.post("/watch", validateRequest(adWatchSchema), adMobController.watchAd);

/**
 * @route   GET /api/v1/admob/stats
 * @desc    Get user's ad watching statistics
 * @access  Private
 */
router.get("/stats", adMobController.getStats);

export default router;
