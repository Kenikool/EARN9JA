import { User } from "../models/User";
import { Referral } from "../models/Referral";
import { walletService } from "./WalletService";
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
      `Referral commission from user earnings`
    );

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
