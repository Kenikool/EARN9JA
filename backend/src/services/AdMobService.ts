import mongoose from "mongoose";
import { AdMobReward, IAdMobReward } from "../models/AdMobReward";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { Transaction } from "../models/Transaction";
import { FinancialTransaction } from "../models/FinancialTransaction";

interface AdWatchRequest {
  userId: string;
  taskId: string;
  platform: "ios" | "android";
  deviceId: string;
  ipAddress: string;
  timestamp: string;
  metadata?: {
    adUnitId?: string;
    adNetwork?: string;
    adType?: string;
    sessionId?: string;
  };
}

interface AdWatchResponse {
  success: boolean;
  reward?: number;
  newBalance?: number;
  transactionId?: string;
  error?: string;
  fraudScore?: number;
}

interface FraudCheckResult {
  passed: boolean;
  score: number;
  reasons: string[];
}

export class AdMobService {
  private readonly MAX_ADS_PER_DAY: number;
  private readonly FRAUD_CHECK_WINDOW: number;
  private readonly RAPID_WATCH_THRESHOLD = 60000; // 1 minute
  private readonly MAX_DEVICES_PER_USER = 3;
  private readonly MAX_IPS_PER_USER = 5;

  // Expected AdMob revenue per ad view in Nigeria (eCPM)
  private readonly EXPECTED_ADMOB_REVENUE = 0.8;

  // Profitable tiered reward system
  // With eCPM of ₦0.80, these rewards ensure ₦0.20-₦0.25 profit per ad
  private readonly REWARD_TIERS = [
    { min: 1, max: 20, amount: 0.6 }, // First 20 ads: ₦0.60 each (₦0.20 profit per ad)
    { min: 21, max: 50, amount: 0.55 }, // Next 30 ads: ₦0.55 each (₦0.25 profit per ad)
  ];

  constructor() {
    this.MAX_ADS_PER_DAY = parseInt(
      process.env.ADMOB_MAX_ADS_PER_DAY || "50",
      10
    );
    this.FRAUD_CHECK_WINDOW = parseInt(
      process.env.ADMOB_FRAUD_CHECK_WINDOW || "60000",
      10
    );
  }

  async processAdReward(request: AdWatchRequest): Promise<AdWatchResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate user exists
      const user = await User.findById(request.userId).session(session);
      if (!user) {
        await session.abortTransaction();
        return { success: false, error: "User not found" };
      }

      if (user.status !== "active") {
        await session.abortTransaction();
        return { success: false, error: "User account is not active" };
      }

      // Enhanced fraud detection using FraudDetectionService
      const { FraudDetectionService } = await import(
        "./FraudDetectionService.js"
      );
      const comprehensiveFraudCheck =
        await FraudDetectionService.comprehensiveCheck(request.userId, {
          action: "ad_watch",
          deviceId: request.deviceId,
          ipAddress: request.ipAddress,
        });

      if (comprehensiveFraudCheck.isFraudulent) {
        await FraudDetectionService.logFraudAttempt(
          request.userId,
          "ad_watch",
          comprehensiveFraudCheck
        );
        await session.abortTransaction();
        return {
          success: false,
          error: "Ad watch flagged for review. Please contact support.",
          fraudScore: comprehensiveFraudCheck.riskScore,
        };
      }

      // Perform basic fraud detection checks
      const fraudCheck = await this.performFraudChecks(request);
      if (!fraudCheck.passed) {
        await session.abortTransaction();
        return {
          success: false,
          error: fraudCheck.reasons.join(". "),
          fraudScore: fraudCheck.score,
        };
      }

      // Check daily limit
      const todayCount = await this.getTodayAdCount(request.userId);
      if (todayCount >= this.MAX_ADS_PER_DAY) {
        await session.abortTransaction();
        return {
          success: false,
          error: `Daily limit reached (${this.MAX_ADS_PER_DAY} ads per day)`,
        };
      }

      // Calculate reward based on tier
      const rewardAmount = this.calculateRewardAmount(todayCount);

      // Validate profit margin
      const profitMargin = this.EXPECTED_ADMOB_REVENUE - rewardAmount;
      if (profitMargin < 0) {
        await session.abortTransaction();
        return {
          success: false,
          error: "Reward calculation error. Please contact support.",
        };
      }

