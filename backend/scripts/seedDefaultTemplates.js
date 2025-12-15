/**
 * Seed Default Message Templates
 *
 * This script creates default message templates for common scenarios:
 * - Welcome message
 * - Maintenance notice
 * - Payment confirmation
 * - Task approval notification
 * - Withdrawal processed
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { MessageTemplate } from "../src/models/MessageTemplate.js";
import { User } from "../src/models/User.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/earn9ja";

const defaultTemplates = [
  {
    name: "welcome_message",
    title: "Welcome to {{platform_name}}! 🎉",
    body: "Hi {{user_name}},\n\nWelcome to {{platform_name}}! We're excited to have you join our community.\n\nHere's what you can do:\n• Complete tasks and earn money\n• Refer friends and get bonuses\n• Withdraw your earnings anytime\n\nGet started by exploring available tasks in the app!\n\nBest regards,\nThe {{platform_name}} Team",
    variables: ["user_name", "platform_name"],
    targetAudience: {
      type: "all",
    },
  },
  {
    name: "maintenance_notice",
    title: "Scheduled Maintenance Notice ⚙️",
    body: "Dear {{user_name}},\n\nWe will be performing scheduled maintenance on {{maintenance_date}} from {{start_time}} to {{end_time}}.\n\nDuring this time:\n• The platform will be temporarily unavailable\n• All services will be paused\n• Your data and earnings are safe\n\nWe apologize for any inconvenience and appreciate your patience.\n\nThank you,\n{{platform_name}} Team",
    variables: [
      "user_name",
      "platform_name",
      "maintenance_date",
      "start_time",
      "end_time",
    ],
    targetAudience: {
      type: "all",
    },
  },
  {
    name: "payment_confirmation",
    title: "Payment Received! 💰",
    body: "Hi {{user_name}},\n\nGreat news! Your payment of ₦{{amount}} has been successfully processed.\n\nTransaction Details:\n• Amount: ₦{{amount}}\n• Date: {{transaction_date}}\n• Reference: {{transaction_ref}}\n\nYour new balance is ₦{{new_balance}}.\n\nThank you for using {{platform_name}}!\n\nBest regards,\nThe {{platform_name}} Team",
    variables: [
      "user_name",
      "amount",
      "transaction_date",
      "transaction_ref",
      "new_balance",
      "platform_name",
    ],
    targetAudience: {
      type: "filtered",
      filters: {
        roles: ["service_worker", "sponsor"],
      },
    },
  },
  {
    name: "task_approval",
    title: "Task Approved! ✅",
    body: "Congratulations {{user_name}}!\n\nYour task submission has been approved.\n\nTask: {{task_title}}\nReward: ₦{{reward}}\n\nThe reward has been credited to your wallet. Keep up the great work!\n\nComplete more tasks to earn more.\n\nBest regards,\n{{platform_name}} Team",
    variables: ["user_name", "task_title", "reward", "platform_name"],
    targetAudience: {
      type: "filtered",
      filters: {
        roles: ["service_worker"],
      },
    },
  },
  {
    name: "withdrawal_processed",
    title: "Withdrawal Processed! 💸",
    body: "Hi {{user_name}},\n\nYour withdrawal request has been processed successfully!\n\nWithdrawal Details:\n• Amount: ₦{{amount}}\n• Bank: {{bank_name}}\n• Account: {{account_number}}\n• Date: {{withdrawal_date}}\n• Reference: {{withdrawal_ref}}\n\nThe funds should arrive in your account within 24 hours.\n\nThank you for using {{platform_name}}!\n\nBest regards,\nThe {{platform_name}} Team",
    variables: [
      "user_name",
      "amount",
      "bank_name",
      "account_number",
      "withdrawal_date",
      "withdrawal_ref",
      "platform_name",
    ],
    targetAudience: {
      type: "filtered",
      filters: {
        roles: ["service_worker", "sponsor"],
      },
    },
  },
  {
    name: "kyc_approved",
    title: "KYC Verification Approved! ✅",
    body: "Hi {{user_name}},\n\nGreat news! Your KYC verification has been approved.\n\nYou can now:\n• Withdraw your earnings\n• Access all platform features\n• Increase your earning potential\n\nThank you for completing the verification process.\n\nBest regards,\n{{platform_name}} Team",
    variables: ["user_name", "platform_name"],
    targetAudience: {
      type: "filtered",
      filters: {
        kycVerified: true,
      },
    },
  },
  {
    name: "referral_bonus",
    title: "Referral Bonus Earned! 🎁",
    body: "Congratulations {{user_name}}!\n\nYou've earned a referral bonus of ₦{{bonus_amount}} for referring {{referred_user}}.\n\nYour referral stats:\n• Total referrals: {{total_referrals}}\n• Total earned: ₦{{total_earned}}\n\nKeep sharing your referral code to earn more!\n\nYour referral code: {{referral_code}}\n\nBest regards,\n{{platform_name}} Team",
    variables: [
      "user_name",
      "bonus_amount",
      "referred_user",
      "total_referrals",
      "total_earned",
      "referral_code",
      "platform_name",
    ],
    targetAudience: {
      type: "all",
    },
  },
];

async function seedTemplates() {
  try {
    console.log("🚀 Starting template seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find an admin user to set as creator
    let adminUser = await User.findOne({ roles: "admin" });

    if (!adminUser) {
      console.log("⚠️  No admin user found. Creating a system admin user...");

      // Create a system admin user for seeding purposes
      adminUser = new User({
        email: "system@earn9ja.site",
        phoneNumber: "+2340000000000",
        password: "$2a$10$dummyHashForSystemUser", // Dummy hash, this user can't login
        roles: ["admin"],
        profile: {
          firstName: "System",
          lastName: "Admin",
        },
        isActive: false, // Inactive so it can't be used for login
        emailVerified: true,
        phoneVerified: true,
      });

      await adminUser.save();
      console.log("✅ Created system admin user for template seeding");
    } else {
      console.log(`✅ Found admin user: ${adminUser.email}`);
    }

    // Seed templates
    let createdCount = 0;
    let skippedCount = 0;

    for (const templateData of defaultTemplates) {
      const existing = await MessageTemplate.findOne({
        name: templateData.name,
      });

      if (existing) {
        console.log(
          `ℹ️  Template "${templateData.name}" already exists, skipping...`
        );
        skippedCount++;
        continue;
      }

      const template = new MessageTemplate({
        ...templateData,
        createdBy: adminUser._id,
      });

      await template.save();
      console.log(`✅ Created template: ${templateData.name}`);
      createdCount++;
    }

    console.log("\n📊 Summary:");
    console.log(`   Created: ${createdCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${defaultTemplates.length}`);

    console.log("\n✨ Template seeding completed successfully!");
  } catch (error) {
    console.error("❌ Template seeding failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

// Run seeding
seedTemplates()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
