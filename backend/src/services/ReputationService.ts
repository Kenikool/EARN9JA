import { User } from "../models/User.js";
import { TaskSubmission } from "../models/TaskSubmission.js";

interface ReputationUpdate {
  userId: string;
  action: "task_completed" | "task_rejected" | "task_accepted" | "perfect_week";
  points?: number;
}

interface LevelInfo {
  level: number;
  title: string;
  minScore: number;
  maxScore: number;
  benefits: string[];
}

export class ReputationService {
  // Level thresholds and titles
  private static LEVELS: LevelInfo[] = [
    {
      level: 1,
      title: "Beginner",
      minScore: 0,
      maxScore: 99,
      benefits: ["Access to basic tasks"],
    },
    {
      level: 2,
      title: "Novice",
      minScore: 100,
      maxScore: 249,
      benefits: ["Access to basic tasks", "5% bonus on rewards"],
    },
    {
      level: 3,
      title: "Intermediate",
      minScore: 250,
      maxScore: 499,
      benefits: ["Access to intermediate tasks", "10% bonus on rewards"],
    },
    {
      level: 4,
      title: "Advanced",
      minScore: 500,
      maxScore: 999,
      benefits: [
        "Access to advanced tasks",
        "15% bonus on rewards",
        "Priority support",
      ],
    },
    {
      level: 5,
      title: "Expert",
      minScore: 1000,
      maxScore: 1999,
      benefits: [
        "Access to all tasks",
        "20% bonus on rewards",
        "Priority support",
        "Featured profile",
      ],
    },
    {
      level: 6,
      title: "Master",
      minScore: 2000,
      maxScore: 4999,
      benefits: [
        "Access to exclusive tasks",
        "25% bonus on rewards",
        "VIP support",
        "Featured profile",
        "Early access to new features",
      ],
    },
    {
      level: 7,
      title: "Legend",
      minScore: 5000,
      maxScore: Infinity,
      benefits: [
        "Access to all tasks",
        "30% bonus on rewards",
        "VIP support",
        "Featured profile",
        "Early access to new features",
        "Custom badge",
      ],
    },
  ];

  // Points for different actions
  private static POINTS = {
    TASK_COMPLETED: 10,
    TASK_REJECTED: -5,
    TASK_ACCEPTED: 2,
    PERFECT_WEEK: 50, // Complete 7 tasks in 7 days
    FAST_COMPLETION: 5, // Complete task within 1 hour
    HIGH_QUALITY: 3, // Get approved on first submission
  };

  /**
   * Calculate user's reputation score based on their activity
   */
  static async calculateReputationScore(userId: string): Promise<number> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get all submissions
    const submissions = await TaskSubmission.find({ workerId: userId });

    let score = 0;

    // Calculate approval rate
    const approvedSubmissions = submissions.filter(
      (s) => s.status === "approved"
    );
    const rejectedSubmissions = submissions.filter(
      (s) => s.status === "rejected"
    );

    // Base points from completed tasks
    score += approvedSubmissions.length * this.POINTS.TASK_COMPLETED;

    // Penalty for rejected tasks
    score += rejectedSubmissions.length * this.POINTS.TASK_REJECTED;

    // Bonus for high approval rate
    if (submissions.length > 0) {
      const approvalRate =
        (approvedSubmissions.length / submissions.length) * 100;
      if (approvalRate >= 95) {
        score += 100; // Excellent performance bonus
      } else if (approvalRate >= 90) {
        score += 50;
      } else if (approvalRate >= 80) {
        score += 25;
      }
    }

    // Bonus for fast completions
    const fastCompletions = submissions.filter((s) => {
      if (!s.submittedAt || !s.createdAt) return false;
      const timeDiff =
        new Date(s.submittedAt).getTime() - new Date(s.createdAt).getTime();
      return timeDiff < 3600000; // Less than 1 hour
    });
    score += fastCompletions.length * this.POINTS.FAST_COMPLETION;

    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Calculate approval rate percentage
   */
  static async calculateApprovalRate(userId: string): Promise<number> {
    const submissions = await TaskSubmission.find({ workerId: userId });

    if (submissions.length === 0) {
      return 0;
    }

    const approvedCount = submissions.filter(
      (s) => s.status === "approved"
    ).length;

    return Math.round((approvedCount / submissions.length) * 100);
  }

