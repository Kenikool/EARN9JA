import express from "express";
import {
  enable2FA,
  verify2FASetup,
  verify2FALogin,
  disable2FA,
  regenerateBackupCodes,
  sendOTP,
} from "../controllers/twoFactorController.js";
import { authenticate } from "../middleware/auth.js";
import { twoFactorLimiter, strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/enable", authenticate, enable2FA);
router.post("/verify-setup", authenticate, twoFactorLimiter, verify2FASetup);
router.post("/disable", authenticate, strictLimiter, disable2FA);
router.post("/regenerate-backup", authenticate, strictLimiter, regenerateBackupCodes);

// Public routes (for login flow)
router.post("/verify-login", twoFactorLimiter, verify2FALogin);
router.post("/send-otp", strictLimiter, sendOTP);

export default router;
