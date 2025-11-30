import DailyBonus, { IDailyBonus } from "../models/DailyBonus";
import { walletService } from "./WalletService";

interface DailyBonusStatus {
  canClaim: boolean;
  claimed: boolean;
  day: number;
  amount: number;
  streakCount: number;
  nextBonus?: {
    day: number;
    amount: number;
    availableAt: Date;
  };
}

export class DailyBonusService {
  // Progressive daily rewards (₦)
  private static DAILY_REWARDS = [
    50, // Day 1
    75, // Day 2
    100, // Day 3
    150, // Day 4
    200, // Day 5
    300, // Day 6
    500, // Day 7 (Jackpot!)
  ];

  /**
   * Get today's date at midnight (for consistent date comparison)
   */
  private static getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Get yesterday's date at midnight
   */
  private static getYesterdayDate(): Date {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  }

  /**
   * Check daily bonus status for a user
   */
  static async getDailyBonusStatus(userId: string): Promise<DailyBonusStatus> {
    const today = this.getTodayDate();
    const yesterday = this.getYesterdayDate();

    // Check if user already claimed today
    const todayBonus = await DailyBonus.findOne({
      userId,
      date: today,
    });

    if (todayBonus) {
      return {
        canClaim: false,
        claimed: todayBonus.claimed,
        day: todayBonus.day,
        amount: todayBonus.amount,
        streakCount: todayBonus.streakCount,
      };
    }

    // Check yesterday's bonus to determine streak
    const yesterdayBonus = await DailyBonus.findOne({
      userId,
      date: yesterday,
    });

    let day = 1;
    let streakCount = 1;

    if (yesterdayBonus && yesterdayBonus.claimed) {
      // Continue streak
      day = yesterdayBonus.day === 7 ? 1 : yesterdayBonus.day + 1;
      streakCount = yesterdayBonus.streakCount + 1;
    } else {
      // Check if there's any previous bonus (streak broken)
      const lastBonus = await DailyBonus.findOne({
        userId,
        claimed: true,
      }).sort({ date: -1 });

      if (lastBonus) {
        // Streak was broken, reset
        day = 1;
        streakCount = 1;
      }
    }

    const amount = this.DAILY_REWARDS[day - 1];

    // Create today's bonus entry
    await DailyBonus.create({
      userId,
      date: today,
      day,
      amount,
      claimed: false,
      streakCount,
    });

    return {
      canClaim: true,
      claimed: false,
      day,
      amount,
      streakCount,
      nextBonus:
        day < 7
          ? {
              day: day + 1,
              amount: this.DAILY_REWARDS[day],
              availableAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            }
          : undefined,
    };
  }

  /**
   * Claim daily bonus
   */
  static async claimDailyBonus(userId: string): Promise<{
    success: boolean;
    amount: number;
    day: number;
    streakCount: number;
    message: string;
  }> {
    const today = this.getTodayDate();

    // Find today's bonus
    const todayBonus = await DailyBonus.findOne({
      userId,
      date: today,
    });

    if (!todayBonus) {
      throw new Error("No bonus available for today");
    }

    if (todayBonus.claimed) {
      throw new Error("Daily bonus already claimed");
    }

    // Mark as claimed
    todayBonus.claimed = true;
    todayBonus.claimedAt = new Date();
    await todayBonus.save();

    // Credit wallet
    await walletService.credit(
      userId,
      todayBonus.amount,
      "daily_bonus",
      `Daily bonus - Day ${todayBonus.day} (${todayBonus.streakCount} day streak)`
    );

    let message = `You've claimed ₦${todayBonus.amount} for Day ${todayBonus.day}!`;
    if (todayBonus.day === 7) {
      message += " 🎉 Jackpot! Your streak resets tomorrow.";
    } else {
      message += ` Come back tomorrow for ₦${
        this.DAILY_REWARDS[todayBonus.day]
      }!`;
    }

    return {
      success: true,
      amount: todayBonus.amount,
      day: todayBonus.day,
      streakCount: todayBonus.streakCount,
      message,
    };
  }

  /**
   * Get user's bonus history
   */
  static async getBonusHistory(
    userId: string,
    limit: number = 30
  ): Promise<IDailyBonus[]> {
    return await DailyBonus.find({
      userId,
      claimed: true,
    })
      .sort({ date: -1 })
      .limit(limit);
  }

  /**
   * Get user's current streak
   */
  static async getCurrentStreak(userId: string): Promise<number> {
    const today = this.getTodayDate();

    // Get the most recent bonus
    const latestBonus = await DailyBonus.findOne({
      userId,
      date: { $lte: today },
      claimed: true,
    }).sort({ date: -1 });

    if (!latestBonus) {
      return 0;
    }

    // Check if streak is still active (claimed today or yesterday)
    const daysSinceLastClaim = Math.floor(
      (today.getTime() - new Date(latestBonus.date).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastClaim <= 1) {
      return latestBonus.streakCount;
    }

    return 0; // Streak broken
  }

  /**
   * Get streak statistics
   */
  static async getStreakStats(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalBonusesClaimed: number;
    totalEarned: number;
  }> {
    const currentStreak = await this.getCurrentStreak(userId);

    const allBonuses = await DailyBonus.find({
      userId,
      claimed: true,
    }).sort({ date: 1 });

    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    let totalEarned = 0;

    for (const bonus of allBonuses) {
      totalEarned += bonus.amount;

      if (lastDate) {
        const dayDiff = Math.floor(
          (new Date(bonus.date).getTime() - lastDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      lastDate = new Date(bonus.date);
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      totalBonusesClaimed: allBonuses.length,
      totalEarned,
    };
  }

  /**
   * Reset streak (for testing or admin purposes)
   */
  static async resetStreak(userId: string): Promise<void> {
    await DailyBonus.deleteMany({ userId, claimed: false });
  }
}