  /**
   * Calculate average completion time in hours
   */
  static async calculateAverageCompletionTime(userId: string): Promise<number> {
    const submissions = await TaskSubmission.find({
      workerId: userId,
      status: "approved",
      submittedAt: { $exists: true },
    });

    if (submissions.length === 0) {
      return 0;
    }

    let totalTime = 0;
    let validSubmissions = 0;

    for (const submission of submissions) {
      if (submission.submittedAt && submission.createdAt) {
        const timeDiff =
          new Date(submission.submittedAt).getTime() -
          new Date(submission.createdAt).getTime();
        totalTime += timeDiff;
        validSubmissions++;
      }
    }

    if (validSubmissions === 0) {
      return 0;
    }

    // Return average in hours
    const avgMilliseconds = totalTime / validSubmissions;
    return Math.round((avgMilliseconds / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
  }

  /**
   * Get level information based on reputation score
   */
  static getLevelInfo(score: number): LevelInfo {
    for (const level of this.LEVELS) {
      if (score >= level.minScore && score <= level.maxScore) {
        return level;
      }
    }
    return this.LEVELS[0]; // Default to level 1
  }

  /**
   * Update user reputation after an action
   */
  static async updateReputation(update: ReputationUpdate): Promise<void> {
    const user = await User.findById(update.userId);
    if (!user) {
      throw new Error("User not found");
    }

    let pointsToAdd = update.points || 0;

    // Calculate points based on action
    switch (update.action) {
      case "task_completed":
        pointsToAdd = this.POINTS.TASK_COMPLETED;
        break;
      case "task_rejected":
        pointsToAdd = this.POINTS.TASK_REJECTED;
        break;
      case "task_accepted":
        pointsToAdd = this.POINTS.TASK_ACCEPTED;
        break;
      case "perfect_week":
        pointsToAdd = this.POINTS.PERFECT_WEEK;
        break;
    }

    // Update user's reputation score
    const newScore = Math.max(0, user.reputation.score + pointsToAdd);
    const levelInfo = this.getLevelInfo(newScore);

    user.reputation.score = newScore;
    user.reputation.level = levelInfo.level;

    // Update approval rate and completion time
    user.reputation.approvalRate = await this.calculateApprovalRate(
      update.userId
    );
    user.reputation.averageCompletionTime =
      await this.calculateAverageCompletionTime(update.userId);

    await user.save();
  }

  /**
   * Get user's reputation details
   */
  static async getUserReputation(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const levelInfo = this.getLevelInfo(user.reputation.score);
    const nextLevel = this.LEVELS.find((l) => l.level === levelInfo.level + 1);

    return {
      score: user.reputation.score,
      level: user.reputation.level,
      levelTitle: levelInfo.title,
      approvalRate: user.reputation.approvalRate,
      averageCompletionTime: user.reputation.averageCompletionTime,
      benefits: levelInfo.benefits,
      nextLevel: nextLevel
        ? {
            level: nextLevel.level,
            title: nextLevel.title,
            requiredScore: nextLevel.minScore,
            pointsNeeded: nextLevel.minScore - user.reputation.score,
          }
        : null,
    };
  }

  /**
   * Check if user completed a perfect week (7 tasks in 7 days)
   */
  static async checkPerfectWeek(userId: string): Promise<boolean> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSubmissions = await TaskSubmission.find({
      workerId: userId,
      status: "approved",
      submittedAt: { $gte: sevenDaysAgo },
    });

    // Check if there's at least one submission per day for 7 days
    const submissionDates = new Set(
      recentSubmissions.map((s) =>
        s.submittedAt ? new Date(s.submittedAt).toDateString() : ""
      )
    );

    return submissionDates.size >= 7;
  }
}
