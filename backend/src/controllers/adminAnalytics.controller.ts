import { Request, Response } from "express";
import { adminAnalyticsService } from "../services/AdminAnalyticsService.js";

class AdminAnalyticsController {
  async getAdMobAnalytics(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!req.user?.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          error: "Access denied. Admin role required.",
        });
        return;
      }

      const { startDate, endDate, platform, groupBy } = req.query;

      const analytics = await adminAnalyticsService.getAdMobAnalytics({
        startDate: startDate as string,
        endDate: endDate as string,
        platform: platform as "ios" | "android" | "all",
        groupBy: groupBy as "day" | "week" | "month",
      });

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Error in getAdMobAnalytics controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  async exportAnalytics(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!req.user?.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          error: "Access denied. Admin role required.",
        });
        return;
      }

      const { startDate, endDate, platform, groupBy } = req.query;

      const csv = await adminAnalyticsService.exportAnalytics({
        startDate: startDate as string,
        endDate: endDate as string,
        platform: platform as "ios" | "android" | "all",
        groupBy: groupBy as "day" | "week" | "month",
      });

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=admob-analytics-${
          new Date().toISOString().split("T")[0]
        }.csv`
      );

      res.status(200).send(csv);
    } catch (error) {
      console.error("Error in exportAnalytics controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

export const adminAnalyticsController = new AdminAnalyticsController();
