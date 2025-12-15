/**
 * Migration: Platform Settings Management
 *
 * This migration creates the necessary collections and indexes for:
 * - Platform Settings
 * - Settings Audit Log
 * - Bulk Messages
 * - Message Templates
 * - App Versions
 * - Version Check Logs
 * - FCM Tokens (User model update)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { PlatformSettings } from "../../src/models/PlatformSettings.js";
import { SettingsAuditLog } from "../../src/models/SettingsAuditLog.js";
import { BulkMessage } from "../../src/models/BulkMessage.js";
import { MessageTemplate } from "../../src/models/MessageTemplate.js";
import { AppVersion } from "../../src/models/AppVersion.js";
import { VersionCheckLog } from "../../src/models/VersionCheckLog.js";
import { User } from "../../src/models/User.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/earn9ja";

async function runMigration() {
  try {
    console.log("🚀 Starting Platform Settings Management migration...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Create PlatformSettings collection with default values
    console.log("\n📝 Creating PlatformSettings collection...");
    const existingSettings = await PlatformSettings.findOne();
    if (!existingSettings) {
      const defaultSettings = new PlatformSettings({
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
      await defaultSettings.save();
      console.log("✅ Default platform settings created");
    } else {
      console.log("ℹ️  Platform settings already exist, skipping...");
    }

    // 2. Create indexes for PlatformSettings
    console.log("\n📊 Creating indexes for PlatformSettings...");
    try {
      await PlatformSettings.collection.createIndex({ lastModified: -1 });
      console.log("✅ PlatformSettings indexes created");
    } catch (error) {
      if (error.code === 86) {
        console.log("ℹ️  PlatformSettings indexes already exist, skipping...");
      } else {
        throw error;
      }
    }

    // 3. Create indexes for SettingsAuditLog
    console.log("\n📊 Creating indexes for SettingsAuditLog...");
    try {
      await SettingsAuditLog.collection.createIndex({ timestamp: -1 });
      await SettingsAuditLog.collection.createIndex({
        settingKey: 1,
        timestamp: -1,
      });
      await SettingsAuditLog.collection.createIndex({
        changedBy: 1,
        timestamp: -1,
      });
      await SettingsAuditLog.collection.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days TTL
      );
      console.log("✅ SettingsAuditLog indexes created");
    } catch (error) {
      if (error.code === 86) {
        console.log("ℹ️  SettingsAuditLog indexes already exist, skipping...");
      } else {
        throw error;
      }
    }

    // 4. Create indexes for BulkMessage
    console.log("\n📊 Creating indexes for BulkMessage...");
    try {
      await BulkMessage.collection.createIndex({ status: 1, scheduledFor: 1 });
      await BulkMessage.collection.createIndex({ createdBy: 1, createdAt: -1 });
      await BulkMessage.collection.createIndex({ createdAt: -1 });
      console.log("✅ BulkMessage indexes created");
    } catch (error) {
      if (error.code === 86) {
        console.log("ℹ️  BulkMessage indexes already exist, skipping...");
      } else {
        throw error;
      }
    }

    // 5. Create indexes for MessageTemplate
    console.log("\n📊 Creating indexes for MessageTemplate...");
    try {
      await MessageTemplate.collection.createIndex({ createdBy: 1 });
      console.log("✅ MessageTemplate indexes created");
    } catch (error) {
      if (error.code === 86) {
        console.log("ℹ️  MessageTemplate indexes already exist, skipping...");
      } else {
        throw error;
      }
    }

    // 6. Create indexes for AppVersion
    console.log("\n📊 Creating indexes for AppVersion...");
    try {
      await AppVersion.collection.createIndex({ platform: 1, isActive: 1 });
      await AppVersion.collection.createIndex({
        platform: 1,
        latestVersion: 1,
      });
      console.log("✅ AppVersion indexes created");
    } catch (error) {
      if (error.code === 86) {
        console.log("ℹ️  AppVersion indexes already exist, skipping...");
      } else {
        throw error;
      }
    }

    // 7. Create indexes for VersionCheckLog
    console.log("\n📊 Creating indexes for VersionCheckLog...");
    try {
      await VersionCheckLog.collection.createIndex({
        userId: 1,
        timestamp: -1,
      });
      await VersionCheckLog.collection.createIndex({
        platform: 1,
        timestamp: -1,
      });
      await VersionCheckLog.collection.createIndex({
        currentVersion: 1,
        platform: 1,
      });
      await VersionCheckLog.collection.createIndex({ timestamp: -1 });
      await VersionCheckLog.collection.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days TTL
      );
      console.log("✅ VersionCheckLog indexes created");
    } catch (error) {
      if (error.code === 86) {
        console.log("ℹ️  VersionCheckLog indexes already exist, skipping...");
      } else {
        throw error;
      }
    }

    // 8. Create indexes for User FCM tokens
    console.log("\n📊 Creating indexes for User FCM tokens...");
    try {
      await User.collection.createIndex({ "fcmTokens.token": 1 });
      await User.collection.createIndex({ "fcmTokens.isActive": 1 });
      console.log("✅ User FCM token indexes created");
    } catch (error) {
      if (error.code === 86) {
        console.log("ℹ️  User FCM token indexes already exist, skipping...");
      } else {
        throw error;
      }
    }

    // 9. Migrate existing User fcmTokens from string[] to object[]
    console.log("\n🔄 Migrating existing User FCM tokens...");
    const usersWithOldTokens = await User.find({
      fcmTokens: { $exists: true, $type: "array" },
    });

    let migratedCount = 0;
    for (const user of usersWithOldTokens) {
      // Check if fcmTokens is an array of strings (old format)
      if (user.fcmTokens.length > 0 && typeof user.fcmTokens[0] === "string") {
        const newTokens = user.fcmTokens.map((token) => ({
          token,
          platform: "android", // Default to android for existing tokens
          deviceId: `migrated-${Date.now()}`,
          registeredAt: new Date(),
          lastUsed: new Date(),
          isActive: true,
          failureCount: 0,
        }));

        await User.updateOne(
          { _id: user._id },
          { $set: { fcmTokens: newTokens } }
        );
        migratedCount++;
      }
    }
    console.log(`✅ Migrated ${migratedCount} users with old FCM token format`);

    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
