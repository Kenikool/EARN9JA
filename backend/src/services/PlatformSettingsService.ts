import {
  PlatformSettings,
  IPlatformSettings,
} from "../models/PlatformSettings.js";
import { SettingsAuditLog } from "../models/SettingsAuditLog.js";
import { User } from "../models/User.js";
import { pushNotificationService } from "./PushNotificationService.js";
import Redis from "redis";

const CACHE_KEY = "platform:settings:v1";
const CACHE_TTL = 300; // 5 minutes

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface AuditFilters {
  settingKey?: string;
  changedBy?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

class PlatformSettingsService {
  private redisClient: any;

  constructor() {
    // Initialize Redis client if available
    if (process.env.REDIS_URL) {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL,
      });
      this.redisClient.connect().catch((err: any) => {
        console.error("Redis connection error:", err);
        this.redisClient = null;
      });
    }
  }

  /**
   * Get platform settings (with caching)
   */
  async getSettings(): Promise<IPlatformSettings> {
    try {
      // Try to get from cache first
      if (this.redisClient) {
        try {
          const cached = await this.redisClient.get(CACHE_KEY);
          if (cached) {
            console.log("📦 Settings retrieved from cache");
            return JSON.parse(cached);
          }
        } catch (cacheError) {
          console.error("Cache read error:", cacheError);
        }
      }

      // Get from database
      let settings = await PlatformSettings.findOne();

      // Create default settings if none exist
      if (!settings) {
        console.log("Creating default platform settings...");
        settings = new PlatformSettings({
          financial: {
            minimumWithdrawal: 1000,
            platformCommissionRate: 10,
            referralBonusAmount: 100,
            minimumTaskReward: 50,
          },
          userLimits: {
            maxActiveTasksPerUser: 10,
            maxSubmissionsPerTask: 100,
            dailySpinLimit: 3,
          },
          operational: {
            maintenanceMode: false,
            registrationEnabled: true,
            kycRequired: true,
          },
          taskManagement: {
            approvalAutoTimeoutDays: 7,
            maxTaskDurationDays: 30,
          },
          version: 1,
        });
        await settings.save();
      }

      // Cache the settings
      if (this.redisClient) {
        try {
          await this.redisClient.setEx(
            CACHE_KEY,
            CACHE_TTL,
            JSON.stringify(settings)
          );
          console.log("💾 Settings cached");
        } catch (cacheError) {
          console.error("Cache write error:", cacheError);
        }
      }

      return settings;
    } catch (error) {
      console.error("Get settings error:", error);
      throw new Error("Failed to retrieve platform settings");
    }
  }

  /**
   * Update platform settings with validation and audit logging
   */
  async updateSettings(
    updates: Partial<IPlatformSettings>,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    try {
      // Get current settings
      const currentSettings = await this.getSettings();

      // Validate updates
      const validation = this.validateSettings(updates);
      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${validation.errors
            .map((e) => e.message)
            .join(", ")}`
        );
      }

      // Get admin details for audit log
      const admin = await User.findById(adminId);
      if (!admin) {
        throw new Error("Admin user not found");
      }

      const adminName = `${admin.profile.firstName} ${admin.profile.lastName}`;

      // Track changes for audit log
      const changes: Array<{
        key: string;
        oldValue: any;
        newValue: any;
      }> = [];

      // Process financial updates
      if (updates.financial) {
        Object.keys(updates.financial).forEach((key) => {
          const oldValue = (currentSettings.financial as any)[key];
          const newValue = (updates.financial as any)[key];
          if (oldValue !== newValue) {
            changes.push({
              key: `financial.${key}`,
              oldValue,
              newValue,
            });
          }
        });
      }

      // Process userLimits updates
      if (updates.userLimits) {
        Object.keys(updates.userLimits).forEach((key) => {
          const oldValue = (currentSettings.userLimits as any)[key];
          const newValue = (updates.userLimits as any)[key];
          if (oldValue !== newValue) {
            changes.push({
              key: `userLimits.${key}`,
              oldValue,
              newValue,
            });
          }
        });
      }

      // Process operational updates
      if (updates.operational) {
        Object.keys(updates.operational).forEach((key) => {
          const oldValue = (currentSettings.operational as any)[key];
          const newValue = (updates.operational as any)[key];
          if (oldValue !== newValue) {
            changes.push({
              key: `operational.${key}`,
              oldValue,
              newValue,
            });
          }
        });
      }

      // Process taskManagement updates
      if (updates.taskManagement) {
        Object.keys(updates.taskManagement).forEach((key) => {
          const oldValue = (currentSettings.taskManagement as any)[key];
          const newValue = (updates.taskManagement as any)[key];
          if (oldValue !== newValue) {
            changes.push({
              key: `taskManagement.${key}`,
              oldValue,
              newValue,
            });
          }
        });
      }

      // Update settings in database
      const updateData: any = {};
      if (updates.financial) {
        Object.keys(updates.financial).forEach((key) => {
          updateData[`financial.${key}`] = (updates.financial as any)[key];
        });
      }
      if (updates.userLimits) {
        Object.keys(updates.userLimits).forEach((key) => {
          updateData[`userLimits.${key}`] = (updates.userLimits as any)[key];
        });
      }
      if (updates.operational) {
        Object.keys(updates.operational).forEach((key) => {
          updateData[`operational.${key}`] = (updates.operational as any)[key];
        });
      }
      if (updates.taskManagement) {
        Object.keys(updates.taskManagement).forEach((key) => {
          updateData[`taskManagement.${key}`] = (updates.taskManagement as any)[
            key
          ];
        });
      }

      updateData.lastModified = new Date();
      updateData.lastModifiedBy = adminId;
      updateData.$inc = { version: 1 };

      await PlatformSettings.updateOne({}, updateData);

      // Create audit log entries for each change
      const auditPromises = changes.map((change) =>
        SettingsAuditLog.create({
          settingKey: change.key,
          oldValue: change.oldValue,
          newValue: change.newValue,
          changedBy: adminId,
          changedByName: adminName,
          timestamp: new Date(),
          ipAddress,
          userAgent,
        })
      );

      await Promise.all(auditPromises);

      // Invalidate cache
      await this.invalidateCache();

      // Send push notifications to all users about critical setting changes
      await this.notifyUsersOfChanges(changes);

      console.log(
        `✅ Settings updated by ${adminName} (${changes.length} changes)`
      );
    } catch (error) {
      console.error("Update settings error:", error);
      throw error;
    }
  }

  /**
   * Reset settings to default values
   */
  async resetToDefaults(
    settingKeys: string[],
    adminId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    try {
      const defaults: any = {
        "financial.minimumWithdrawal": 1000,
        "financial.platformCommissionRate": 10,
        "financial.referralBonusAmount": 100,
        "financial.minimumTaskReward": 50,
        "userLimits.maxActiveTasksPerUser": 10,
        "userLimits.maxSubmissionsPerTask": 100,
        "userLimits.dailySpinLimit": 3,
        "operational.maintenanceMode": false,
        "operational.registrationEnabled": true,
        "operational.kycRequired": true,
        "taskManagement.approvalAutoTimeoutDays": 7,
        "taskManagement.maxTaskDurationDays": 30,
      };

      const currentSettings = await this.getSettings();
      const admin = await User.findById(adminId);
      if (!admin) {
        throw new Error("Admin user not found");
      }

      const adminName = `${admin.profile.firstName} ${admin.profile.lastName}`;

      // Build update object
      const updateData: any = {};
      const auditLogs: any[] = [];

      for (const key of settingKeys) {
        if (defaults[key] !== undefined) {
          const parts = key.split(".");
          const category = parts[0];
          const field = parts[1];

          const oldValue = (currentSettings as any)[category][field];
          const newValue = defaults[key];

          updateData[key] = newValue;

          auditLogs.push({
            settingKey: key,
            oldValue,
            newValue,
            changedBy: adminId,
            changedByName: adminName,
            timestamp: new Date(),
            ipAddress,
            userAgent,
          });
        }
      }

      updateData.lastModified = new Date();
      updateData.lastModifiedBy = adminId;
      updateData.$inc = { version: 1 };

      // Update database
      await PlatformSettings.updateOne({}, updateData);

      // Create audit logs
      await SettingsAuditLog.insertMany(auditLogs);

      // Invalidate cache
      await this.invalidateCache();

      // Notify users of the reset
      await this.notifyUsersOfChanges(
        auditLogs.map((log: any) => ({
          key: log.settingKey,
          oldValue: log.oldValue,
          newValue: log.newValue,
        }))
      );

      console.log(`✅ Reset ${settingKeys.length} settings to defaults`);
    } catch (error) {
      console.error("Reset settings error:", error);
      throw error;
    }
  }

  /**
   * Get audit log with filters
   */
  async getAuditLog(filters: AuditFilters): Promise<{
    logs: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      if (filters.settingKey) {
        query.settingKey = filters.settingKey;
      }

      if (filters.changedBy) {
        query.changedBy = filters.changedBy;
      }

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.timestamp.$lte = filters.endDate;
        }
      }

      // Get logs
      const logs = await SettingsAuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate("changedBy", "profile.firstName profile.lastName email")
        .lean();

      const total = await SettingsAuditLog.countDocuments(query);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Get audit log error:", error);
      throw new Error("Failed to retrieve audit log");
    }
  }

  /**
   * Validate settings updates
   */
  private validateSettings(
    settings: Partial<IPlatformSettings>
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate financial settings
    if (settings.financial) {
      if (
        settings.financial.minimumWithdrawal !== undefined &&
        settings.financial.minimumWithdrawal < 100
      ) {
        errors.push({
          field: "financial.minimumWithdrawal",
          message: "Minimum withdrawal must be at least ₦100",
        });
      }

      if (
        settings.financial.platformCommissionRate !== undefined &&
        (settings.financial.platformCommissionRate < 0 ||
          settings.financial.platformCommissionRate > 50)
      ) {
        errors.push({
          field: "financial.platformCommissionRate",
          message: "Commission rate must be between 0% and 50%",
        });
      }

      if (
        settings.financial.referralBonusAmount !== undefined &&
        settings.financial.referralBonusAmount < 0
      ) {
        errors.push({
          field: "financial.referralBonusAmount",
          message: "Referral bonus must be non-negative",
        });
      }

      if (
        settings.financial.minimumTaskReward !== undefined &&
        settings.financial.minimumTaskReward < 10
      ) {
        errors.push({
          field: "financial.minimumTaskReward",
          message: "Minimum task reward must be at least ₦10",
        });
      }
    }

    // Validate user limits
    if (settings.userLimits) {
      if (
        settings.userLimits.maxActiveTasksPerUser !== undefined &&
        (settings.userLimits.maxActiveTasksPerUser < 1 ||
          settings.userLimits.maxActiveTasksPerUser > 100)
      ) {
        errors.push({
          field: "userLimits.maxActiveTasksPerUser",
          message: "Max active tasks per user must be between 1 and 100",
        });
      }

      if (
        settings.userLimits.maxSubmissionsPerTask !== undefined &&
        settings.userLimits.maxSubmissionsPerTask < 1
      ) {
        errors.push({
          field: "userLimits.maxSubmissionsPerTask",
          message: "Max submissions per task must be at least 1",
        });
      }

      if (
        settings.userLimits.dailySpinLimit !== undefined &&
        settings.userLimits.dailySpinLimit < 0
      ) {
        errors.push({
          field: "userLimits.dailySpinLimit",
          message: "Daily spin limit must be non-negative",
        });
      }
    }

    // Validate task management
    if (settings.taskManagement) {
      if (
        settings.taskManagement.approvalAutoTimeoutDays !== undefined &&
        (settings.taskManagement.approvalAutoTimeoutDays < 1 ||
          settings.taskManagement.approvalAutoTimeoutDays > 30)
      ) {
        errors.push({
          field: "taskManagement.approvalAutoTimeoutDays",
          message: "Approval timeout must be between 1 and 30 days",
        });
      }

      if (
        settings.taskManagement.maxTaskDurationDays !== undefined &&
        (settings.taskManagement.maxTaskDurationDays < 1 ||
          settings.taskManagement.maxTaskDurationDays > 365)
      ) {
        errors.push({
          field: "taskManagement.maxTaskDurationDays",
          message: "Max task duration must be between 1 and 365 days",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Invalidate settings cache
   */
  private async invalidateCache(): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.del(CACHE_KEY);
        console.log("🗑️  Settings cache invalidated");
      } catch (error) {
        console.error("Cache invalidation error:", error);
      }
    }
  }

  /**
   * Notify users of critical setting changes
   */
  private async notifyUsersOfChanges(
    changes: Array<{ key: string; oldValue: any; newValue: any }>
  ): Promise<void> {
    try {
      // Define which settings should trigger notifications
      const criticalSettings = [
        "operational.maintenanceMode",
        "operational.registrationEnabled",
        "operational.kycRequired",
        "financial.minimumWithdrawal",
        "financial.platformCommissionRate",
      ];

      // Check if any critical settings changed
      const criticalChanges = changes.filter((change) =>
        criticalSettings.includes(change.key)
      );

      if (criticalChanges.length === 0) {
        console.log("No critical settings changed, skipping notifications");
        return;
      }

      // Get all active users
      const users = await User.find({ isActive: true }).select("_id");
      const userIds = users.map((u) => u._id.toString());

      if (userIds.length === 0) {
        console.log("No active users to notify");
        return;
      }

      // Build notification message based on changes
      let notificationTitle = "Platform Settings Updated";
      let notificationBody = "";

      for (const change of criticalChanges) {
        if (change.key === "operational.maintenanceMode") {
          if (change.newValue === true) {
            notificationTitle = "⚠️ Maintenance Mode Enabled";
            notificationBody =
              "The platform is entering maintenance mode. Service may be temporarily unavailable.";
          } else {
            notificationTitle = "✅ Maintenance Complete";
            notificationBody =
              "The platform is now back online. Thank you for your patience!";
          }
        } else if (change.key === "operational.registrationEnabled") {
          if (change.newValue === false) {
            notificationTitle = "Registration Temporarily Disabled";
            notificationBody =
              "New user registrations have been temporarily disabled.";
          }
        } else if (change.key === "financial.minimumWithdrawal") {
          notificationTitle = "Withdrawal Limit Updated";
          notificationBody = `Minimum withdrawal amount has been updated to ₦${change.newValue}`;
        } else if (change.key === "financial.platformCommissionRate") {
          notificationTitle = "Commission Rate Updated";
          notificationBody = `Platform commission rate has been updated to ${change.newValue}%`;
        } else if (change.key === "operational.kycRequired") {
          if (change.newValue === true) {
            notificationTitle = "KYC Verification Required";
            notificationBody =
              "KYC verification is now required for withdrawals. Please complete your verification.";
          }
        }
      }

      // Send bulk notification
      await pushNotificationService.sendBulkPushNotifications(
        {
          title: notificationTitle,
          body: notificationBody,
          data: {
            type: "settings_update",
            changes: JSON.stringify(criticalChanges),
          },
        },
        userIds
      );

      console.log(
        `📢 Sent notifications to ${userIds.length} users about ${criticalChanges.length} critical changes`
      );
    } catch (error) {
      console.error("Notify users of changes error:", error);
      // Don't throw - notifications are not critical to the update process
    }
  }
}

export const platformSettingsService = new PlatformSettingsService();
