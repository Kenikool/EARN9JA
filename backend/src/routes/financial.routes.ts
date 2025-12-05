import express from "express";
import { financialController } from "../controllers/financial.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin role
router.get(
  "/admin/financial-summary",
  authenticate,
  financialController.getFinancialSummary
);

router.get(
  "/admin/profit-loss",
  authenticate,
  financialController.getProfitLoss
);

router.get(
  "/admin/profitability-check",
  authenticate,
  financialController.checkProfitability
);

router.get(
  "/admin/consecutive-profit-days",
  authenticate,
  financialController.getConsecutiveProfitDays
);

router.post(
  "/admin/calculate-daily-summary",
  authenticate,
  financialController.calculateDailySummary
);

export default router;
