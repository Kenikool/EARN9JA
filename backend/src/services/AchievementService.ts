import Achievement from "../models/Achievement.js";
import { User } from "../models/User.js";
import { TaskSubmission } from "../models/TaskSubmission.js";
import { Transaction } from "../models/Transaction.js";
import { walletService } from "./WalletService.js";

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "tasks" | "earnings" | "social" | "streak" | "special";
  criteria: {
    type: string;
    target: number;
  };
  reward?: {
    type: "bonus" | "multiplier";
    amount: number;
  };
}

export class AchievementService {
  // Define all available badges
  private static BADGES: BadgeDefinition[] = [
    // Task-related badges
    {
      id: "first_task",
      name: "First Steps",
      description: "Complete your first task",
      icon: "🎯",
      category: "tasks",
      criteria: { type: "tasks_completed", target: 1 },
      reward: { type: "bonus", amount: 50 },
    },
    {
      id: "task_novice",
      name: "Task Novice",
      description: "Complete 10 tasks",
      icon: "📝",
      category: "tasks",
      criteria: { type: "tasks_completed", target: 10 },
      reward: { type: "bonus", amount: 100 },
    },
    {
      id: "task_master",
      name: "Task Master",
      description: "Complete 100 tasks",
      icon: "🏆",
      category: "tasks",
      criteria: { type: "tasks_completed", target: 100 },
      reward: { type: "bonus", amount: 500 },
    },
    {
      id: "task_legend",
      name: "Task Legend",
      description: "Complete 1000 tasks",
      icon: "👑",
      category: "tasks",
      criteria: { type: "tasks_completed", target: 1000 },
      reward: { type: "bonus", amount: 2000 },
    },
    {
      id: "perfect_week",
      name: "Perfect Week",
      description: "Complete at least one task every day for 7 days",
      icon: "⭐",
      category: "streak",
      criteria: { type: "daily_streak", target: 7 },
      reward: { type: "bonus", amount: 200 },
    },
    {
      id: "perfect_month",
      name: "Perfect Month",
      description: "Complete at least one task every day for 30 days",
      icon: "🌟",
      category: "streak",
      criteria: { type: "daily_streak", target: 30 },
      reward: { type: "bonus", amount: 1000 },
    },
    // Earnings-related badges
    {
      id: "first_earning",
      name: "First Naira",
      description: "Earn your first ₦100",
      icon: "💰",
      category: "earnings",
      criteria: { type: "total_earnings", target: 100 },
    },
    {
      id: "top_earner",
      name: "Top Earner",
      description: "Earn ₦10,000 in total",
      icon: "💎",
      category: "earnings",
      criteria: { type: "total_earnings", target: 10000 },
      reward: { type: "bonus", amount: 500 },
    },
    {
      id: "millionaire",
      name: "Millionaire",
      description: "Earn ₦1,000,000 in total",
      icon: "🤑",
      category: "earnings",
      criteria: { type: "total_earnings", target: 1000000 },
      reward: { type: "bonus", amount: 10000 },
    },
    // Social badges
    {
      id: "social_butterfly",
      name: "Social Butterfly",
      description: "Complete 50 social media tasks",
      icon: "🦋",
      category: "social",
      criteria: { type: "category_tasks", target: 50 },
    },
    {
      id: "music_lover",
      name: "Music Lover",
      description: "Complete 50 music tasks",
      icon: "🎵",
      category: "social",
      criteria: { type: "category_tasks", target: 50 },
    },
    {
      id: "gamer",
      name: "Gamer",
      description: "Complete 50 game tasks",
      icon: "🎮",
      category: "social",
      criteria: { type: "category_tasks", target: 50 },
    },
    // Special badges
    {
      id: "early_bird",
      name: "Early Bird",
      description: "Complete a task within 1 hour of it being posted",
      icon: "🐦",
      category: "special",
      criteria: { type: "fast_completion", target: 1 },
      reward: { type: "bonus", amount: 100 },
    },
    {
      id: "speed_demon",
      name: "Speed Demon",
      description: "Complete 10 tasks within 1 hour of posting",
      icon: "⚡",
      category: "special",
      criteria: { type: "fast_completion", target: 10 },
      reward: { type: "bonus", amount: 300 },
    },
    {
      id: "referral_master",
      name: "Referral Master",
      description: "Refer 10 users who complete at least one task",
      icon: "🤝",
      category: "social",
      criteria: { type: "active_referrals", target: 10 },
      reward: { type: "bonus", amount: 500 },
    },
  ];

  /**
   * Check and award badges for a user
   */
  static async checkAndAwardBadges(userId: string): Promise<any[]> {
    const newBadges: any[] = [];

    for (const badge of this.BADGES) {
      // Check if user already has this badge
      const existingBadge = await Achievement.findOne({
        userId,
        badgeId: badge.id,
      });

      if (existingBadge) {
        continue; // Skip if already awarded
      }

      // Check if user meets criteria
      const meetsCriteria = await this.checkBadgeCriteria(userId, badge);

      if (meetsCriteria) {
        // Award the badge
        const newBadge = await Achievement.create({
          userId,
          badgeId: badge.id,
          badgeName: badge.name,
          badgeDescription: badge.description,
          badgeIcon: badge.icon,
          category: badge.category,
          unlockedAt: new Date(),
        });

        newBadges.push(newBadge);

        // Award bonus if applicable
        if (badge.reward && badge.reward.type === "bonus") {
          await walletService.credit(
            userId,
            badge.reward.amount,
            "referral_bonus",
            `Achievement bonus: ${badge.name}`,
            { achievementId: badge.id }
          );
        }

        // Notify user about achievement
        try {
          const { NotificationHelpers } = await import(
            "./NotificationHelpers.js"
          );
          await NotificationHelpers.notifyAchievementUnlocked(
            userId,
            badge.id,
            badge.name,
            badge.description,
            badge.reward?.amount
          );
        } catch (error) {
          console.log("Failed to send achievement notification:", error);
        }
      }
    }

    return newBadges;
  }

