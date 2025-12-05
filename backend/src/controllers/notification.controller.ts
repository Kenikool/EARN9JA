import { Request, Response } from "express";
import NotificationService from "../services/NotificationService.js";

export class NotificationController {
  /**
   * Get user notifications
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await NotificationService.getUserNotifications(
        userId,
        page,
        limit
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const count = await NotificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch unread count",
        error: error.message,
      });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { notificationId } = req.params;

      await NotificationService.markAsRead(notificationId, userId);

      res.json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
        error: error.message,
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();

      await NotificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
        error: error.message,
      });
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { notificationId } = req.params;

      await NotificationService.deleteNotification(notificationId, userId);

      res.json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message,
      });
    }
  }

  /**
   * Register FCM token
   */
  async registerToken(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "FCM token is required",
        });
      }

      await NotificationService.registerFCMToken(userId, token);

      res.json({
        success: true,
        message: "FCM token registered successfully",
      });
    } catch (error: any) {
      console.error("Error registering FCM token:", error);
      res.status(500).json({
        success: false,
        message: "Failed to register FCM token",
        error: error.message,
      });
    }
  }

  /**
   * Unregister FCM token
   */
  async unregisterToken(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "FCM token is required",
        });
      }

      await NotificationService.unregisterFCMToken(userId, token);

      res.json({
        success: true,
        message: "FCM token unregistered successfully",
      });
    } catch (error: any) {
      console.error("Error unregistering FCM token:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unregister FCM token",
        error: error.message,
      });
    }
  }
}

export default new NotificationController();
