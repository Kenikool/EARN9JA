import { Request, Response } from "express";
import { profileService } from "../services/ProfileService.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

class ProfileController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await profileService.getProfile(userId);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await profileService.updateProfile(userId, req.body);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  }

  async uploadAvatar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      console.log("📸 Avatar upload request for user:", userId);

      if (!userId) {
        console.log("❌ No user ID found");
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { base64Image } = req.body;
      console.log("📦 Request body keys:", Object.keys(req.body));
      console.log("🖼️ Base64 image present:", !!base64Image);
      console.log("🖼️ Base64 image length:", base64Image?.length);

      if (!base64Image) {
        console.log("❌ No base64Image in request body");
        res.status(400).json({
          success: false,
          message: "Image data is required",
        });
        return;
      }

      console.log("☁️ Uploading to Cloudinary...");
      const result = await profileService.uploadAvatar(userId, base64Image);
      console.log("✅ Upload result:", result.success ? "Success" : "Failed");

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("❌ Upload avatar error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload avatar",
      });
    }
  }

  async updatePreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await profileService.updatePreferences(userId, req.body);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update preferences",
      });
    }
  }

  async getNotificationSettings(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await profileService.getNotificationSettings(userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error("Get notification settings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notification settings",
      });
    }
  }

  async updateNotificationSettings(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await profileService.updateNotificationSettings(
        userId,
        req.body
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Update notification settings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update notification settings",
      });
    }
  }
}

export const profileController = new ProfileController();
