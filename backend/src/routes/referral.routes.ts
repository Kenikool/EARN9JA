import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { referralController } from "../controllers/referral.controller.js";

const router = Router();

// Get referral stats
router.get("/stats", authenticate, referralController.getReferralStats);

// Validate referral code
router.get("/validate/:code", referralController.validateCode);

// Apply referral code
router.post("/apply", authenticate, referralController.applyCode);

// Generate referral code
router.post("/generate", authenticate, referralController.generateCode);

export default router;
