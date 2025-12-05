import { User } from "../models/User.js";
import { TaskSubmission } from "../models/TaskSubmission.js";
import { Transaction } from "../models/Transaction.js";

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  level: number;
  badge?: string;
}

interface LeaderboardOptions {
  period: "weekly" | "monthly" | "all_time";
  type: "earnings" | "tasks" | "reputation";
  limit?: number;
}

export class LeaderboardService {
  /**
   * Get leaderboard based on criteria
   */
  static async getLeaderboard(
    options: LeaderboardOptions
  ): Promise<LeaderboardEntry[]> {
    const { period, type, limit = 50 } = options;

    let leaderboard: LeaderboardEntry[] = [];

    switch (type) {
      case "earnings":
        leaderboard = await this.getEarningsLeaderboard(period, limit);
        break;
      case "tasks":
        leaderboard = await this.getTasksLeaderboard(period, limit);
        break;
      case "reputation":
        leaderboard = await this.getReputationLeaderboard(limit);
        break;
    }

    return leaderboard;
  }

  /**
   * Get earnings leaderboard
   */
  private static async getEarningsLeaderboard(
    period: "weekly" | "monthly" | "all_time",
    limit: number
  ): Promise<LeaderboardEntry[]> {
    const dateFilter = this.getDateFilter(period);

    const pipeline: any[] = [
      {
        $match: {
          type: "task_payment",
          status: "completed",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$userId",
          totalEarnings: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalEarnings: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: "$_id",
          name: {
            $concat: ["$user.profile.firstName", " ", "$user.profile.lastName"],
          },
          avatar: "$user.profile.avatar",
          score: "$totalEarnings",
          level: "$user.reputation.level",
        },
      },
    ];

    const results = await Transaction.aggregate(pipeline);

    return results.map((entry: any, index: number) => ({
      ...entry,
      userId: entry.userId.toString(),
      rank: index + 1,
      badge: this.getRankBadge(index + 1),
    }));
  }

  /**
   * Get tasks completed leaderboard
   */
  private static async getTasksLeaderboard(
    period: "weekly" | "monthly" | "all_time",
    limit: number
  ): Promise<LeaderboardEntry[]> {
    const dateFilter = this.getDateFilter(period);

    const pipeline: any[] = [
      {
        $match: {
          status: "approved",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$workerId",
          tasksCompleted: { $sum: 1 },
        },
      },
      {
        $sort: { tasksCompleted: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: "$_id",
          name: {
            $concat: ["$user.profile.firstName", " ", "$user.profile.lastName"],
          },
          avatar: "$user.profile.avatar",
          score: "$tasksCompleted",
          level: "$user.reputation.level",
        },
      },
    ];

    const results = await TaskSubmission.aggregate(pipeline);

    return results.map((entry: any, index: number) => ({
      ...entry,
      userId: entry.userId.toString(),
      rank: index + 1,
      badge: this.getRankBadge(index + 1),
    }));
  }

  /**
   * Get reputation leaderboard
   */
  private static async getReputationLeaderboard(
    limit: number
  ): Promise<LeaderboardEntry[]> {
    console.log(`📊 Querying reputation leaderboard with limit: ${limit}`);

    // First check total users
    const totalUsers = await User.countDocuments({});
    console.log(`📊 Total users in database: ${totalUsers}`);

    const serviceWorkers = await User.countDocuments({
      roles: { $in: ["service_worker"] },
    });
    console.log(`📊 Service workers in database: ${serviceWorkers}`);

    const users = await User.find({
      roles: { $in: ["service_worker"] },
    })
      .sort({ "reputation.score": -1 })
      .limit(limit)
      .select(
        "profile.firstName profile.lastName profile.avatar reputation roles"
      );

    console.log(`📊 Found ${users.length} users for reputation leaderboard`);

    if (users.length > 0) {
      console.log(`📊 First user sample:`, {
        name: `${users[0].profile.firstName} ${users[0].profile.lastName}`,
        score: users[0].reputation.score,
        level: users[0].reputation.level,
        roles: users[0].roles,
      });
    }

    const result = users.map((user: any, index: number) => ({
      userId: user._id.toString(),
      name: `${user.profile.firstName} ${user.profile.lastName}`,
      avatar: user.profile.avatar,
      score: user.reputation.score,
      rank: index + 1,
      level: user.reputation.level,
      badge: this.getRankBadge(index + 1),
    }));

    console.log(`📊 Returning ${result.length} leaderboard entries`);
    return result;
  }

