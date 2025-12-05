import SpinReward, { ISpinReward } from "../models/SpinReward.js";
import { User } from "../models/User.js";
import { walletService } from "./WalletService.js";

interface WheelSegment {
  id: string;
  type: "cash" | "bonus_multiplier" | "free_spin" | "badge";
  value: number | string;
  label: string;
  probability: number; // Percentage (0-100)
  color: string;
}

interface SpinResult {
  success: boolean;
  reward: {
    type: string;
    value: number | string;
    label: string;
  };
  message: string;
  spinsRemaining: number;
}

export class SpinWheelService {
  // Feature flag - DISABLED for profitability
  private static FEATURE_ENABLED = false;

  // Define wheel segments with probabilities (harder to win big)
  private static WHEEL_SEGMENTS: WheelSegment[] = [
    {
      id: "better_luck",
      type: "cash",
      value: 0,
      label: "Better Luck Next Time",
      probability: 35,
      color: "#9E9E9E",
    },
    {
      id: "cash_5",
      type: "cash",
      value: 5,
      label: "₦5",
      probability: 25,
      color: "#FFB800",
    },
    {
      id: "cash_10",
      type: "cash",
      value: 10,
      label: "₦10",
      probability: 18,
      color: "#00A86B",
    },
    {
      id: "cash_25",
      type: "cash",
      value: 25,
      label: "₦25",
      probability: 10,
      color: "#FFB800",
    },
    {
      id: "cash_50",
      type: "cash",
      value: 50,
      label: "₦50",
      probability: 5,
      color: "#00A86B",
    },
    {
      id: "cash_75",
      type: "cash",
      value: 75,
      label: "₦75",
      probability: 3,
      color: "#FFB800",
    },
    {
      id: "multiplier_1.5x",
      type: "bonus_multiplier",
      value: 1.5,
      label: "1.5x Bonus",
      probability: 2,
      color: "#9C27B0",
    },
    {
      id: "free_spin",
      type: "free_spin",
      value: 1,
      label: "Free Spin",
      probability: 1.5,
      color: "#2196F3",
    },
    {
      id: "multiplier_2x",
      type: "bonus_multiplier",
      value: 2,
      label: "2x Bonus",
      probability: 0.4,
      color: "#9C27B0",
    },
    {
      id: "cash_100",
      type: "cash",
      value: 100,
      label: "₦100 Jackpot!",
      probability: 0.1,
      color: "#FFB800",
    },
    {
      id: "cash_500",
      type: "cash",
      value: 500,
      label: "₦500 MEGA JACKPOT! 🎰",
      probability: 0.05,
      color: "#FF5722",
    },
  ];

  // Daily spin limit
  private static DAILY_SPIN_LIMIT = 3;

