import { Request, Response } from "express";
import { pushNotificationService } from "../services/PushNotificationService.js";

/**
 * Register FCM token
 */
export const registerToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { token, platform, deviceId } = req.body;

    if (!token || !platform || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "token, platform, and deviceId are required",
      });
    }

    if (platform !== "ios" && platform !== "android") {
      return res.status(400).json({
        success: false,
        message: "platform must be 'ios' or 'android'",
      });
    }

    await pushNotificationService.registerToken(
      userId,
      token,
      platform,
      deviceId
    );

    res.json({
      success: true,
      message: "FCM token registered successfully",
    });
  } catch (error: any) {
    console.error("Register token error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register token",
    });
  }
};

/**
 * Unregister FCM token
 */
export const unregisterToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "token is required",
      });
    }

    await pushNotificationService.unregisterToken(userId, token);

    res.json({
      success: true,
      message: "FCM token unregistered successfully",
    });
  } catch (error: any) {
    console.error("Unregister token error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to unregister token",
    });
  }
};

/**
 * Send push notification (admin only)
 */
export const sendPushNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, data, actionUrl, userIds } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "title and body are required",
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array",
      });
    }

    const notification = {
      title,
      body,
      data,
      actionUrl,
    };

    await pushNotificationService.sendBulkPushNotifications(
      notification,
      userIds
    );

    res.json({
      success: true,
      message: "Push notifications sent successfully",
    });
  } catch (error: any) {
    console.error("Send push notification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send push notifications",
    });
  }
};
