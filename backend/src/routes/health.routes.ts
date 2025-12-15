import { Router } from "express";
import {
  getHealthStatus,
  getSystemMetrics,
} from "../controllers/health.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Protected health check endpoint (admin only)
router.get("/", authenticate, requireAdmin, getHealthStatus);

// Protected system metrics endpoint (admin only)
router.get("/metrics", authenticate, requireAdmin, getSystemMetrics);

export default router;
