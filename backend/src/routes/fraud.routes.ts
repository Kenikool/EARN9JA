import { Router } from "express";
import { fraudController } from "../controllers/fraud.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication (admin only in production)
router.use(authenticate);

// Fraud reports and monitoring
router.get("/report", fraudController.getFraudReport);
router.get("/flagged-users", fraudController.getFlaggedUsers);

// User-specific fraud checks
router.get("/check/:userId", fraudController.checkUserFraud);
router.get("/activity/:userId", fraudController.getUserActivity);

// Flag management
router.post("/flag-user", fraudController.flagUser);
router.post("/clear-flag/:userId", fraudController.clearUserFlag);

export default router;
