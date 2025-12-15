import { admin, initializeFirebase } from "../config/firebase.js";
import Notification, { INotification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { getSocketService } from "../config/socket.js";
import mongoose from "mongoose";

// Initialize Firebase on service load
initializeFirebase();

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: INotification["type"];
  data?: Record<string, any>;
  actionUrl?: string;
}

interface SendPushOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  tokens: string[];
}

class NotificationService {
  /**
   * Create a notification in the database
   */
  async createNotification(
    payload: NotificationPayload
  ): Promise<INotification> {
    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(payload.userId),
      title: payload.title,
      body: payload.body,
      type: payload.type,
      data: payload.data || {},
      actionUrl: payload.actionUrl,
      read: false,
    });

    // Emit real-time notification via Socket.io
    try {
      const socketService = getSocketService();
      socketService.emitNotification(payload.userId, notification.toObject());
    } catch (error) {
      console.log(
        "Socket service not available, skipping real-time notification"
      );
    }

    return notification;
  }

  /**
   * Send push notification via FCM
   */
  async sendPushNotification(options: SendPushOptions): Promise<void> {
    if (!options.tokens || options.tokens.length === 0) {
      console.log("⚠️ No FCM tokens provided, skipping push notification");
      return;
    }

    try {
      const message = {
        notification: {
          title: options.title,
          body: options.body,
        },
        data: options.data || {},
        tokens: options.tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      console.log(
        `✅ Push notification sent: ${response.successCount} successful, ${response.failureCount} failed`
      );

      // Handle failed tokens (remove invalid ones)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(options.tokens[idx]);
            console.error(
              `❌ Failed to send to token ${options.tokens[idx]}:`,
              resp.error
            );
          }
        });

        // Remove invalid tokens from users
        await this.removeInvalidTokens(failedTokens);
      }
    } catch (error) {
      console.error("❌ Error sending push notification:", error);
      throw error;
    }
  }

  /**
   * Send notification to a user (both database and push)
   */
  async sendToUser(payload: NotificationPayload): Promise<void> {
    // Create notification in database
    await this.createNotification(payload);

    // Get user's FCM tokens
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has push notifications enabled
    if (!user.preferences?.pushNotifications) {
      console.log(`⚠️ Push notifications disabled for user ${payload.userId}`);
      return;
    }

    // Send push notification
    if (user.fcmTokens && user.fcmTokens.length > 0) {
      // Extract active tokens
      const activeTokens = user.fcmTokens
        .filter((t) => t.isActive)
        .map((t) => t.token);

      if (activeTokens.length > 0) {
        await this.sendPushNotification({
          title: payload.title,
          body: payload.body,
          data: {
            type: payload.type,
            actionUrl: payload.actionUrl || "",
            ...payload.data,
          },
          tokens: activeTokens,
        });
      }
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToMultipleUsers(
    userIds: string[],
    payload: Omit<NotificationPayload, "userId">
  ): Promise<void> {
    const promises = userIds.map((userId) =>
      this.sendToUser({ ...payload, userId })
    );
    await Promise.allSettled(promises);
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
      }),
      Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        read: false,
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      {
        read: true,
        readAt: new Date(),
      }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    await Notification.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(notificationId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  /**
   * Register FCM token for a user
   */
  async registerFCMToken(
    userId: string,
    token: string,
    platform: "ios" | "android" = "android",
    deviceId: string = "unknown"
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if token already exists
    const existingToken = user.fcmTokens.find((t) => t.token === token);
    if (!existingToken) {
      user.fcmTokens.push({
        token,
        platform,
        deviceId,
        registeredAt: new Date(),
        lastUsed: new Date(),
        isActive: true,
        failureCount: 0,
      });
      await user.save();
      console.log(`✅ FCM token registered for user ${userId}`);
    } else {
      // Update existing token
      existingToken.lastUsed = new Date();
      existingToken.isActive = true;
      await user.save();
    }
  }

  /**
   * Unregister FCM token for a user
   */
  async unregisterFCMToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: { token } },
    });
    console.log(`✅ FCM token unregistered for user ${userId}`);
  }

  /**
   * Remove invalid FCM tokens
   */
  private async removeInvalidTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;

    await User.updateMany(
      { "fcmTokens.token": { $in: tokens } },
      { $pull: { fcmTokens: { token: { $in: tokens } } } }
    );

    console.log(`🗑️ Removed ${tokens.length} invalid FCM tokens`);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    });
  }

  /**
   * Notification templates for different events
   */
  templates = {
    taskApproved: (taskTitle: string, amount: number) => ({
      title: "Task Approved! 🎉",
      body: `Your submission for "${taskTitle}" has been approved. ₦${amount} added to your wallet.`,
      type: "task_approved" as const,
    }),

    taskRejected: (taskTitle: string, reason: string) => ({
      title: "Task Rejected",
      body: `Your submission for "${taskTitle}" was rejected. Reason: ${reason}`,
      type: "task_rejected" as const,
    }),

    paymentReceived: (amount: number, source: string) => ({
      title: "Payment Received 💰",
      body: `You received ₦${amount} from ${source}`,
      type: "payment_received" as const,
    }),

    withdrawalProcessed: (amount: number) => ({
      title: "Withdrawal Processed ✅",
      body: `Your withdrawal of ₦${amount} has been processed successfully.`,
      type: "withdrawal_processed" as const,
    }),

    referralJoined: (referralName: string, bonus: number) => ({
      title: "New Referral! 🎁",
      body: `${referralName} joined using your referral code. You earned ₦${bonus}!`,
      type: "referral_joined" as const,
    }),

    achievementUnlocked: (achievementName: string) => ({
      title: "Achievement Unlocked! 🏆",
      body: `Congratulations! You've unlocked "${achievementName}"`,
      type: "achievement_unlocked" as const,
    }),

    challengeCompleted: (challengeName: string, reward: number) => ({
      title: "Challenge Completed! 🎯",
      body: `You completed "${challengeName}" and earned ₦${reward}!`,
      type: "challenge_completed" as const,
    }),

    dailyBonus: (amount: number, streak: number) => ({
      title: "Daily Bonus Claimed! 🎁",
      body: `You claimed ₦${amount}! ${streak} day streak!`,
      type: "daily_bonus" as const,
    }),

    systemAnnouncement: (message: string) => ({
      title: "System Announcement 📢",
      body: message,
      type: "system_announcement" as const,
    }),
  };
}

export default new NotificationService();
