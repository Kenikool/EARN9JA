import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { securityController } from "../controllers/security.controller.js";

const router = Router();

// 2FA routes
router.post("/2fa/setup", authenticate, securityController.setup2FA);
router.post("/2fa/verify", authenticate, securityController.verify2FA);
router.post("/2fa/disable", authenticate, securityController.disable2FA);
router.get("/2fa/status", authenticate, securityController.get2FAStatus);
router.post(
  "/2fa/backup-codes/regenerate",
  authenticate,
  securityController.regenerateBackupCodes
);

// Fraud detection routes
router.post("/fraud/check", authenticate, securityController.checkFraudRisk);

export default router;
