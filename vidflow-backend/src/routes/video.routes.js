const express = require("express");
const router = express.Router();
const videoExtractor = require("../services/videoExtractor");
const { isPlatformAllowed } = require("../config/platforms");

const APP_VERSION = process.env.APP_VERSION || "pro";

/**
 * GET /api/video/info
 * Get video information from URL
 */
router.get("/info", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL parameter is required",
      });
    }

    // Check if platform is allowed
    const platformCheck = isPlatformAllowed(url, APP_VERSION);
    if (!platformCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: platformCheck.reason,
        platform: platformCheck.platform,
        appVersion: APP_VERSION,
      });
    }

    const videoInfo = await videoExtractor.getVideoInfo(url);

    res.json({
      success: true,
      data: videoInfo,
      platform: platformCheck.platform,
    });
  } catch (error) {
    console.error("Error getting video info:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/video/download-url
 * Get direct download URL for video
 */
router.get("/download-url", async (req, res) => {
  try {
    const { url, quality = "best" } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL parameter is required",
      });
    }

    // Check if platform is allowed
    const platformCheck = isPlatformAllowed(url, APP_VERSION);
    if (!platformCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: platformCheck.reason,
        platform: platformCheck.platform,
        appVersion: APP_VERSION,
      });
    }

    const downloadInfo = await videoExtractor.getDownloadUrl(url, quality);

    res.json({
      success: true,
      data: downloadInfo,
      platform: platformCheck.platform,
    });
  } catch (error) {
    console.error("Error getting download URL:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/video/qualities
 * Get available qualities for video
 */
router.get("/qualities", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL parameter is required",
      });
    }

    // Check if platform is allowed
    const platformCheck = isPlatformAllowed(url, APP_VERSION);
    if (!platformCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: platformCheck.reason,
        platform: platformCheck.platform,
        appVersion: APP_VERSION,
      });
    }

    const qualities = await videoExtractor.getAvailableQualities(url);

    res.json({
      success: true,
      data: { qualities },
      platform: platformCheck.platform,
    });
  } catch (error) {
    console.error("Error getting qualities:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/video/health
 * Check if yt-dlp is installed and working
 */
router.get("/health", async (req, res) => {
  try {
    const installCheck = await videoExtractor.checkInstallation();

    res.json({
      success: true,
      ytdlp: installCheck,
      appVersion: APP_VERSION,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
