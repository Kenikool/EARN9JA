import { Request, Response } from "express";
import { cpaGripProvider } from "../services/providers/CPAGripProvider.js";
import { ogAdsProvider } from "../services/providers/OGAdsProvider.js";
import { logger } from "../config/logger.js";

export class OfferWallController {
  /**
   * Get CPAGrip offer wall URL
   * GET /api/offerwalls/cpagrip/url
   */
  async getCPAGripUrl(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      // Initialize provider if not already done
      if (!cpaGripProvider.getConfig()) {
        await cpaGripProvider.initialize();
      }

      const url = cpaGripProvider.generateOfferWallUrl(userId as string);

      res.json({
        success: true,
        data: {
          url,
          provider: cpaGripProvider.getProviderInfo(),
        },
      });
    } catch (error: any) {
      logger.error("Error generating CPAGrip URL:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate offer wall URL",
      });
    }
  }

  /**
   * Get OGAds offer wall URL
   * GET /api/offerwalls/ogads/url
   */
  async getOGAdsUrl(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      // Initialize provider if not already done
      if (!ogAdsProvider.getConfig()) {
        await ogAdsProvider.initialize();
      }

      const url = ogAdsProvider.generateOfferWallUrl(userId as string);

      res.json({
        success: true,
        data: {
          url,
          provider: ogAdsProvider.getProviderInfo(),
        },
      });
    } catch (error: any) {
      logger.error("Error generating OGAds URL:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate offer wall URL",
      });
    }
  }

  /**
   * Get all available offer walls
   * GET /api/offerwalls
   */
  async getAvailableOfferWalls(req: Request, res: Response) {
    try {
      const offerWalls = [];

      // Check CPAGrip
      try {
        if (!cpaGripProvider.getConfig()) {
          await cpaGripProvider.initialize();
        }
        const cpaGripInfo = cpaGripProvider.getProviderInfo();
        if (cpaGripInfo.isConfigured) {
          offerWalls.push(cpaGripInfo);
        }
      } catch (error) {
        logger.warn("CPAGrip not available:", error);
      }

      // Check OGAds
      try {
        if (!ogAdsProvider.getConfig()) {
          await ogAdsProvider.initialize();
        }
        const ogAdsInfo = ogAdsProvider.getProviderInfo();
        if (ogAdsInfo.isConfigured) {
          offerWalls.push(ogAdsInfo);
        }
      } catch (error) {
        logger.warn("OGAds not available:", error);
      }

      res.json({
        success: true,
        data: offerWalls,
      });
    } catch (error: any) {
      logger.error("Error getting available offer walls:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get offer walls",
      });
    }
  }

  /**
   * Configure CPAGrip provider (admin only)
   * POST /api/offerwalls/cpagrip/configure
   */
  async configureCPAGrip(req: Request, res: Response) {
    try {
      const { offerWallUrl, publisherId, secretKey, commissionRate } = req.body;

      if (!offerWallUrl || !publisherId || !secretKey) {
        return res.status(400).json({
          success: false,
          message: "offerWallUrl, publisherId, and secretKey are required",
        });
      }

      await cpaGripProvider.saveConfiguration({
        offerWallUrl,
        publisherId,
        secretKey,
        commissionRate,
      });

      res.json({
        success: true,
        message: "CPAGrip configured successfully",
        data: cpaGripProvider.getProviderInfo(),
      });
    } catch (error: any) {
      logger.error("Error configuring CPAGrip:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to configure CPAGrip",
      });
    }
  }

  /**
   * Configure OGAds provider (admin only)
   * POST /api/offerwalls/ogads/configure
   */
  async configureOGAds(req: Request, res: Response) {
    try {
      const { offerWallUrl, apiKey, secretKey, commissionRate } = req.body;

      if (!offerWallUrl || !apiKey || !secretKey) {
        return res.status(400).json({
          success: false,
          message: "offerWallUrl, apiKey, and secretKey are required",
        });
      }

      await ogAdsProvider.saveConfiguration({
        offerWallUrl,
        apiKey,
        secretKey,
        commissionRate,
      });

      res.json({
        success: true,
        message: "OGAds configured successfully",
        data: ogAdsProvider.getProviderInfo(),
      });
    } catch (error: any) {
      logger.error("Error configuring OGAds:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to configure OGAds",
      });
    }
  }

  /**
   * Get postback URLs for provider configuration
   * GET /api/offerwalls/postback-urls
   */
  async getPostbackUrls(req: Request, res: Response) {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const postbackUrls = {
        cpagrip: cpaGripProvider.getPostbackUrl(baseUrl),
        ogads: ogAdsProvider.getPostbackUrl(baseUrl),
      };

      res.json({
        success: true,
        data: postbackUrls,
        instructions: {
          cpagrip:
            "Copy this URL and paste it in your CPAGrip dashboard under Postback URL settings",
          ogads:
            "Copy this URL and paste it in your OGAds dashboard under Postback URL settings",
        },
      });
    } catch (error: any) {
      logger.error("Error getting postback URLs:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get postback URLs",
      });
    }
  }
}

export const offerWallController = new OfferWallController();
