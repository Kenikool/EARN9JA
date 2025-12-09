import express from "express";
import {
  requestAccountUnlock,
  verifyUnlockToken,
  getLoginHistory,
  getActivityLog,
  getSecurityStatus,
  changePassword,
} from "../controllers/securityController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/unlock-account", requestAccountUnlock);
router.get("/unlock-account/:token", verifyUnlockToken);

// Protected routes
router.post("/change-password", authenticate, changePassword);
router.get("/login-history", authenticate, getLoginHistory);
router.get("/activity-log", authenticate, getActivityLog);
router.get("/security-status", authenticate, getSecurityStatus);

export default router;
