import mongoose from "mongoose";
import { AdMobReward, IAdMobReward } from "../models/AdMobReward";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { Transaction } from "../models/Transaction";

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
  private readonly REWARD_AMOUNT: number;
  private readonly RAPID_WATCH_THRESHOLD = 60000; // 1 minute
  private readonly MAX_DEVICES_PER_USER = 3;
  private readonly MAX_IPS_PER_USER = 5;

  constructor() {
    this.MAX_ADS_PER_DAY = parseInt(
      process.env.ADMOB_MAX_ADS_PER_DAY || "20",
      10
    );
    this.FRAUD_CHECK_WINDOW = parseInt(
      process.env.ADMOB_FRAUD_CHECK_WINDOW || "60000",
      10
    );
    this.REWARD_AMOUNT = parseFloat(process.env.ADMOB_REWARD_AMOUNT || "50");
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

      // Perform fraud detection checks
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

      // Get or create wallet
      let wallet = await Wallet.findOne({ userId: request.userId }).session(
        session
      );
      if (!wallet) {
        wallet = await Wallet.create(
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
        ).then((wallets) => wallets[0]);

        // Update user with wallet reference
        user.walletId = wallet._id;
        await user.save({ session });
      }

      // Create reward record
      const reward = await AdMobReward.create(
        [
          {
            userId: request.userId,
            taskId: request.taskId,
            reward: this.REWARD_AMOUNT,
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
      wallet.availableBalance += this.REWARD_AMOUNT;
      wallet.lifetimeEarnings += this.REWARD_AMOUNT;
      const balanceAfter = wallet.availableBalance;

      const transaction = await Transaction.create(
        [
          {
            walletId: wallet._id,
            userId: request.userId,
            type: "admob_reward",
            amount: this.REWARD_AMOUNT,
            balanceBefore,
            balanceAfter,
            status: "completed",
            description: `AdMob reward for watching ad`,
            referenceId: reward._id.toString(),
            referenceType: "AdMobReward",
            metadata: {
              platform: request.platform,
              deviceId: request.deviceId,
              fraudScore: fraudCheck.score,
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
        reward: this.REWARD_AMOUNT,
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

    return {
      todayCount,
      remainingToday: Math.max(0, this.MAX_ADS_PER_DAY - todayCount),
      todayEarnings,
      totalEarnings,
      maxAdsPerDay: this.MAX_ADS_PER_DAY,
    };
  }
}

export const adMobService = new AdMobService();
