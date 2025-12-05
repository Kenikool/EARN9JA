import { Request, Response } from "express";
import { BudgetService } from "../services/BudgetService.js";

export class BudgetController {
  /**
   * Create budget for a task
   * POST /api/tasks/:taskId/budget
   */
  static async createBudget(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const { taskId } = req.params;
      const budgetData = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const budget = await BudgetService.createBudget(
        taskId,
        userId,
        budgetData
      );

      res.status(201).json({
        success: true,
        message: "Budget created successfully",
        data: budget,
      });
    } catch (error: any) {
      console.error("Create budget error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create budget",
        error: error.message,
      });
    }
  }

  /**
   * Get budget by task ID
   * GET /api/tasks/:taskId/budget
   */
  static async getBudget(req: Request, res: Response) {
    try {
      const { taskId } = req.params;

      const budget = await BudgetService.getBudgetByTaskId(taskId);

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: "Budget not found",
        });
      }

      res.status(200).json({
        success: true,
        data: budget,
      });
    } catch (error: any) {
      console.error("Get budget error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get budget",
        error: error.message,
      });
    }
  }

  /**
   * Get sponsor budgets
   * GET /api/budgets
   */
  static async getSponsorBudgets(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const { isPaused, isExhausted } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const filters: any = {};
      if (isPaused !== undefined) {
        filters.isPaused = isPaused === "true";
      }
      if (isExhausted !== undefined) {
        filters.isExhausted = isExhausted === "true";
      }

      const budgets = await BudgetService.getSponsorBudgets(userId, filters);

      res.status(200).json({
        success: true,
        data: budgets,
      });
    } catch (error: any) {
      console.error("Get sponsor budgets error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get budgets",
        error: error.message,
      });
    }
  }

  /**
   * Update budget
   * PUT /api/tasks/:taskId/budget
   */
  static async updateBudget(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const updates = req.body;

      const budget = await BudgetService.updateBudget(taskId, updates);

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: "Budget not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Budget updated successfully",
        data: budget,
      });
    } catch (error: any) {
      console.error("Update budget error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update budget",
        error: error.message,
      });
    }
  }

  /**
   * Resume budget (unpause)
   * POST /api/tasks/:taskId/budget/resume
   */
  static async resumeBudget(req: Request, res: Response) {
    try {
      const { taskId } = req.params;

      const budget = await BudgetService.resumeBudget(taskId);

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: "Budget not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Budget resumed successfully",
        data: budget,
      });
    } catch (error: any) {
      console.error("Resume budget error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resume budget",
        error: error.message,
      });
    }
  }

  /**
   * Get budget analytics
   * GET /api/tasks/:taskId/budget/analytics
   */
  static async getBudgetAnalytics(req: Request, res: Response) {
    try {
      const { taskId } = req.params;

      const analytics = await BudgetService.getBudgetAnalytics(taskId);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error("Get budget analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get budget analytics",
        error: error.message,
      });
    }
  }

  /**
   * Get sponsor budget summary
   * GET /api/budgets/summary
   */
  static async getSponsorBudgetSummary(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const summary = await BudgetService.getSponsorBudgetSummary(userId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error("Get budget summary error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get budget summary",
        error: error.message,
      });
    }
  }

  /**
   * Apply rollover to new task
   * POST /api/tasks/:oldTaskId/budget/rollover/:newTaskId
   */
  static async applyRollover(req: Request, res: Response) {
    try {
      const { oldTaskId, newTaskId } = req.params;

      await BudgetService.applyRollover(oldTaskId, newTaskId);

      res.status(200).json({
        success: true,
        message: "Rollover applied successfully",
      });
    } catch (error: any) {
      console.error("Apply rollover error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to apply rollover",
        error: error.message,
      });
    }
  }
}
