import { Request, Response } from "express";
import { financialSummaryService } from "../services/FinancialSummaryService.js";

class FinancialController {
  /**
   * Get financial summary for today/week/month
   * GET /api/admin/financial-summary?period=today|week|month
   */
  async getFinancialSummary(req: Request, res: Response): Promise<void> {
    try {
      // Verify admin role
      if (!req.user?.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          error: "Admin access required",
        });
        return;
      }

      const period = (req.query.period as string) || "today";

      if (!["today", "week", "month"].includes(period)) {
        res.status(400).json({
          success: false,
          error: "Invalid period. Must be today, week, or month",
        });
        return;
      }

      const metrics = await financialSummaryService.getFinancialMetrics(
        period as "today" | "week" | "month"
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error("Error in getFinancialSummary controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get profit/loss trend data
   * GET /api/admin/profit-loss?period=daily|weekly|monthly&limit=30
   */
  async getProfitLoss(req: Request, res: Response): Promise<void> {
    try {
      // Verify admin role
      if (!req.user?.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          error: "Admin access required",
        });
        return;
      }

      const period = (req.query.period as string) || "daily";
      const limit = parseInt(req.query.limit as string) || 30;

      if (!["daily", "weekly", "monthly"].includes(period)) {
        res.status(400).json({
          success: false,
          error: "Invalid period. Must be daily, weekly, or monthly",
        });
        return;
      }

      const trendData = await financialSummaryService.getProfitLossTrend(
        period as "daily" | "weekly" | "monthly",
        limit
      );

      res.status(200).json({
        success: true,
        data: {
          period,
          data: trendData,
        },
      });
    } catch (error) {
      console.error("Error in getProfitLoss controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Check current profitability status
   * GET /api/admin/profitability-check
   */
  async checkProfitability(req: Request, res: Response): Promise<void> {
    try {
      // Verify admin role
      if (!req.user?.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          error: "Admin access required",
        });
        return;
      }

      const profitability = await financialSummaryService.checkProfitability();

      res.status(200).json({
        success: true,
        data: profitability,
      });
    } catch (error) {
      console.error("Error in checkProfitability controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get consecutive profitable days
   * GET /api/admin/consecutive-profit-days
   */
  async getConsecutiveProfitDays(req: Request, res: Response): Promise<void> {
    try {
      // Verify admin role
      if (!req.user?.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          error: "Admin access required",
        });
        return;
      }

      const days = await financialSummaryService.getConsecutiveProfitableDays();

      res.status(200).json({
        success: true,
        data: {
          consecutiveProfitableDays: days,
        },
      });
    } catch (error) {
      console.error("Error in getConsecutiveProfitDays controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Manually trigger daily summary calculation
   * POST /api/admin/calculate-daily-summary
   */
  async calculateDailySummary(req: Request, res: Response): Promise<void> {
    try {
      // Verify admin role
      if (!req.user?.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          error: "Admin access required",
        });
        return;
      }

      const { date } = req.body;
      const targetDate = date ? new Date(date) : new Date();

      const summary = await financialSummaryService.saveDailySummary(
        targetDate
      );

      res.status(200).json({
        success: true,
        data: summary,
        message: "Daily summary calculated successfully",
      });
    } catch (error) {
      console.error("Error in calculateDailySummary controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

export const financialController = new FinancialController();
