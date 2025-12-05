import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { AdMobReward } from "../models/AdMobReward.js";
import { TaskSubmission } from "../models/TaskSubmission.js";

interface FraudCheck {
  isFraudulent: boolean;
  reason?: string;
  riskScore: number; // 0-100
  flags: string[];
}

export class FraudDetectionService {
  /**
   * Check for multi-account fraud
   */
  static async checkMultiAccount(
    userId: string,
    deviceId?: string,
    ipAddress?: string
  ): Promise<FraudCheck> {
    const flags: string[] = [];
    let riskScore = 0;

    // Check for same device ID
    if (deviceId) {
      const sameDeviceUsers = await User.countDocuments({
        _id: { $ne: userId },
        "devices.deviceId": deviceId,
      });

      if (sameDeviceUsers > 0) {
        flags.push(`Device shared with ${sameDeviceUsers} other account(s)`);
        riskScore += sameDeviceUsers * 20;
      }
    }

    // Check for same IP address
    if (ipAddress) {
      const sameIPUsers = await User.countDocuments({
        _id: { $ne: userId },
        "devices.ipAddress": ipAddress,
      });

      if (sameIPUsers > 2) {
        // Allow up to 2 users per IP (family/office)
        flags.push(`IP shared with ${sameIPUsers} other account(s)`);
        riskScore += (sameIPUsers - 2) * 15;
      }
    }

    // Check for similar registration patterns
    const user = await User.findById(userId);
    if (user) {
      const similarUsers = await User.find({
        _id: { $ne: userId },
        $or: [
          { phoneNumber: user.phoneNumber },
          { email: user.email },
          { "bankDetails.accountNumber": user.bankDetails?.accountNumber },
        ],
      });

      if (similarUsers.length > 0) {
        flags.push("Duplicate contact information detected");
        riskScore += 40;
      }
    }

    return {
      isFraudulent: riskScore >= 60,
      reason: flags.length > 0 ? flags.join("; ") : undefined,
      riskScore: Math.min(riskScore, 100),
      flags,
    };
  }

