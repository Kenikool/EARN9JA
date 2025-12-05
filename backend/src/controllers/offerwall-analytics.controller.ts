import { Request, Response } from "express";
import { offerWallAnalyticsService } from "../services/OfferWallAnalyticsService.js";
import { logger } from "../config/logger.js";

export class OfferWallAnalyticsController {
  async getProviderAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { providerId } = req.params;
      const { startDate, endDate } = req.query;

      const analytics = await offerWallAnalyticsService.getProviderAnalytics(
        providerId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      logger.error("Error getting provider analytics:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get provider analytics",
      });
    }
  }

  async getRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const report = await offerWallAnalyticsService.generateRevenueReport(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      logger.error("Error generating revenue report:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate revenue report",
      });
    }
  }

  async compareProviders(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const comparison = await offerWallAnalyticsService.compareProviders(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: comparison,
      });
    } catch (error: any) {
      logger.error("Error comparing providers:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to compare providers",
      });
    }
  }
}

export const offerWallAnalyticsController = new OfferWallAnalyticsController();
