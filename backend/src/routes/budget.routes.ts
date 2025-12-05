import { Router } from "express";
import { BudgetController } from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get sponsor budget summary
router.get("/summary", BudgetController.getSponsorBudgetSummary);

// Get all budgets for sponsor
router.get("/", BudgetController.getSponsorBudgets);

// Task-specific budget routes
router.post("/tasks/:taskId/budget", BudgetController.createBudget);
router.get("/tasks/:taskId/budget", BudgetController.getBudget);
router.put("/tasks/:taskId/budget", BudgetController.updateBudget);
router.post("/tasks/:taskId/budget/resume", BudgetController.resumeBudget);
router.get(
  "/tasks/:taskId/budget/analytics",
  BudgetController.getBudgetAnalytics
);
router.post(
  "/tasks/:oldTaskId/budget/rollover/:newTaskId",
  BudgetController.applyRollover
);

export default router;
