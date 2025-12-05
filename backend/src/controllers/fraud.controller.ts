import { Request, Response } from "express";
import { fraudPreventionService } from "../services/FraudPreventionService.js";
import { logger } from "../config/logger.js";

export class FraudController {
  /**
   * Get fraud report
   * GET /api/fraud/report
   */
  async getFraudReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const report = await fraudPreventionService.generateFraudReport(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      logger.error("Error generating fraud report:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate fraud report",
      });
    }
  }

  /**
   * Get flagged users
   * GET /api/fraud/flagged-users
   */
  async getFlaggedUsers(req: Request, res: Response): Promise<void> {
    try {
      const flaggedUsers = await fraudPreventionService.getFlaggedUsers();

      res.json({
        success: true,
        data: flaggedUsers,
      });
    } catch (error: any) {
      logger.error("Error getting flagged users:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get flagged users",
      });
    }
  }

  /**
   * Check user fraud status
   * GET /api/fraud/check/:userId
   */
  async checkUserFraud(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const isFlagged = await fraudPreventionService.isUserFlagged(userId);
      const riskScore = await fraudPreventionService.calculateRiskScore(userId);
      const activity = await fraudPreventionService.analyzeUserActivity(userId);

      res.json({
        success: true,
        data: {
          userId,
          isFlagged,
          riskScore,
          activity,
        },
      });
    } catch (error: any) {
      logger.error("Error checking user fraud:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to check user fraud status",
      });
    }
  }

  /**
   * Clear user flag
   * POST /api/fraud/clear-flag/:userId
   */
  async clearUserFlag(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      await fraudPreventionService.clearUserFlag(userId);

      logger.info("User flag cleared by admin", {
        userId,
        adminId: (req as any).user?._id,
      });

      res.json({
        success: true,
        message: "User flag cleared successfully",
      });
    } catch (error: any) {
      logger.error("Error clearing user flag:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to clear user flag",
      });
    }
  }

  /**
   * Flag user manually
   * POST /api/fraud/flag-user
   */
  async flagUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, reason } = req.body;

      if (!userId || !reason) {
        res.status(400).json({
          success: false,
          message: "userId and reason are required",
        });
        return;
      }

      await fraudPreventionService.flagUserForReview(userId, reason);

      logger.info("User manually flagged by admin", {
        userId,
        reason,
        adminId: (req as any).user?._id,
      });

      res.json({
        success: true,
        message: "User flagged successfully",
      });
    } catch (error: any) {
      logger.error("Error flagging user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to flag user",
      });
    }
  }

  /**
   * Get user activity analysis
   * GET /api/fraud/activity/:userId
   */
  async getUserActivity(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const activity = await fraudPreventionService.analyzeUserActivity(userId);
      const riskScore = await fraudPreventionService.calculateRiskScore(userId);

      res.json({
        success: true,
        data: {
          ...activity,
          riskScore,
        },
      });
    } catch (error: any) {
      logger.error("Error getting user activity:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get user activity",
      });
    }
  }
}

export const fraudController = new FraudController();
