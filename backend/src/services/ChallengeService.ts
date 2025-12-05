import Challenge, { IChallenge } from "../models/Challenge.js";
import ChallengeProgress from "../models/ChallengeProgress.js";
import { TaskSubmission } from "../models/TaskSubmission.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { walletService } from "./WalletService.js";

interface ChallengeWithProgress extends IChallenge {
  userProgress?: {
    progress: number;
    target: number;
    percentage: number;
    completed: boolean;
    rewardClaimed: boolean;
  };
}

export class ChallengeService {
  /**
   * Get active challenges
   */
  static async getActiveChallenges(
    userId?: string
  ): Promise<ChallengeWithProgress[]> {
    const now = new Date();

    const challenges = await Challenge.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ endDate: 1 });

    if (!userId) {
      return challenges as ChallengeWithProgress[];
    }

    // Get user's progress for each challenge
    const challengesWithProgress: ChallengeWithProgress[] = [];

    for (const challenge of challenges) {
      const progress = await ChallengeProgress.findOne({
        userId,
        challengeId: challenge._id,
      });

      const challengeObj = challenge.toObject() as ChallengeWithProgress;

      if (progress) {
        challengeObj.userProgress = {
          progress: progress.progress,
          target: progress.target,
          percentage: Math.min(
            100,
            Math.round((progress.progress / progress.target) * 100)
          ),
          completed: progress.completed,
          rewardClaimed: progress.rewardClaimed,
        };
      } else {
        // Initialize progress
        await ChallengeProgress.create({
          userId,
          challengeId: challenge._id,
          progress: 0,
          target: challenge.criteria.target,
        });

        challengeObj.userProgress = {
          progress: 0,
          target: challenge.criteria.target,
          percentage: 0,
          completed: false,
          rewardClaimed: false,
        };
      }

      challengesWithProgress.push(challengeObj);
    }

    return challengesWithProgress;
  }

  /**
   * Update challenge progress for a user
   */
  static async updateProgress(
    userId: string,
    challengeId: string
  ): Promise<void> {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.active) {
      return;
    }

    // Check if challenge is still active
    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      return;
    }

    // Calculate current progress
    const currentProgress = await this.calculateProgress(userId, challenge);

    // Update or create progress record
    const progress = await ChallengeProgress.findOneAndUpdate(
      {
        userId,
        challengeId,
      },
      {
        progress: currentProgress,
        target: challenge.criteria.target,
        completed: currentProgress >= challenge.criteria.target,
        completedAt:
          currentProgress >= challenge.criteria.target ? new Date() : undefined,
      },
      {
        upsert: true,
        new: true,
      }
    );

    // Update challenge completion count
    if (progress.completed && !progress.rewardClaimed) {
      await Challenge.findByIdAndUpdate(challengeId, {
        $inc: { completions: 1 },
      });
    }

    // Notify user about progress milestones (25%, 50%, 75%)
    const percentage = (currentProgress / challenge.criteria.target) * 100;
    const milestones = [25, 50, 75];
    const previousPercentage =
      ((currentProgress - 1) / challenge.criteria.target) * 100;

    for (const milestone of milestones) {
      if (percentage >= milestone && previousPercentage < milestone) {
        try {
          const { NotificationHelpers } = await import(
            "./NotificationHelpers.js"
          );
          await NotificationHelpers.notifyChallengeProgress(
            userId,
            challengeId,
            challenge.title,
            currentProgress,
            challenge.criteria.target
          );
        } catch (error) {
          console.log("Failed to send challenge progress notification:", error);
        }
        break;
      }
    }
  }

  /**
   * Calculate user's progress for a challenge
   */
  private static async calculateProgress(
    userId: string,
    challenge: IChallenge
  ): Promise<number> {
    const { type, category } = challenge.criteria;
    const { startDate, endDate } = challenge;

    switch (type) {
      case "tasks_completed": {
        const query: any = {
          workerId: userId,
          status: "approved",
          submittedAt: { $gte: startDate, $lte: endDate },
        };

        if (category) {
          // Need to populate taskId to filter by category
          const submissions = await TaskSubmission.find(query).populate(
            "taskId"
          );
          return submissions.filter((s: any) => s.taskId?.category === category)
            .length;
        }

        return await TaskSubmission.countDocuments(query);
      }

      case "earnings": {
        const earnings = await Transaction.aggregate([
          {
            $match: {
              userId: userId,
              type: "task_payment",
              status: "completed",
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        return earnings[0]?.total || 0;
      }

      case "daily_streak": {
        // Count consecutive days with at least one completed task
        const submissions = await TaskSubmission.find({
          workerId: userId,
          status: "approved",
          submittedAt: { $gte: startDate, $lte: endDate },
        }).sort({ submittedAt: 1 });

        const uniqueDays = new Set<string>();
        for (const submission of submissions) {
          if (submission.submittedAt) {
            const date = new Date(submission.submittedAt);
            date.setHours(0, 0, 0, 0);
            uniqueDays.add(date.toISOString().split("T")[0]);
          }
        }

        return uniqueDays.size;
      }

      case "referrals": {
        const user = await User.findById(userId);
        if (!user || !user.referralCode) return 0;

        // Count referred users who joined during challenge period
        return await User.countDocuments({
          referredBy: user.referralCode,
          createdAt: { $gte: startDate, $lte: endDate },
        });
      }

      default:
        return 0;
    }
  }

  /**
   * Claim challenge reward
   */
  static async claimReward(
    userId: string,
    challengeId: string
  ): Promise<{
    success: boolean;
    reward: any;
    message: string;
  }> {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    const progress = await ChallengeProgress.findOne({
      userId,
      challengeId,
    });

    if (!progress) {
      throw new Error("Challenge progress not found");
    }

    if (!progress.completed) {
      throw new Error("Challenge not completed yet");
    }

    if (progress.rewardClaimed) {
      throw new Error("Reward already claimed");
    }

    // Mark reward as claimed
    progress.rewardClaimed = true;
    progress.claimedAt = new Date();
    await progress.save();

    // Process reward
    let message = "";

    switch (challenge.reward.type) {
      case "cash": {
        await walletService.credit(
          userId,
          challenge.reward.value as number,
          "referral_bonus",
          `Challenge reward: ${challenge.title}`
        );
        message = `Congratulations! You earned ₦${challenge.reward.value} for completing "${challenge.title}"! 🎉`;
        break;
      }

      case "multiplier": {
        const user = await User.findById(userId);
        if (user) {
          user.bonusMultiplier = {
            value: challenge.reward.value as number,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };
          await user.save();
        }
        message = `Amazing! You got a ${challenge.reward.value}x multiplier for 7 days! 🚀`;
        break;
      }

      case "badge": {
        message = `You earned a special badge: ${challenge.reward.description}! 🏆`;
        break;
      }
    }

    return {
      success: true,
      reward: challenge.reward,
      message,
    };
  }

  /**
   * Create a new challenge (admin)
   */
  static async createChallenge(
    challengeData: Partial<IChallenge>
  ): Promise<IChallenge> {
    const challenge = await Challenge.create(challengeData);
    return challenge;
  }

  /**
   * Get user's challenge history
   */
  static async getUserChallengeHistory(userId: string) {
    const completedChallenges = await ChallengeProgress.find({
      userId,
      completed: true,
    })
      .populate("challengeId")
      .sort({ completedAt: -1 });

    return completedChallenges;
  }

  /**
   * Get challenge statistics
   */
  static async getChallengeStats(userId: string): Promise<{
    totalCompleted: number;
    totalRewardsClaimed: number;
    totalEarned: number;
    currentActive: number;
  }> {
    const completed = await ChallengeProgress.countDocuments({
      userId,
      completed: true,
    });

    const rewardsClaimed = await ChallengeProgress.countDocuments({
      userId,
      rewardClaimed: true,
    });

    // Calculate total earned from challenges
    const claimedChallenges = await ChallengeProgress.find({
      userId,
      rewardClaimed: true,
    }).populate("challengeId");

    let totalEarned = 0;
    for (const progress of claimedChallenges) {
      const challenge: any = progress.challengeId;
      if (challenge && challenge.reward.type === "cash") {
        totalEarned += challenge.reward.value as number;
      }
    }

    const activeChallenges = await this.getActiveChallenges(userId);

    return {
      totalCompleted: completed,
      totalRewardsClaimed: rewardsClaimed,
      totalEarned,
      currentActive: activeChallenges.length,
    };
  }

  /**
   * Deactivate expired challenges
   */
  static async deactivateExpiredChallenges(): Promise<void> {
    const now = new Date();

    await Challenge.updateMany(
      {
        active: true,
        endDate: { $lt: now },
      },
      {
        active: false,
      }
    );
  }
}
