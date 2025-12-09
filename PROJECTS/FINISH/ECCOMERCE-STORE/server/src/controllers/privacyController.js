import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

// @desc    Get privacy settings
// @route   GET /api/auth/privacy-settings
// @access  Private
export const getPrivacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: "success",
      data: {
        privacySettings: user.privacySettings || {
          marketingEmails: true,
          securityAlerts: true,
          dataSharing: false,
        },
      },
    });
  } catch (error) {
    console.error("Get privacy settings error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get privacy settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/auth/privacy-settings
// @access  Private
export const updatePrivacySettings = async (req, res) => {
  try {
    const { marketingEmails, securityAlerts, dataSharing } = req.body;

    const user = await User.findById(req.user._id);

    // Update settings
    user.privacySettings = {
      marketingEmails: marketingEmails !== undefined ? marketingEmails : user.privacySettings?.marketingEmails ?? true,
      securityAlerts: securityAlerts !== undefined ? securityAlerts : user.privacySettings?.securityAlerts ?? true,
      dataSharing: dataSharing !== undefined ? dataSharing : user.privacySettings?.dataSharing ?? false,
    };

    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "privacy_settings_updated",
      details: { settings: user.privacySettings },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      status: "success",
      message: "Privacy settings updated successfully",
      data: {
        privacySettings: user.privacySettings,
      },
    });
  } catch (error) {
    console.error("Update privacy settings error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update privacy settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get notification preferences
// @route   GET /api/auth/notification-preferences
// @access  Private
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: "success",
      data: {
        preferences: user.privacySettings || {
          marketingEmails: true,
          securityAlerts: true,
          dataSharing: false,
        },
      },
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get notification preferences",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/auth/notification-preferences
// @access  Private
export const updateNotificationPreferences = async (req, res) => {
  try {
    const preferences = req.body;

    const user = await User.findById(req.user._id);

    // Update preferences
    user.privacySettings = {
      ...user.privacySettings,
      ...preferences,
    };

    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "notification_preferences_updated",
      details: { preferences: user.privacySettings },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      status: "success",
      message: "Notification preferences updated successfully",
      data: {
        preferences: user.privacySettings,
      },
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update notification preferences",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  getPrivacySettings,
  updatePrivacySettings,
  getNotificationPreferences,
  updateNotificationPreferences,
};
