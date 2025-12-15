import { Request, Response } from "express";
import { adMobService } from "../services/AdMobService.js";

class AdMobController {
  async watchAd(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const { taskId, platform, deviceId, timestamp, metadata } = req.body;

      // Get IP address from request
      const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";

      const result = await adMobService.processAdReward({
        userId,
        taskId: taskId || "admob_reward",
        platform,
        deviceId,
        ipAddress,
        timestamp: timestamp || new Date().toISOString(),
        metadata,
      });

      if (result.success) {
        // Additional validation: ensure reward doesn't exceed expected revenue
        const EXPECTED_ADMOB_REVENUE = 0.8;
        if (result.reward && result.reward > EXPECTED_ADMOB_REVENUE) {
          console.error(
            `Reward validation failed: ₦${result.reward} exceeds expected revenue ₦${EXPECTED_ADMOB_REVENUE}`
          );
          res.status(500).json({
            success: false,
            error: "Reward calculation error. Please contact support.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: {
            reward: result.reward,
            newBalance: result.newBalance,
            transactionId: result.transactionId,
          },
          message: `Congratulations! You earned ₦${result.reward}`,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          fraudScore: result.fraudScore,
        });
      }
    } catch (error) {
      console.error("Error in watchAd controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const stats = await adMobService.getAdStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error in getStats controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

export const adMobController = new AdMobController();