      // Get or create wallet
      let wallet = await Wallet.findOne({ userId: request.userId }).session(
        session
      );
      if (!wallet) {
        const wallets = await Wallet.create(
          [
            {
              userId: request.userId,
              availableBalance: 0,
              pendingBalance: 0,
              escrowBalance: 0,
              lifetimeEarnings: 0,
              lifetimeSpending: 0,
              currency: "NGN",
            },
          ],
          { session }
        );
        wallet = wallets[0];

        // Update user with wallet reference
        user.walletId = wallet._id;
        await user.save({ session });
      }

      // Ensure wallet exists (TypeScript null check)
      if (!wallet) {
        await session.abortTransaction();
        return { success: false, error: "Failed to create wallet" };
      }

      // Create reward record
      const reward = await AdMobReward.create(
        [
          {
            userId: request.userId,
            taskId: request.taskId,
            reward: rewardAmount,
            platform: request.platform,
            deviceId: request.deviceId,
            ipAddress: request.ipAddress,
            timestamp: new Date(request.timestamp),
            verified: true,
            fraudScore: fraudCheck.score,
            metadata: request.metadata || {},
          },
        ],
        { session }
      ).then((rewards) => rewards[0]);

      // Create transaction and credit wallet
      const balanceBefore = wallet.availableBalance;
      wallet.availableBalance += rewardAmount;
      wallet.lifetimeEarnings += rewardAmount;
      const balanceAfter = wallet.availableBalance;

      const transaction = await Transaction.create(
        [
          {
            walletId: wallet._id,
            userId: request.userId,
            type: "admob_reward",
            amount: rewardAmount,
            balanceBefore,
            balanceAfter,
            status: "completed",
            description: `AdMob reward for watching ad (Ad #${todayCount + 1})`,
            referenceId: reward._id.toString(),
            referenceType: "AdMobReward",
            metadata: {
              platform: request.platform,
              deviceId: request.deviceId,
              fraudScore: fraudCheck.score,
              adNumber: todayCount + 1,
              tier: this.getTierName(todayCount + 1),
            },
            completedAt: new Date(),
          },
        ],
        { session }
      ).then((transactions) => transactions[0]);

      // Update reward with transaction reference
      reward.transactionId = transaction._id;
      await reward.save({ session });

      // Save wallet
      await wallet.save({ session });

      // Log financial transactions for monitoring
      // profitMargin was already calculated earlier for validation

      // Log ad revenue (what we expect to earn from AdMob)
      await FinancialTransaction.create(
        [
          {
            type: "ad_revenue",
            amount: this.EXPECTED_ADMOB_REVENUE,
            userId: request.userId,
            description: `AdMob revenue for ad #${todayCount + 1}`,
            metadata: {
              adNumber: todayCount + 1,
              platform: request.platform,
              deviceId: request.deviceId,
              rewardId: reward._id.toString(),
            },
          },
        ],
        { session }
      );

      // Log ad expense (what we paid to the user)
      await FinancialTransaction.create(
        [
          {
            type: "ad_expense",
            amount: rewardAmount,
            userId: request.userId,
            description: `Ad reward payment for ad #${todayCount + 1}`,
            metadata: {
              adNumber: todayCount + 1,
              tier: this.getTierName(todayCount + 1),
              profitMargin,
              transactionId: transaction._id.toString(),
              rewardId: reward._id.toString(),
            },
          },
        ],
        { session }
      );

