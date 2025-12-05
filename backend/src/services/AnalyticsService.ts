import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { Transaction } from "../models/Transaction.js";
import { AdMobReward } from "../models/AdMobReward.js";
import { TaskSubmission } from "../models/TaskSubmission.js";

interface RealtimeMetrics {
  activeUsersNow: number;
  tasksCompletedToday: number;
  revenueToday: number;
  newUsersToday: number;
  systemHealth: "healthy" | "warning" | "critical";
}

export class AnalyticsService {
  /**
   * Get worker-specific analytics
   */
  static async getWorkerAnalytics(
    userId: string,
    period: "day" | "week" | "month" | "year" = "month"
  ) {
    const periodStart = this.getPeriodStart(period);

    // Get worker's completed tasks
    const completedTasks = await TaskSubmission.countDocuments({
      userId,
      status: "approved",
      updatedAt: { $gte: periodStart },
    });

    // Get total earnings
    const earningsResult = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "earning",
          createdAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalEarnings = earningsResult[0]?.total || 0;

    // Get approval rate
    const totalSubmissions = await TaskSubmission.countDocuments({
      userId,
      updatedAt: { $gte: periodStart },
    });

    const approvalRate =
      totalSubmissions > 0 ? (completedTasks / totalSubmissions) * 100 : 0;

    // Get average rating
    const ratingResult = await TaskSubmission.aggregate([
      {
        $match: {
          userId,
          status: "approved",
          rating: { $ne: null },
          updatedAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);
    const averageRating = ratingResult[0]?.avgRating || 0;

    // Get earnings this month and last month
    const thisMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const lastMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    );

    const thisMonthResult = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "earning",
          createdAt: { $gte: thisMonthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const earningsThisMonth = thisMonthResult[0]?.total || 0;

    const lastMonthResult = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "earning",
          createdAt: {
            $gte: lastMonthStart,
            $lt: thisMonthStart,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const earningsLastMonth = lastMonthResult[0]?.total || 0;

    const earningsGrowth =
      earningsLastMonth > 0
        ? ((earningsThisMonth - earningsLastMonth) / earningsLastMonth) * 100
        : 0;

    // Get tasks by category
    const tasksByCategory = await TaskSubmission.aggregate([
      {
        $match: {
          userId,
          status: "approved",
          updatedAt: { $gte: periodStart },
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "taskId",
          foreignField: "_id",
          as: "task",
        },
      },
      {
        $unwind: "$task",
      },
      {
        $lookup: {
          from: "transactions",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$userId"] },
                type: "earning",
              },
            },
          ],
          as: "transactions",
        },
      },
      {
        $group: {
          _id: "$task.category",
          count: { $sum: 1 },
          earnings: { $sum: { $arrayElemAt: ["$transactions.amount", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          earnings: 1,
        },
      },
      {
        $sort: { earnings: -1 },
      },
    ]);

    // Get recent tasks
    const recentTasks = await TaskSubmission.find({
      userId,
      updatedAt: { $gte: periodStart },
    })
      .populate("taskId", "title reward")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const formattedRecentTasks = recentTasks.map((submission: any) => ({
      id: submission.taskId?._id || submission.taskId,
      title: submission.taskId?.title || "Unknown Task",
      reward: submission.taskId?.reward || 0,
      status: submission.status,
      completedAt: submission.updatedAt,
    }));

    return {
      totalEarnings,
      tasksCompleted: completedTasks,
      approvalRate,
      averageRating,
      earningsThisMonth,
      earningsLastMonth,
      earningsGrowth,
      tasksByCategory,
      recentTasks: formattedRecentTasks,
    };
  }

  /**
   * Get sponsor overview analytics
   */
  static async getSponsorOverview(
    userId: string,
    period: "day" | "week" | "month" | "year" = "month"
  ) {
    const periodStart = this.getPeriodStart(period);

    // Get campaign counts
    const totalCampaigns = await Task.countDocuments({ sponsorId: userId });
    const activeCampaigns = await Task.countDocuments({
      sponsorId: userId,
      status: "active",
    });
    const completedCampaigns = await Task.countDocuments({
      sponsorId: userId,
      status: "completed",
    });

    // Get total spent
    const spentResult = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "task_payment",
          createdAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalSpent = spentResult[0]?.total || 0;

    // Get slots info
    const slotsResult = await Task.aggregate([
      {
        $match: { sponsorId: userId },
      },
      {
        $group: {
          _id: null,
          totalSlots: { $sum: "$totalSlots" },
          filledSlots: { $sum: "$completedSlots" },
        },
      },
    ]);
    const totalSlots = slotsResult[0]?.totalSlots || 0;
    const filledSlots = slotsResult[0]?.filledSlots || 0;

    // Get average approval rate
    const tasks = await Task.find({ sponsorId: userId }).select("_id");
    const taskIds = tasks.map((t) => t._id);

    const submissionStats = await TaskSubmission.aggregate([
      {
        $match: { taskId: { $in: taskIds } },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSubmissions = submissionStats.reduce(
      (sum, stat) => sum + stat.count,
      0
    );
    const approvedSubmissions =
      submissionStats.find((s) => s._id === "approved")?.count || 0;
    const averageApprovalRate =
      totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

    // Get campaign performance
    const campaignPerformance = await Task.aggregate([
      {
        $match: {
          sponsorId: userId,
          createdAt: { $gte: periodStart },
        },
      },
      {
        $lookup: {
          from: "tasksubmissions",
          localField: "_id",
          foreignField: "taskId",
          as: "submissions",
        },
      },
      {
        $project: {
          id: "$_id",
          title: 1,
          totalSlots: 1,
          filledSlots: "$completedSlots",
          spent: {
            $multiply: ["$reward", "$completedSlots"],
          },
          approvalRate: {
            $cond: [
              { $gt: [{ $size: "$submissions" }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: "$submissions",
                            cond: { $eq: ["$$this.status", "approved"] },
                          },
                        },
                      },
                      { $size: "$submissions" },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
          progress: {
            $cond: [
              { $gt: ["$totalSlots", 0] },
              {
                $multiply: [
                  { $divide: ["$completedSlots", "$totalSlots"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get spending history
    const spendingHistory = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "task_payment",
          createdAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    return {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      totalSpent,
      totalSlots,
      filledSlots,
      averageApprovalRate,
      campaignPerformance,
      spendingHistory,
    };
  }

  /**
   * Get campaign-specific analytics
   */
  static async getCampaignAnalytics(campaignId: string, userId: string) {
    // Verify ownership
    const campaign = await Task.findOne({
      _id: campaignId,
      sponsorId: userId,
    });

    if (!campaign) {
      throw new Error("Campaign not found or access denied");
    }

    // Get budget info
    const totalBudget = campaign.reward * campaign.totalSlots;
    const spentBudget = campaign.reward * campaign.completedSlots;
    const remainingBudget = totalBudget - spentBudget;

    // Get submission stats
    const submissionStats = await TaskSubmission.aggregate([
      {
        $match: { taskId: campaign._id },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const approvedSubmissions =
      submissionStats.find((s) => s._id === "approved")?.count || 0;
    const rejectedSubmissions =
      submissionStats.find((s) => s._id === "rejected")?.count || 0;
    const pendingReview =
      submissionStats.find((s) => s._id === "pending")?.count || 0;

    const totalSubmissions = submissionStats.reduce(
      (sum, stat) => sum + stat.count,
      0
    );
    const approvalRate =
      totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

    // Get average completion time
    const completedSubmissions = await TaskSubmission.find({
      taskId: campaign._id,
      status: "approved",
      submittedAt: { $ne: null },
    });

    const averageCompletionTime =
      completedSubmissions.length > 0
        ? completedSubmissions.reduce((sum, s) => {
            const acceptedAt = new Date(s.createdAt).getTime();
            const completedAt = new Date(s.submittedAt!).getTime();
            return sum + (completedAt - acceptedAt) / 1000 / 60; // minutes
          }, 0) / completedSubmissions.length
        : 0;

    // Get submissions by day
    const submissionsByDay = await TaskSubmission.aggregate([
      {
        $match: {
          taskId: campaign._id,
          submittedAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $limit: 30,
      },
    ]);

    // Get top performers
    const topPerformers = await TaskSubmission.aggregate([
      {
        $match: { taskId: campaign._id },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: "$userId",
          username: { $first: "$user.profile.firstName" },
          submissionsCount: { $sum: 1 },
          approvedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: 1,
          submissionsCount: 1,
          approvalRate: {
            $cond: [
              { $gt: ["$submissionsCount", 0] },
              {
                $multiply: [
                  { $divide: ["$approvedCount", "$submissionsCount"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: { submissionsCount: -1, approvalRate: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return {
      campaignName: campaign.title,
      totalBudget,
      spentBudget,
      remainingBudget,
      totalSlots: campaign.totalSlots,
      filledSlots: campaign.completedSlots,
      approvedSubmissions,
      rejectedSubmissions,
      pendingReview,
      approvalRate,
      averageCompletionTime,
      submissionsByDay,
      topPerformers,
    };
  }

  /**
   * Get platform-wide analytics
   */
  static async getPlatformAnalytics(
    period: "day" | "week" | "month" | "year" = "month"
  ) {
    const periodStart = this.getPeriodStart(period);
    const previousPeriodStart = this.getPreviousPeriodStart(period);

    // Get user counts
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastActiveAt: { $gte: periodStart },
    });

    // Get task counts
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "completed" });

    // Get revenue
    const revenueResult = await Transaction.aggregate([
      {
        $match: {
          type: "platform_fee",
          createdAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    const platformFees = totalRevenue;

    const adRevenueResult = await AdMobReward.aggregate([
      {
        $match: {
          createdAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const adRevenue = adRevenueResult[0]?.total || 0;

    // Calculate growth
    const previousUsers = await User.countDocuments({
      createdAt: {
        $gte: previousPeriodStart,
        $lt: periodStart,
      },
    });

    const currentUsers = await User.countDocuments({
      createdAt: { $gte: periodStart },
    });

    const userGrowth =
      previousUsers > 0
        ? ((currentUsers - previousUsers) / previousUsers) * 100
        : 0;

    const taskCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const averageEarningsPerUser =
      activeUsers > 0 ? totalRevenue / activeUsers : 0;

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $unwind: "$roles",
      },
      {
        $group: {
          _id: "$roles",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          role: "$_id",
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get tasks by category
    const tasksByCategory = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          revenue: {
            $sum: { $multiply: ["$reward", "$completedSlots"] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          revenue: 1,
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ]);

    // Get revenue history
    const revenueHistory = await Transaction.aggregate([
      {
        $match: {
          type: "platform_fee",
          createdAt: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    // Get top performers
    const topPerformers = await this.getTopPerformers(periodStart);

    return {
      totalUsers,
      activeUsers,
      totalTasks,
      totalRevenue,
      platformFees,
      adRevenue,
      userGrowth,
      taskCompletionRate,
      averageEarningsPerUser,
      usersByRole,
      tasksByCategory,
      revenueHistory,
      topPerformers,
    };
  }

  /**
   * Get real-time analytics dashboard data
   */
  static async getRealtimeAnalytics(): Promise<RealtimeMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeUsersNow, tasksCompletedToday, revenueResult, newUsersToday] =
      await Promise.all([
        // Active users in last 5 minutes
        User.countDocuments({
          lastActiveAt: {
            $gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        }),

        // Tasks completed today
        Task.countDocuments({
          status: "completed",
          updatedAt: {
            $gte: today,
          },
        }),

        // Revenue today
        Transaction.aggregate([
          {
            $match: {
              type: "earning",
              createdAt: {
                $gte: today,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]),

        // New users today
        User.countDocuments({
          createdAt: {
            $gte: today,
          },
        }),
      ]);

    const revenueToday = revenueResult[0]?.total || 0;

    // System health check
    const systemHealth = await this.checkSystemHealth();

    return {
      activeUsersNow,
      tasksCompletedToday,
      revenueToday,
      newUsersToday,
      systemHealth,
    };
  }

  // Helper methods
  private static getPeriodStart(period: string): Date {
    const now = new Date();
    switch (period) {
      case "day":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart;
      case "month":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "year":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  private static getPreviousPeriodStart(period: string): Date {
    const current = this.getPeriodStart(period);
    switch (period) {
      case "day":
        return new Date(current.getTime() - 24 * 60 * 60 * 1000);
      case "week":
        return new Date(current.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "month":
        return new Date(current.getFullYear(), current.getMonth() - 1, 1);
      case "year":
        return new Date(current.getFullYear() - 1, 0, 1);
      default:
        return new Date(current.getFullYear(), current.getMonth() - 1, 1);
    }
  }

  private static async checkSystemHealth(): Promise<
    "healthy" | "warning" | "critical"
  > {
    try {
      // Check database connection
      const start = Date.now();
      await User.findOne();
      const responseTime = Date.now() - start;

      if (responseTime > 1000) return "critical";
      if (responseTime > 500) return "warning";

      return "healthy";
    } catch (error) {
      return "critical";
    }
  }

  private static async getTopPerformers(since: Date) {
    const topPerformers = await TaskSubmission.aggregate([
      {
        $match: {
          status: "approved",
          updatedAt: { $gte: since },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "transactions",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$userId"] },
                type: "earning",
                createdAt: { $gte: since },
              },
            },
          ],
          as: "transactions",
        },
      },
      {
        $group: {
          _id: "$userId",
          username: { $first: "$user.profile.firstName" },
          email: { $first: "$user.email" },
          completedTasks: { $sum: 1 },
          totalEarnings: { $sum: { $sum: "$transactions.amount" } },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          username: 1,
          email: 1,
          completedTasks: 1,
          totalEarnings: 1,
        },
      },
      {
        $sort: { totalEarnings: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return topPerformers;
  }
}