  /**
   * Get today's date at midnight
   */
  private static getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Check if user can spin
   */
  static async canSpin(userId: string): Promise<{
    canSpin: boolean;
    spinsRemaining: number;
    nextSpinAt?: Date;
  }> {
    const today = this.getTodayDate();

    // Count today's spins
    const todaySpins = await SpinReward.countDocuments({
      userId,
      date: today,
    });

    // Count unclaimed extra spins (from ads)
    const extraSpinDate = new Date(today);
    extraSpinDate.setFullYear(1970); // Special date for extra spins
    const extraSpins = await SpinReward.countDocuments({
      userId,
      date: extraSpinDate,
      claimed: false,
    });

    const regularSpinsRemaining = Math.max(
      0,
      this.DAILY_SPIN_LIMIT - todaySpins
    );
    const totalSpinsRemaining = regularSpinsRemaining + extraSpins;

    if (totalSpinsRemaining > 0) {
      return {
        canSpin: true,
        spinsRemaining: totalSpinsRemaining,
      };
    }

    // Calculate next spin time (tomorrow at midnight)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      canSpin: false,
      spinsRemaining: 0,
      nextSpinAt: tomorrow,
    };
  }

  /**
   * Spin the wheel
   */
  static async spin(userId: string): Promise<SpinResult> {
    // Check if feature is enabled
    if (!this.FEATURE_ENABLED) {
      throw new Error(
        "Spin wheel is temporarily disabled. Check back soon for exciting rewards!"
      );
    }

    // Check if user can spin
    const { canSpin, spinsRemaining } = await this.canSpin(userId);

    if (!canSpin) {
      throw new Error("Daily spin limit reached. Come back tomorrow!");
    }

    const today = this.getTodayDate();

    // Check if user has extra spins from ads
    const extraSpinDate = new Date(today);
    extraSpinDate.setFullYear(1970);
    const extraSpin = await SpinReward.findOne({
      userId,
      date: extraSpinDate,
      claimed: false,
    });

    if (extraSpin) {
      // Use extra spin - mark it as claimed
      extraSpin.claimed = true;
      extraSpin.claimedAt = new Date();
      await extraSpin.save();
    } else {
      // Use regular daily spin - create new record
      await SpinReward.create({
        userId,
        date: today,
        reward: {
          type: "pending",
          value: 0,
          label: "Pending",
        },
        claimed: false,
        claimedAt: null,
      });
    }

    // Select a random reward based on probabilities
    const reward = this.selectRandomReward();

    // Update the spin record with actual reward
    const spinRecord =
      extraSpin ||
      (await SpinReward.findOne({
        userId,
        date: today,
        claimed: false,
      }).sort({ createdAt: -1 }));

    if (spinRecord) {
      spinRecord.reward = {
        type: reward.type,
        value: reward.value,
        label: reward.label,
      };
      spinRecord.claimed = true;
      spinRecord.claimedAt = new Date();
      await spinRecord.save();
    }

    // Process reward
    let message = "";

    switch (reward.type) {
      case "cash": {
        const cashAmount = reward.value as number;
        if (cashAmount > 0) {
          await walletService.credit(
            userId,
            cashAmount,
            "referral_bonus",
            `Spin the wheel reward: ${reward.label}`
          );
          message = `Congratulations! You won ${reward.label}! 🎉`;
        } else {
          message = `Better luck next time! Try again tomorrow! 🍀`;
        }
        break;
      }

      case "bonus_multiplier": {
        // Store multiplier in user's profile (expires in 24 hours)
        const user = await User.findById(userId);
        if (user) {
          user.bonusMultiplier = {
            value: reward.value as number,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          };
          await user.save();
        }
        message = `Amazing! You got a ${reward.label} for 24 hours! 🚀`;
        break;
      }

      case "free_spin": {
        // Grant another extra spin
        await this.grantExtraSpin(userId);
        message = `Lucky you! You got a free spin! Spin again! 🎰`;
        break;
      }

      case "badge": {
        message = `You earned a special badge: ${reward.label}! 🏆`;
        break;
      }
    }

    return {
      success: true,
      reward: {
        type: reward.type,
        value: reward.value,
        label: reward.label,
      },
      message,
      spinsRemaining: spinsRemaining - 1,
    };
  }

  /**
   * Select random reward based on probabilities
   */
  private static selectRandomReward(): WheelSegment {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;

    for (const segment of this.WHEEL_SEGMENTS) {
      cumulativeProbability += segment.probability;
      if (random <= cumulativeProbability) {
        return segment;
      }
    }

    // Fallback to first segment (should never happen)
    return this.WHEEL_SEGMENTS[0];
  }

  /**
   * Get wheel configuration (for frontend)
   */
  static getWheelConfig(): WheelSegment[] {
    return this.WHEEL_SEGMENTS;
  }

  /**
   * Get user's spin history
   */
  static async getSpinHistory(
    userId: string,
    limit: number = 30
  ): Promise<ISpinReward[]> {
    return await SpinReward.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Get spin statistics
   */
  static async getSpinStats(userId: string): Promise<{
    totalSpins: number;
    totalCashWon: number;
    biggestWin: number;
    favoriteReward: string;
  }> {
    const spins = await SpinReward.find({ userId });

    let totalCashWon = 0;
    let biggestWin = 0;
    const rewardCounts: { [key: string]: number } = {};

    for (const spin of spins) {
      if (spin.reward.type === "cash") {
        const amount = spin.reward.value as number;
        totalCashWon += amount;
        biggestWin = Math.max(biggestWin, amount);
      }

      const rewardKey = spin.reward.label;
      rewardCounts[rewardKey] = (rewardCounts[rewardKey] || 0) + 1;
    }

    // Find most common reward
    let favoriteReward = "None";
    let maxCount = 0;
    for (const [reward, count] of Object.entries(rewardCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteReward = reward;
      }
    }

    return {
      totalSpins: spins.length,
      totalCashWon,
      biggestWin,
      favoriteReward,
    };
  }

  /**
   * Check if user has active bonus multiplier
   */
  static async getActiveMultiplier(userId: string): Promise<{
    active: boolean;
    value: number;
    expiresAt?: Date;
  }> {
    const user = await User.findById(userId);

    if (
      !user ||
      !user.bonusMultiplier ||
      !user.bonusMultiplier.expiresAt ||
      new Date(user.bonusMultiplier.expiresAt) < new Date()
    ) {
      return {
        active: false,
        value: 1,
      };
    }

    return {
      active: true,
      value: user.bonusMultiplier.value,
      expiresAt: user.bonusMultiplier.expiresAt,
    };
  }

  /**
   * Grant an extra spin (from watching ad)
   */
  static async grantExtraSpin(userId: string): Promise<{
    success: boolean;
    message: string;
    spinsRemaining: number;
  }> {
    const today = this.getTodayDate();

    // Create a special "extra spin" record that doesn't count against daily limit
    // We use a special date in the past to mark it as an extra spin
    const extraSpinDate = new Date(today);
    extraSpinDate.setFullYear(1970); // Use epoch year to mark as extra spin

    await SpinReward.create({
      userId,
      date: extraSpinDate, // Special date to identify extra spins
      reward: {
        type: "free_spin",
        value: 1,
        label: "Extra Spin from Ad",
      },
      claimed: false, // Not claimed yet - user still needs to spin
      claimedAt: null,
    });

    // Get updated spin count
    const { spinsRemaining } = await this.canSpin(userId);

    return {
      success: true,
      message: "Extra spin granted! You can spin again.",
      spinsRemaining: spinsRemaining + 1, // Add the extra spin
    };
  }
}
