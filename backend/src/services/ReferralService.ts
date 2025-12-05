import { User } from "../models/User.js";
import { Referral } from "../models/Referral.js";
import { walletService } from "./WalletService.js";
import crypto from "crypto";

export class ReferralService {
  /**
   * Generate a unique referral code for a user
   */
  static async generateReferralCode(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has a referral code
    if (user.referralCode) {
      return user.referralCode;
    }

    // Generate unique code
    let referralCode: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate 8-character alphanumeric code
      referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

      // Check if code already exists
      const existing = await User.findOne({ referralCode });
      if (!existing) {
        isUnique = true;
      }
    }

    // Save referral code to user
    user.referralCode = referralCode!;
    await user.save();

    return referralCode!;
  }

  /**
   * Apply referral code during registration
   */
  static async applyReferralCode(
    newUserId: string,
    referralCode: string
  ): Promise<void> {
    // Find referrer by code
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      throw new Error("Invalid referral code");
    }

    // Check if user is trying to refer themselves
    if (referrer._id.toString() === newUserId) {
      throw new Error("Cannot refer yourself");
    }

    // Check if user was already referred
    const existingReferral = await Referral.findOne({
      referredUserId: newUserId,
    });
    if (existingReferral) {
      throw new Error("User already referred by someone");
    }

    // Create referral record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const referral = new Referral({
      referrerId: referrer._id,
      referredUserId: newUserId,
      referralCode,
      status: "pending",
      commissionRate: 5, // 5%
      commissionPeriodDays: 30,
      expiresAt,
    });

    await referral.save();

    // Update referred user
    const newUser = await User.findById(newUserId);
    if (newUser) {
      newUser.referredBy = referralCode;
      await newUser.save();
    }

    console.log(
      `✅ Referral created: ${referrer.profile.firstName} referred user ${newUserId}`
    );
  }

  /**
   * Activate referral when referred user completes first task
   */
  static async activateReferral(userId: string): Promise<void> {
    const referral = await Referral.findOne({
      referredUserId: userId,
      status: "pending",
    });

    if (!referral) {
      return; // No pending referral
    }

    referral.status = "active";
    referral.activatedAt = new Date();
    await referral.save();

    console.log(`✅ Referral activated for user ${userId}`);
  }

  /**
   * Track task completion and award conditional bonuses
   * Awards ₦20 to both referrer and referee after 5 completed tasks
   */
  static async trackTaskCompletion(userId: string): Promise<void> {
    const referral = await Referral.findOne({
      referredUserId: userId,
      status: "active",
    });

    if (!referral) {
      return; // No active referral
    }

    // Import TaskSubmission model to count completed tasks
    const { TaskSubmission } = await import("../models/TaskSubmission.js");

    const completedTasksCount = await TaskSubmission.countDocuments({
      workerId: userId,
      status: "approved",
    });

    // Award bonuses after 5 completed tasks (one-time only)
    if (completedTasksCount === 5 && referral.totalCommission === 0) {
      const REFERRAL_BONUS = 20; // ₦20 for each party

      // Award ₦20 to referrer
      await walletService.credit(
        referral.referrerId.toString(),
        REFERRAL_BONUS,
        "referral_bonus",
        `Referral bonus: Your referee completed 5 tasks!`,
        { referredUserId: userId, milestone: "5_tasks" }
      );

      // Award ₦20 to referee
      await walletService.credit(
        userId,
        REFERRAL_BONUS,
        "referral_bonus",
        `Referral bonus: You completed 5 tasks!`,
        { referrerId: referral.referrerId.toString(), milestone: "5_tasks" }
      );

      // Update referral record
      referral.totalCommission = REFERRAL_BONUS * 2; // Track total bonuses awarded
      await referral.save();

      console.log(
        `✅ Referral bonuses awarded: ₦${REFERRAL_BONUS} each to referrer and referee`
      );

      // Send notifications
      try {
        const { NotificationHelpers } = await import(
          "./NotificationHelpers.js"
        );
        await NotificationHelpers.notifyReferralBonus(
          referral.referrerId.toString(),
          "Your referee",
          REFERRAL_BONUS,
          "completed 5 tasks"
        );
        await NotificationHelpers.notifyReferralBonus(
          userId,
          "You",
          REFERRAL_BONUS,
          "completed 5 tasks"
        );
      } catch (error) {
        console.error("Failed to send referral bonus notifications:", error);
      }
    }
  }

  /**
   * Process commission when referred user earns
   */
  static async processCommission(
    userId: string,
    earningAmount: number
  ): Promise<void> {
    const referral = await Referral.findOne({
      referredUserId: userId,
      status: "active",
    });

    if (!referral) {
      return; // No referral found
    }

    // Check if referral is active
    const isActive =
      referral.status === "active" &&
      referral.expiresAt > new Date() &&
      referral.activatedAt !== undefined;

    if (!isActive) {
      return; // No active referral
    }

    // Calculate commission
    const commission = (earningAmount * referral.commissionRate) / 100;
    if (commission <= 0) {
      return;
    }

    // Credit commission to referrer's wallet
    await walletService.credit(
      referral.referrerId.toString(),
      commission,
      "referral_bonus",
      `Referral commission from user earnings`,
      { referredUserId: userId, earningAmount }
    );

    // Notify referrer about bonus
    try {
      const { NotificationHelpers } = await import("./NotificationHelpers.js");
      const { User } = await import("../models/User.js");
      const referredUser = await User.findById(userId);
      const referredName = referredUser?.profile?.firstName || "Your referral";

      await NotificationHelpers.notifyReferralBonus(
        referral.referrerId.toString(),
        referredName,
        commission,
        "completed a task"
      );
    } catch (error) {
      console.log("Failed to send referral bonus notification:", error);
    }

    // Update referral stats
    referral.totalEarnings += earningAmount;
    referral.totalCommission += commission;
    await referral.save();

    console.log(
      `💰 Referral commission: ₦${commission} credited to ${referral.referrerId}`
    );
  }

  /**
   * Expire old referrals
   */
  static async expireReferrals(): Promise<void> {
    const now = new Date();

    const result = await Referral.updateMany(
      {
        status: "active",
        expiresAt: { $lt: now },
      },
      {
        $set: { status: "expired" },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ Expired ${result.modifiedCount} referrals`);
    }
  }

  /**
   * Get referral statistics for a user
   */
  static async getReferralStats(userId: string): Promise<{
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
    totalCommission: number;
    referrals: Array<{
      userId: string;
      name: string;
      avatar?: string;
      status: string;
      earnings: number;
      commission: number;
      joinedAt: Date;
      expiresAt: Date;
    }>;
  }> {
    // Get or generate referral code
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = await this.generateReferralCode(userId);
    }

    // Get all referrals
    const referrals = await Referral.find({ referrerId: userId })
      .populate("referredUserId", "profile")
      .sort({ createdAt: -1 });

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(
      (r) => r.status === "active"
    ).length;
    const totalCommission = referrals.reduce(
      (sum, r) => sum + r.totalCommission,
      0
    );

    const referralsList = referrals.map((r: any) => ({
      userId: r.referredUserId._id.toString(),
      name: `${r.referredUserId.profile.firstName} ${r.referredUserId.profile.lastName}`,
      avatar: r.referredUserId.profile.avatar,
      status: r.status,
      earnings: r.totalEarnings,
      commission: r.totalCommission,
      joinedAt: r.createdAt,
      expiresAt: r.expiresAt,
    }));

    return {
      referralCode,
      totalReferrals,
      activeReferrals,
      totalCommission,
      referrals: referralsList,
    };
  }

  /**
   * Validate referral code
   */
  static async validateReferralCode(referralCode: string): Promise<boolean> {
    const user = await User.findOne({ referralCode });
    return !!user;
  }

  /**
   * Get referrer information
   */
  static async getReferrerInfo(referralCode: string): Promise<{
    name: string;
    avatar?: string;
    totalReferrals: number;
  } | null> {
    const user = await User.findOne({ referralCode });
    if (!user) {
      return null;
    }

    const totalReferrals = await Referral.countDocuments({
      referrerId: user._id,
    });

    return {
      name: `${user.profile.firstName} ${user.profile.lastName}`,
      avatar: user.profile.avatar,
      totalReferrals,
    };
  }
}
