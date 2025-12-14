import { User } from "../models/User.js";
import admin from "firebase-admin";
import mongoose from "mongoose";

interface PushNotificationInput {
  title: string;
  body: string;
  data?: Record<string, string>;
  actionUrl?: string;
}

interface FCMResponse {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

class PushNotificationService {
  private readonly BATCH_SIZE = 500; // FCM rate limit
  private readonly MAX_FAILURE_COUNT = 3;

  /**
   * Send push notification to a single user
   */
  async sendPushNotification(
    userId: string,
    notification: PushNotificationInput
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        console.log(`No FCM tokens found for user ${userId}`);
        return;
      }

      // Get active tokens
      const activeTokens = user.fcmTokens
        .filter((t) => t.isActive)
        .map((t) => t.token);

      if (activeTokens.length === 0) {
        console.log(`No active FCM tokens for user ${userId}`);
        return;
      }

      // Send to FCM
      await this.sendToFCM(activeTokens, {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
      });

      // Update lastUsed for tokens
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            "fcmTokens.$[elem].lastUsed": new Date(),
          },
        },
        {
          arrayFilters: [{ "elem.isActive": true }],
        }
      );

      console.log(`✅ Push notification sent to user ${userId}`);
    } catch (error) {
      console.error("Send push notification error:", error);
      throw error;
    }
  }

  /**
   * Send bulk push notifications to multiple users
   */
  async sendBulkPushNotifications(
    notification: PushNotificationInput,
    userIds: string[]
  ): Promise<void> {
    try {
      console.log(`📤 Sending push notifications to ${userIds.length} users`);

      // Get all active tokens for these users
      const users = await User.find({
        _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
      }).select("fcmTokens");

      const allTokens: string[] = [];
      users.forEach((user) => {
        if (user.fcmTokens && user.fcmTokens.length > 0) {
          const activeTokens = user.fcmTokens
            .filter((t) => t.isActive)
            .map((t) => t.token);
          allTokens.push(...activeTokens);
        }
      });

      if (allTokens.length === 0) {
        console.log("No active FCM tokens found for bulk send");
        return;
      }

      console.log(`📱 Found ${allTokens.length} active tokens`);

      // Process in batches
      await this.processBatch(allTokens, {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
      });

      console.log(`✅ Bulk push notifications sent`);
    } catch (error) {
      console.error("Send bulk push notifications error:", error);
      throw error;
    }
  }

  /**
   * Register FCM token for a user
   */
  async registerToken(
    userId: string,
    token: string,
    platform: "ios" | "android",
    deviceId: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if token already exists
      const existingTokenIndex = user.fcmTokens.findIndex(
        (t) => t.token === token
      );

      if (existingTokenIndex >= 0) {
        // Update existing token
        user.fcmTokens[existingTokenIndex].lastUsed = new Date();
        user.fcmTokens[existingTokenIndex].isActive = true;
        user.fcmTokens[existingTokenIndex].failureCount = 0;
      } else {
        // Add new token
        user.fcmTokens.push({
          token,
          platform,
          deviceId,
          registeredAt: new Date(),
          lastUsed: new Date(),
          isActive: true,
          failureCount: 0,
        });
      }

      await user.save();
      console.log(`✅ FCM token registered for user ${userId}`);
    } catch (error) {
      console.error("Register token error:", error);
      throw error;
    }
  }

  /**
   * Unregister FCM token
   */
  async unregisterToken(userId: string, token: string): Promise<void> {
    try {
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            fcmTokens: { token },
          },
        }
      );

      console.log(`✅ FCM token unregistered for user ${userId}`);
    } catch (error) {
      console.error("Unregister token error:", error);
      throw error;
    }
  }

  /**
   * Cleanup invalid tokens (called by cron job)
   */
  async cleanupInvalidTokens(): Promise<void> {
    try {
      console.log("🧹 Cleaning up invalid FCM tokens...");

      // Mark tokens with 3+ failures as inactive
      const result = await User.updateMany(
        { "fcmTokens.failureCount": { $gte: this.MAX_FAILURE_COUNT } },
        {
          $set: {
            "fcmTokens.$[elem].isActive": false,
          },
        },
        {
          arrayFilters: [
            { "elem.failureCount": { $gte: this.MAX_FAILURE_COUNT } },
          ],
        }
      );

      console.log(`✅ Marked ${result.modifiedCount} tokens as inactive`);

      // Remove tokens older than 90 days that haven't been used
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const cleanupResult = await User.updateMany(
        {},
        {
          $pull: {
            fcmTokens: {
              lastUsed: { $lt: ninetyDaysAgo },
              isActive: false,
            },
          },
        }
      );

      console.log(
        `✅ Removed ${cleanupResult.modifiedCount} old inactive tokens`
      );
    } catch (error) {
      console.error("Cleanup invalid tokens error:", error);
    }
  }

  /**
   * Send to FCM
   */
  private async sendToFCM(
    tokens: string[],
    payload: {
      notification: {
        title: string;
        body: string;
      };
      data: Record<string, string>;
    }
  ): Promise<FCMResponse> {
    try {
      if (tokens.length === 0) {
        return {
          successCount: 0,
          failureCount: 0,
          invalidTokens: [],
        };
      }

      const message = {
        notification: payload.notification,
        data: payload.data,
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // Track invalid tokens
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (
            error?.code === "messaging/invalid-registration-token" ||
            error?.code === "messaging/registration-token-not-registered"
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      // Update failure counts for invalid tokens
      if (invalidTokens.length > 0) {
        await this.incrementFailureCount(invalidTokens);
      }

      console.log(
        `📊 FCM Response: ${response.successCount} success, ${response.failureCount} failed`
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (error) {
      console.error("Send to FCM error:", error);
      throw error;
    }
  }

  /**
   * Process tokens in batches
   */
  private async processBatch(
    tokens: string[],
    payload: {
      notification: {
        title: string;
        body: string;
      };
      data: Record<string, string>;
    }
  ): Promise<void> {
    try {
      const totalBatches = Math.ceil(tokens.length / this.BATCH_SIZE);

      for (let i = 0; i < totalBatches; i++) {
        const start = i * this.BATCH_SIZE;
        const end = Math.min(start + this.BATCH_SIZE, tokens.length);
        const batch = tokens.slice(start, end);

        await this.sendToFCM(batch, payload);

        console.log(
          `📤 Processed batch ${i + 1}/${totalBatches} (${batch.length} tokens)`
        );

        // Rate limiting: 500 notifications per minute
        if (i < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      }
    } catch (error) {
      console.error("Process batch error:", error);
      throw error;
    }
  }

  /**
   * Increment failure count for invalid tokens
   */
  private async incrementFailureCount(tokens: string[]): Promise<void> {
    try {
      await User.updateMany(
        { "fcmTokens.token": { $in: tokens } },
        {
          $inc: {
            "fcmTokens.$[elem].failureCount": 1,
          },
        },
        {
          arrayFilters: [{ "elem.token": { $in: tokens } }],
        }
      );

      console.log(`⚠️  Incremented failure count for ${tokens.length} tokens`);
    } catch (error) {
      console.error("Increment failure count error:", error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