  /**
   * Get user's rank in a specific leaderboard
   */
  static async getUserRank(
    userId: string,
    options: Omit<LeaderboardOptions, "limit">
  ): Promise<{
    rank: number;
    score: number;
    totalUsers: number;
  } | null> {
    const { period, type } = options;

    let rank = 0;
    let score = 0;
    let totalUsers = 0;

    switch (type) {
      case "earnings": {
        const dateFilter = this.getDateFilter(period);

        // Get user's earnings
        const userEarnings = await Transaction.aggregate([
          {
            $match: {
              userId: userId,
              type: "task_payment",
              status: "completed",
              ...dateFilter,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        score = userEarnings[0]?.total || 0;

        // Get rank
        const higherEarners = await Transaction.aggregate([
          {
            $match: {
              type: "task_payment",
              status: "completed",
              ...dateFilter,
            },
          },
          {
            $group: {
              _id: "$userId",
              total: { $sum: "$amount" },
            },
          },
          {
            $match: {
              total: { $gt: score },
            },
          },
          {
            $count: "count",
          },
        ]);

        rank = (higherEarners[0]?.count || 0) + 1;

        // Get total users
        const totalUsersResult = await Transaction.aggregate([
          {
            $match: {
              type: "task_payment",
              status: "completed",
              ...dateFilter,
            },
          },
          {
            $group: {
              _id: "$userId",
            },
          },
          {
            $count: "count",
          },
        ]);

        totalUsers = totalUsersResult[0]?.count || 0;
        break;
      }

      case "tasks": {
        const dateFilter = this.getDateFilter(period);

        // Get user's task count
        score = await TaskSubmission.countDocuments({
          workerId: userId,
          status: "approved",
          ...dateFilter,
        });

        // Get rank
        const higherTaskCounts = await TaskSubmission.aggregate([
          {
            $match: {
              status: "approved",
              ...dateFilter,
            },
          },
          {
            $group: {
              _id: "$workerId",
              count: { $sum: 1 },
            },
          },
          {
            $match: {
              count: { $gt: score },
            },
          },
          {
            $count: "count",
          },
        ]);

        rank = (higherTaskCounts[0]?.count || 0) + 1;

        // Get total users
        const totalUsersResult = await TaskSubmission.aggregate([
          {
            $match: {
              status: "approved",
              ...dateFilter,
            },
          },
          {
            $group: {
              _id: "$workerId",
            },
          },
          {
            $count: "count",
          },
        ]);

        totalUsers = totalUsersResult[0]?.count || 0;
        break;
      }

      case "reputation": {
        const user = await User.findById(userId);
        if (!user) return null;

        score = user.reputation.score;

        // Get rank
        const higherScores = await User.countDocuments({
          "reputation.score": { $gt: score },
        });

        rank = higherScores + 1;

        // Get total users with reputation
        totalUsers = await User.countDocuments({
          "reputation.score": { $gt: 0 },
        });
        break;
      }
    }

    return {
      rank,
      score,
      totalUsers,
    };
  }

  /**
   * Get date filter based on period
   */
  private static getDateFilter(period: "weekly" | "monthly" | "all_time"): any {
    if (period === "all_time") {
      return {};
    }

    const now = new Date();
    let startDate: Date;

    if (period === "weekly") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      // monthly
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      createdAt: { $gte: startDate },
    };
  }

  /**
   * Get badge emoji based on rank
   */
  private static getRankBadge(rank: number): string {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  }

  /**
   * Get top performers summary
   */
  static async getTopPerformers(): Promise<{
    topEarner: LeaderboardEntry | null;
    mostTasks: LeaderboardEntry | null;
    highestReputation: LeaderboardEntry | null;
  }> {
    const [topEarner] = await this.getEarningsLeaderboard("all_time", 1);
    const [mostTasks] = await this.getTasksLeaderboard("all_time", 1);
    const [highestReputation] = await this.getReputationLeaderboard(1);

    return {
      topEarner: topEarner || null,
      mostTasks: mostTasks || null,
      highestReputation: highestReputation || null,
    };
  }
}