  /**
   * Check for suspicious ad watching patterns
   */
  static async checkAdWatchingFraud(userId: string): Promise<FraudCheck> {
    const flags: string[] = [];
    let riskScore = 0;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check rapid ad watching (more than 10 in 1 hour)
    const recentAds = await AdMobReward.countDocuments({
      userId,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentAds > 10) {
      flags.push(`${recentAds} ads watched in last hour`);
      riskScore += 30;
    }

    // Check for consistent timing patterns (bot-like behavior)
    const last20Ads = await AdMobReward.find({
      userId,
      createdAt: { $gte: oneDayAgo },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    if (last20Ads.length >= 10) {
      const intervals: number[] = [];
      for (let i = 1; i < last20Ads.length; i++) {
        const interval =
          last20Ads[i - 1].createdAt.getTime() -
          last20Ads[i].createdAt.getTime();
        intervals.push(interval);
      }

      // Calculate standard deviation
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance =
        intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        intervals.length;
      const stdDev = Math.sqrt(variance);

      // If standard deviation is very low, it's suspicious (too consistent)
      if (stdDev < 5000) {
        // Less than 5 seconds variation
        flags.push("Suspiciously consistent ad watching pattern");
        riskScore += 40;
      }
    }

    // Check for multiple devices/IPs
    const uniqueDevices = await AdMobReward.distinct("deviceId", {
      userId,
      createdAt: { $gte: oneDayAgo },
    });

    const uniqueIPs = await AdMobReward.distinct("ipAddress", {
      userId,
      createdAt: { $gte: oneDayAgo },
    });

    if (uniqueDevices.length > 3) {
      flags.push(`${uniqueDevices.length} different devices in 24h`);
      riskScore += 25;
    }

    if (uniqueIPs.length > 5) {
      flags.push(`${uniqueIPs.length} different IP addresses in 24h`);
      riskScore += 20;
    }

    return {
      isFraudulent: riskScore >= 60,
      reason: flags.length > 0 ? flags.join("; ") : undefined,
      riskScore: Math.min(riskScore, 100),
      flags,
    };
  }

  /**
   * Check for task submission fraud
   */
  static async checkTaskSubmissionFraud(
    userId: string,
    taskId: string
  ): Promise<FraudCheck> {
    const flags: string[] = [];
    let riskScore = 0;

    // Check for rapid submissions
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSubmissions = await TaskSubmission.countDocuments({
      workerId: userId,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentSubmissions > 20) {
      flags.push(`${recentSubmissions} task submissions in last hour`);
      riskScore += 30;
    }

    // Check rejection rate
    const totalSubmissions = await TaskSubmission.countDocuments({
      workerId: userId,
    });

    const rejectedSubmissions = await TaskSubmission.countDocuments({
      workerId: userId,
      status: "rejected",
    });

    if (totalSubmissions > 10) {
      const rejectionRate = (rejectedSubmissions / totalSubmissions) * 100;
      if (rejectionRate > 50) {
        flags.push(`High rejection rate: ${rejectionRate.toFixed(1)}%`);
        riskScore += 25;
      }
    }

    // Check for duplicate proof submissions
    const submission = await TaskSubmission.findOne({
      workerId: userId,
      taskId,
    });

    if (submission && submission.proofs) {
      const duplicateProof = await TaskSubmission.countDocuments({
        workerId: { $ne: userId },
        taskId,
        "proofs.screenshots": { $in: submission.proofs.screenshots || [] },
      });

      if (duplicateProof > 0) {
        flags.push("Duplicate proof detected");
        riskScore += 50;
      }
    }

    return {
      isFraudulent: riskScore >= 60,
      reason: flags.length > 0 ? flags.join("; ") : undefined,
      riskScore: Math.min(riskScore, 100),
      flags,
    };
  }

  /**
   * Check for withdrawal fraud
   */
  static async checkWithdrawalFraud(
    userId: string,
    amount: number
  ): Promise<FraudCheck> {
    const flags: string[] = [];
    let riskScore = 0;

    const user = await User.findById(userId);
    if (!user) {
      return {
        isFraudulent: true,
        reason: "User not found",
        riskScore: 100,
        flags: ["User not found"],
      };
    }

    // Check if KYC is verified
    if (!user.kycVerified) {
      flags.push("KYC not verified");
      riskScore += 40;
    }

    // Check account age
    const accountAge = Date.now() - user.createdAt.getTime();
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);

    if (daysSinceCreation < 7) {
      flags.push("Account less than 7 days old");
      riskScore += 30;
    }

    // Check for rapid withdrawals
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentWithdrawals = await Transaction.countDocuments({
      userId,
      type: "withdrawal",
      createdAt: { $gte: oneDayAgo },
    });

    if (recentWithdrawals > 3) {
      flags.push(`${recentWithdrawals} withdrawals in 24 hours`);
      riskScore += 25;
    }

    // Check if withdrawal amount is suspicious
    const totalEarnings = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: { $in: ["task_payment", "ad_reward", "referral_bonus"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const earned = totalEarnings[0]?.total || 0;

    if (amount > earned * 1.5) {
      flags.push("Withdrawal exceeds earnings");
      riskScore += 50;
    }

    return {
      isFraudulent: riskScore >= 60,
      reason: flags.length > 0 ? flags.join("; ") : undefined,
      riskScore: Math.min(riskScore, 100),
      flags,
    };
  }

  /**
   * Comprehensive fraud check
   */
  static async comprehensiveCheck(
    userId: string,
    context: {
      action: "ad_watch" | "task_submit" | "withdrawal" | "registration";
      deviceId?: string;
      ipAddress?: string;
      taskId?: string;
      amount?: number;
    }
  ): Promise<FraudCheck> {
    const checks: FraudCheck[] = [];

    // Always check multi-account
    checks.push(
      await this.checkMultiAccount(userId, context.deviceId, context.ipAddress)
    );

    // Context-specific checks
    switch (context.action) {
      case "ad_watch":
        checks.push(await this.checkAdWatchingFraud(userId));
        break;
      case "task_submit":
        if (context.taskId) {
          checks.push(
            await this.checkTaskSubmissionFraud(userId, context.taskId)
          );
        }
        break;
      case "withdrawal":
        if (context.amount) {
          checks.push(await this.checkWithdrawalFraud(userId, context.amount));
        }
        break;
    }

    // Combine results
    const allFlags = checks.flatMap((c) => c.flags);
    const maxRiskScore = Math.max(...checks.map((c) => c.riskScore));
    const isFraudulent = checks.some((c) => c.isFraudulent);

    return {
      isFraudulent,
      reason: allFlags.length > 0 ? allFlags.join("; ") : undefined,
      riskScore: maxRiskScore,
      flags: allFlags,
    };
  }

  /**
   * Log fraud attempt
   */
  static async logFraudAttempt(
    userId: string,
    action: string,
    fraudCheck: FraudCheck
  ): Promise<void> {
    // Update user's fraud score
    await User.findByIdAndUpdate(userId, {
      $inc: { "reputation.fraudScore": fraudCheck.riskScore },
      $push: {
        fraudAttempts: {
          action,
          riskScore: fraudCheck.riskScore,
          flags: fraudCheck.flags,
          timestamp: new Date(),
        },
      },
    });

    // If high risk, flag account for review
    if (fraudCheck.riskScore >= 80) {
      await User.findByIdAndUpdate(userId, {
        accountStatus: "flagged",
        flaggedReason: fraudCheck.reason,
      });
    }
  }
}
