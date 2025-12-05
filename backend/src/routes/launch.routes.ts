import express from "express";
import { launchController } from "../controllers/launch.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin middleware for admin-only routes
const requireAdmin = (
  req: any,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (!req.user?.roles?.includes("admin")) {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
    return;
  }
  next();
};

/**
 * @route   GET /api/admin/launch-status
 * @desc    Get current launch phase status and progress
 * @access  Admin only
 */
router.get(
  "/admin/launch-status",
  authenticate,
  requireAdmin,
  launchController.getLaunchStatus
);

/**
 * @route   POST /api/admin/advance-phase
 * @desc    Manually advance to the next phase
 * @access  Admin only
 */
router.post(
  "/admin/advance-phase",
  authenticate,
  requireAdmin,
  launchController.advancePhase
);

/**
 * @route   POST /api/admin/update-phase-progress
 * @desc    Update phase progress metrics
 * @access  Admin only
 */
router.post(
  "/admin/update-phase-progress",
  authenticate,
  requireAdmin,
  launchController.updatePhaseProgress
);

/**
 * @route   GET /api/launch/registration-status
 * @desc    Check if new user registrations are allowed
 * @access  Public
 */
router.get(
  "/launch/registration-status",
  launchController.getRegistrationStatus
);

export default router;
