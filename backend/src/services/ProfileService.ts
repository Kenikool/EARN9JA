import { User } from "../models/User.js";

class ProfileService {
  async getProfile(userId: string) {
    try {
      const user = await User.findById(userId)
        .select("-passwordHash -__v")
        .populate("walletId", "availableBalance lifetimeEarnings")
        .lean();

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message: "Failed to fetch profile",
      };
    }
  }

  async updateProfile(userId: string, updates: any) {
    try {
      const updateData: any = {};

      if (updates.firstName)
        updateData["profile.firstName"] = updates.firstName;
      if (updates.lastName) updateData["profile.lastName"] = updates.lastName;
      if (updates.bio !== undefined) updateData["profile.bio"] = updates.bio;
      if (updates.language) updateData["profile.language"] = updates.language;
      if (updates.location) updateData["profile.location"] = updates.location;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .select("-passwordHash -__v")
        .lean();

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "Profile updated successfully",
        user,
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: "Failed to update profile",
      };
    }
  }

  async uploadAvatar(userId: string, base64Image: string) {
    try {
      const { cloudinaryService } = await import("./CloudinaryService.js");

      // Upload to Cloudinary
      const avatarUrl = await cloudinaryService.uploadImage(
        base64Image,
        "avatars"
      );

      // Update user profile
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { "profile.avatar": avatarUrl } },
        { new: true }
      )
        .select("-passwordHash -__v")
        .lean();

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "Avatar uploaded successfully",
        avatarUrl,
      };
    } catch (error) {
      console.error("Upload avatar error:", error);
      return {
        success: false,
        message: "Failed to upload avatar",
      };
    }
  }

  async updatePreferences(userId: string, preferences: any) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true }
      )
        .select("-passwordHash -__v")
        .lean();

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "Preferences updated successfully",
        preferences: user.preferences,
      };
    } catch (error) {
      console.error("Update preferences error:", error);
      return {
        success: false,
        message: "Failed to update preferences",
      };
    }
  }
  async getNotificationSettings(userId: string) {
    try {
      const user = await User.findById(userId)
        .select("notificationPreferences")
        .lean();

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Return default settings if not set
      const defaultSettings = {
        pushNotifications: true,
        emailNotifications: true,
        taskReminders: true,
        paymentAlerts: true,
        marketingEmails: false,
        weeklyReports: true,
      };

      return {
        success: true,
        data: user.notificationPreferences || defaultSettings,
      };
    } catch (error) {
      console.error("Get notification settings error:", error);
      return {
        success: false,
        message: "Failed to fetch notification settings",
      };
    }
  }

  async updateNotificationSettings(userId: string, settings: any) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { notificationPreferences: settings } },
        { new: true, runValidators: true }
      )
        .select("notificationPreferences")
        .lean();

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "Notification settings updated successfully",
        data: user.notificationPreferences,
      };
    } catch (error) {
      console.error("Update notification settings error:", error);
      return {
        success: false,
        message: "Failed to update notification settings",
      };
    }
  }
}

export const profileService = new ProfileService();
