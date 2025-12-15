import { Request, Response } from "express";
import { appVersionService } from "../services/AppVersionService.js";

/**
 * Get version info (public endpoint)
 */
export const getVersionInfo = async (req: Request, res: Response) => {
  try {
    const platform = req.query.platform as "ios" | "android";

    if (!platform || (platform !== "ios" && platform !== "android")) {
      return res.status(400).json({
        success: false,
        message: "platform query parameter is required (ios or android)",
      });
    }

    const currentVersion = req.query.version as string;
    const userId = (req as any).user?.userId;

    // Get version info
    const versionInfo = await appVersionService.getVersionInfo(platform);

    // Log version check if current version provided
    if (currentVersion) {
      await appVersionService.logVersionCheck(userId, currentVersion, platform);
    }

    res.json({
      success: true,
      data: versionInfo,
    });
  } catch (error: any) {
    console.error("Get version info error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get version info",
    });
  }
};

/**
 * Check if update is required
 */
export const checkVersion = async (req: Request, res: Response) => {
  try {
    const { version, platform } = req.query;

    if (!version || !platform) {
      return res.status(400).json({
        success: false,
        message: "version and platform query parameters are required",
      });
    }

    if (platform !== "ios" && platform !== "android") {
      return res.status(400).json({
        success: false,
        message: "platform must be 'ios' or 'android'",
      });
    }

    const userId = (req as any).user?.userId;

    // Check version
    const result = await appVersionService.checkVersion(
      version as string,
      platform as "ios" | "android"
    );

    // Log version check
    await appVersionService.logVersionCheck(
      userId,
      version as string,
      platform as "ios" | "android"
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Check version error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check version",
    });
  }
};

/**
 * Get all versions (admin only)
 */
export const getAllVersions = async (req: Request, res: Response) => {
  try {
    const platform = req.query.platform as "ios" | "android" | undefined;

    const versions = await appVersionService.getAllVersions(platform);

    res.json({
      success: true,
      data: versions,
    });
  } catch (error: any) {
    console.error("Get all versions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get versions",
    });
  }
};

/**
 * Update version config (admin only)
 */
export const updateVersionConfig = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id || (req as any).user?._id;
    const config = req.body;

    if (!config.platform || !config.latestVersion || !config.minVersion) {
      return res.status(400).json({
        success: false,
        message: "platform, latestVersion, and minVersion are required",
      });
    }

    await appVersionService.updateVersionConfig(config, adminId);

    res.json({
      success: true,
      message: "Version config updated successfully",
    });
  } catch (error: any) {
    console.error("Update version config error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update version config",
    });
  }
};

/**
 * Get version analytics (admin only)
 */
export const getVersionAnalytics = async (req: Request, res: Response) => {
  try {
    const filters = {
      platform: req.query.platform as "ios" | "android" | undefined,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    };

    const analytics = await appVersionService.getVersionAnalytics(filters);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error("Get version analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get version analytics",
    });
  }
};
