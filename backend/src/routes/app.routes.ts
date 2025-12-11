import { Router } from "express";

const router = Router();

/**
 * GET /api/v1/app/version
 * Check for app updates
 */
router.get("/version", (req, res) => {
  res.json({
    success: true,
    data: {
      latestVersion: "1.0.1", // Update this when you release new version
      minVersion: "1.0.0", // Minimum version that still works
      downloadUrl: "https://earn9ja.site/downloads/earn9ja-latest.apk",
      updateRequired: false, // Set to true to force update
      releaseNotes: [
        "✨ Added 2-minute cooldown between ads",
        "🐛 Fixed ad loading issues",
        "⚡ Improved app performance",
        "🎨 UI improvements",
      ],
      releaseDate: "2024-12-11",
    },
  });
});

export default router;
