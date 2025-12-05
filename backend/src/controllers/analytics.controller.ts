import { Request, Response } from "express";
import { AnalyticsService } from "../services/AnalyticsService.js";

// Extend Request type to include user
interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

export class AnalyticsController {
  /**
   * Get worker analytics
   */
  static async getWorkerAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user.id;
      const { period = "month" } = req.query;

      const analytics = await AnalyticsService.getWorkerAnalytics(
        userId,
        period as "day" | "week" | "month" | "year"
      );

      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching worker analytics:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to fetch worker analytics" });
    }
  }

  /**
   * Get sponsor overview analytics
   */
  static async getSponsorOverview(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user.id;
      const { period = "month" } = req.query;

      const analytics = await AnalyticsService.getSponsorOverview(
        userId,
        period as "day" | "week" | "month" | "year"
      );

      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching sponsor analytics:", error);
      res.status(500).json({
        message: error.message || "Failed to fetch sponsor analytics",
      });
    }
  }

  /**
   * Get campaign-specific analytics
   */
  static async getCampaignAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user.id;
      const { campaignId } = req.params;

      const analytics = await AnalyticsService.getCampaignAnalytics(
        campaignId,
        userId
      );

      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching campaign analytics:", error);
      res.status(500).json({
        message: error.message || "Failed to fetch campaign analytics",
      });
    }
  }

  /**
   * Get platform analytics (admin only)
   */
  static async getPlatformAnalytics(req: Request, res: Response) {
    try {
      const { period = "month" } = req.query;

      const analytics = await AnalyticsService.getPlatformAnalytics(
        period as "day" | "week" | "month" | "year"
      );

      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching platform analytics:", error);
      res.status(500).json({
        message: error.message || "Failed to fetch platform analytics",
      });
    }
  }

  /**
   * Get real-time metrics (admin only)
   */
  static async getRealtimeMetrics(_req: Request, res: Response) {
    try {
      const metrics = await AnalyticsService.getRealtimeAnalytics();

      res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching realtime metrics:", error);
      res.status(500).json({
        message: error.message || "Failed to fetch realtime metrics",
      });
    }
  }
}