  /**
   * Check if user meets badge criteria
   */
  private static async checkBadgeCriteria(
    userId: string,
    badge: BadgeDefinition
  ): Promise<boolean> {
    const { type, target } = badge.criteria;

    switch (type) {
      case "tasks_completed": {
        const count = await TaskSubmission.countDocuments({
          workerId: userId,
          status: "approved",
        });
        return count >= target;
      }

      case "total_earnings": {
        const user = await User.findById(userId);
        if (!user) return false;
        // Calculate total earnings from transactions
        const earnings = await Transaction.aggregate([
          {
            $match: {
              userId: user._id,
              type: "task_payment",
              status: "completed",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);
        const totalEarnings = earnings[0]?.total || 0;
        return totalEarnings >= target;
      }

      case "daily_streak": {
        // Check if user has completed tasks for consecutive days
        const submissions = await TaskSubmission.find({
          workerId: userId,
          status: "approved",
        }).sort({ submittedAt: -1 });

        if (submissions.length === 0) return false;

        const uniqueDays = new Set<string>();
        let consecutiveDays = 0;
        let lastDate: Date | null = null;

        for (const submission of submissions) {
          if (!submission.submittedAt) continue;

          const submissionDate = new Date(submission.submittedAt);
          submissionDate.setHours(0, 0, 0, 0);
          const dateString = submissionDate.toISOString().split("T")[0];

          if (!uniqueDays.has(dateString)) {
            uniqueDays.add(dateString);

            if (lastDate) {
              const dayDiff = Math.floor(
                (lastDate.getTime() - submissionDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              if (dayDiff === 1) {
                consecutiveDays++;
              } else if (dayDiff > 1) {
                break; // Streak broken
              }
            } else {
              consecutiveDays = 1;
            }

            lastDate = submissionDate;
          }
        }

        return consecutiveDays >= target;
      }

      case "category_tasks": {
        // For category-specific badges, check the badge ID to determine category
        let category = "";
        if (badge.id.includes("social")) category = "Social Media";
        else if (badge.id.includes("music")) category = "Music";
        else if (badge.id.includes("gamer")) category = "Game";

        if (!category) return false;

        const count = await TaskSubmission.countDocuments({
          workerId: userId,
          status: "approved",
        }).populate({
          path: "taskId",
          match: { category },
        });

        return count >= target;
      }

      case "fast_completion": {
        const fastSubmissions = await TaskSubmission.find({
          workerId: userId,
          status: "approved",
        }).populate("taskId");

        let fastCount = 0;
        for (const submission of fastSubmissions) {
          if (!submission.submittedAt || !submission.taskId) continue;

          const task: any = submission.taskId;
          if (!task.createdAt) continue;

          const timeDiff =
            new Date(submission.submittedAt).getTime() -
            new Date(task.createdAt).getTime();

          // Within 1 hour
          if (timeDiff < 3600000) {
            fastCount++;
          }
        }

        return fastCount >= target;
      }

      case "active_referrals": {
        const user = await User.findById(userId);
        if (!user || !user.referralCode) return false;

        // Count referred users who have completed at least one task
        const referredUsers = await User.find({
          referredBy: user.referralCode,
        });

        let activeCount = 0;
        for (const referredUser of referredUsers) {
          const taskCount = await TaskSubmission.countDocuments({
            workerId: referredUser._id,
            status: "approved",
          });
          if (taskCount > 0) {
            activeCount++;
          }
        }

        return activeCount >= target;
      }

      default:
        return false;
    }
  }

  /**
   * Get all badges for a user
   */
  static async getUserBadges(userId: string) {
    const unlockedBadges = await Achievement.find({ userId }).sort({
      unlockedAt: -1,
    });

    const unlockedIds = new Set(unlockedBadges.map((b) => b.badgeId));

    // Get locked badges
    const lockedBadges = this.BADGES.filter((b) => !unlockedIds.has(b.id)).map(
      (b) => ({
        badgeId: b.id,
        badgeName: b.name,
        badgeDescription: b.description,
        badgeIcon: b.icon,
        category: b.category,
        locked: true,
        criteria: b.criteria,
      })
    );

    return {
      unlocked: unlockedBadges,
      locked: lockedBadges,
      totalUnlocked: unlockedBadges.length,
      totalBadges: this.BADGES.length,
    };
  }

  /**
   * Get badge progress for a user
   */
  static async getBadgeProgress(userId: string, badgeId: string) {
    const badge = this.BADGES.find((b) => b.id === badgeId);
    if (!badge) {
      throw new Error("Badge not found");
    }

    // Check current progress
    let current = 0;
    const { type, target } = badge.criteria;

    switch (type) {
      case "tasks_completed":
        current = await TaskSubmission.countDocuments({
          workerId: userId,
          status: "approved",
        });
        break;

      case "total_earnings": {
        const user = await User.findById(userId);
        if (user) {
          const earnings = await Transaction.aggregate([
            {
              $match: {
                userId: user._id,
                type: "task_payment",
                status: "completed",
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ]);
          current = earnings[0]?.total || 0;
        }
        break;
      }

      // Add other cases as needed
    }

    return {
      badgeId: badge.id,
      badgeName: badge.name,
      current,
      target,
      percentage: Math.min(100, Math.round((current / target) * 100)),
      completed: current >= target,
    };
  }
}
