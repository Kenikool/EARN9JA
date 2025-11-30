import SpinReward, { ISpinReward } from "../models/SpinReward";
import { User } from "../models/User";
import { walletService } from "./WalletService";

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
  // Define wheel segments with probabilities
  private static WHEEL_SEGMENTS: WheelSegment[] = [
    {
      id: "cash_10",
      type: "cash",
      value: 10,
      label: "₦10",
      probability: 30,
      color: "#FFB800",
    },
    {
      id: "cash_25",
      type: "cash",
      value: 25,
      label: "₦25",
      probability: 25,
      color: "#00A86B",
    },
    {
      id: "cash_50",
      type: "cash",
      value: 50,
      label: "₦50",
      probability: 15,
      color: "#FFB800",
    },
    {
      id: "cash_100",
      type: "cash",
      value: 100,
      label: "₦100",
      probability: 10,
      color: "#00A86B",
    },
    {
      id: "multiplier_1.5x",
      type: "bonus_multiplier",
      value: 1.5,
      label: "1.5x Bonus",
      probability: 10,
      color: "#9C27B0",
    },
    {
      id: "multiplier_2x",
      type: "bonus_multiplier",
      value: 2,
      label: "2x Bonus",
      probability: 5,
      color: "#9C27B0",
    },
    {
      id: "free_spin",
      type: "free_spin",
      value: 1,
      label: "Free Spin",
      probability: 3,
      color: "#2196F3",
    },
    {
      id: "cash_500",
      type: "cash",
      value: 500,
      label: "₦500 Jackpot!",
      probability: 2,
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

    const spinsRemaining = Math.max(0, this.DAILY_SPIN_LIMIT - todaySpins);

    if (spinsRemaining > 0) {
      return {
        canSpin: true,
        spinsRemaining,
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
    // Check if user can spin
    const { canSpin, spinsRemaining } = await this.canSpin(userId);

    if (!canSpin) {
      throw new Error("Daily spin limit reached. Come back tomorrow!");
    }

    // Select a random reward based on probabilities
    const reward = this.selectRandomReward();

    // Save spin record
    const today = this.getTodayDate();
    await SpinReward.create({
      userId,
      date: today,
      reward: {
        type: reward.type,
        value: reward.value,
        label: reward.label,
      },
      claimed: true,
      claimedAt: new Date(),
    });

    // Process reward
    let message = "";

    switch (reward.type) {
      case "cash": {
        await walletService.credit(
          userId,
          reward.value as number,
          "referral_bonus",
          `Spin the wheel reward: ${reward.label}`
        );
        message = `Congratulations! You won ${reward.label}! 🎉`;
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
        // Add extra spin for today
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
}