      // Update user device and IP tracking
      if (!user.deviceIds.includes(request.deviceId)) {
        user.deviceIds.push(request.deviceId);
      }
      if (!user.ipAddresses.includes(request.ipAddress)) {
        user.ipAddresses.push(request.ipAddress);
      }
      await user.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return {
        success: true,
        reward: rewardAmount,
        newBalance: balanceAfter,
        transactionId: transaction._id.toString(),
        fraudScore: fraudCheck.score,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Error processing AdMob reward:", error);
      return {
        success: false,
        error: "Failed to process reward. Please try again.",
      };
    } finally {
      session.endSession();
    }
  }

  private async performFraudChecks(
    request: AdWatchRequest
  ): Promise<FraudCheckResult> {
    const reasons: string[] = [];
    let score = 0;

    // Check 1: Rapid successive ad watches
    const lastReward = await AdMobReward.findOne({
      userId: request.userId,
    }).sort({ timestamp: -1 });

    if (lastReward) {
      const timeSinceLastWatch =
        new Date(request.timestamp).getTime() - lastReward.timestamp.getTime();
      if (timeSinceLastWatch < this.RAPID_WATCH_THRESHOLD) {
        score += 40;
        reasons.push("Please wait before watching another ad");
      }
    }

    // Check 2: Multiple devices
    const deviceCount = await AdMobReward.distinct("deviceId", {
      userId: request.userId,
    });
    if (deviceCount.length > this.MAX_DEVICES_PER_USER) {
      score += 30;
      reasons.push("Suspicious activity: Multiple devices detected");
    }

    // Check 3: Multiple IP addresses
    const ipCount = await AdMobReward.distinct("ipAddress", {
      userId: request.userId,
    });
    if (ipCount.length > this.MAX_IPS_PER_USER) {
      score += 20;
      reasons.push("Suspicious activity: Multiple IP addresses detected");
    }

    // Check 4: Unusual pattern - too many ads in short time
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await AdMobReward.countDocuments({
      userId: request.userId,
      timestamp: { $gte: last24Hours },
    });

    if (recentCount >= this.MAX_ADS_PER_DAY) {
      score += 50;
      reasons.push("Daily limit reached");
    }

    // Check 5: Device/IP mismatch patterns
    const recentRewards = await AdMobReward.find({
      userId: request.userId,
      timestamp: { $gte: last24Hours },
    }).limit(10);

    const uniqueDeviceIpPairs = new Set(
      recentRewards.map((r) => `${r.deviceId}:${r.ipAddress}`)
    );
    if (uniqueDeviceIpPairs.size > 5) {
      score += 25;
      reasons.push("Suspicious activity: Inconsistent device/IP patterns");
    }

    const passed = score < 50; // Threshold for blocking

    return {
      passed,
      score,
      reasons,
    };
  }

  private async getTodayAdCount(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const count = await AdMobReward.countDocuments({
      userId,
      createdAt: { $gte: startOfDay },
    });

    return count;
  }

  async getAdStats(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayRewards = await AdMobReward.find({
      userId,
      createdAt: { $gte: startOfDay },
    });

    const allRewards = await AdMobReward.find({ userId });

    const todayCount = todayRewards.length;
    const todayEarnings = todayRewards.reduce((sum, r) => sum + r.reward, 0);
    const totalEarnings = allRewards.reduce((sum, r) => sum + r.reward, 0);
    const nextReward = this.getNextRewardAmount(todayCount);
    const currentTier = this.getTierName(todayCount + 1);

    return {
      todayCount,
      remainingToday: Math.max(0, this.MAX_ADS_PER_DAY - todayCount),
      todayEarnings,
      totalEarnings,
      maxAdsPerDay: this.MAX_ADS_PER_DAY,
      nextReward,
      currentTier,
      tiers: this.REWARD_TIERS,
    };
  }
  /**
   * Calculate reward amount based on how many ads the user has watched today
   */
  private calculateRewardAmount(todayCount: number): number {
    const adNumber = todayCount + 1; // Next ad number

    for (const tier of this.REWARD_TIERS) {
      if (adNumber >= tier.min && adNumber <= tier.max) {
        return tier.amount;
      }
    }

    // Default to lowest tier if beyond all tiers
    return this.REWARD_TIERS[this.REWARD_TIERS.length - 1].amount;
  }

  /**
   * Get tier name for display purposes
   */
  private getTierName(adNumber: number): string {
    if (adNumber >= 1 && adNumber <= 20) return "Standard";
    if (adNumber >= 21 && adNumber <= 50) return "Economy";
    return "Economy";
  }

  /**
   * Get next reward amount for user
   */
  getNextRewardAmount(todayCount: number): number {
    return this.calculateRewardAmount(todayCount);
  }
}

export const adMobService = new AdMobService();
