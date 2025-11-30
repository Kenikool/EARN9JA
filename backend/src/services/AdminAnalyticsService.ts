import { AdMobReward } from "../models/AdMobReward.js";

interface AdminAnalyticsRequest {
  startDate?: string;
  endDate?: string;
  platform?: "ios" | "android" | "all";
  groupBy?: "day" | "week" | "month";
}

interface DailyAdMetrics {
  date: string;
  totalAdsWatched: number;
  uniqueUsers: number;
  totalRevenue: number;
  iosCount: number;
  androidCount: number;
  averageAdsPerUser: number;
}

interface PlatformBreakdown {
  platform: "ios" | "android";
  count: number;
  percentage: number;
  revenue: number;
}

interface AdminAnalyticsResponse {
  summary: {
    totalAdsWatched: number;
    totalRevenue: number;
    uniqueUsers: number;
    averageAdsPerUser: number;
    averageRevenuePerUser: number;
  };
  dailyMetrics: DailyAdMetrics[];
  platformBreakdown: PlatformBreakdown[];
  topUsers: {
    userId: string;
    adsWatched: number;
    totalEarnings: number;
  }[];
}

export class AdminAnalyticsService {
  async getAdMobAnalytics(
    request: AdminAnalyticsRequest
  ): Promise<AdminAnalyticsResponse> {
    const { startDate, endDate, platform, groupBy = "day" } = request;

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build query filter
    const filter: any = {
      createdAt: { $gte: start, $lte: end },
    };

    if (platform && platform !== "all") {
      filter.platform = platform;
    }

    // Get all rewards in date range
    const rewards = await AdMobReward.find(filter).sort({ createdAt: 1 });

    // Calculate summary statistics
    const totalAdsWatched = rewards.length;
    const totalRevenue = rewards.reduce((sum, r) => sum + r.reward, 0);
    const uniqueUsers = new Set(rewards.map((r) => r.userId.toString())).size;
    const averageAdsPerUser =
      uniqueUsers > 0 ? totalAdsWatched / uniqueUsers : 0;
    const averageRevenuePerUser =
      uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0;

    // Calculate daily metrics
    const dailyMetrics = this.calculateDailyMetrics(rewards, groupBy);

    // Calculate platform breakdown
    const platformBreakdown = this.calculatePlatformBreakdown(rewards);

    // Get top users
    const topUsers = await this.getTopUsers(filter, 10);

    return {
      summary: {
        totalAdsWatched,
        totalRevenue,
        uniqueUsers,
        averageAdsPerUser: Math.round(averageAdsPerUser * 100) / 100,
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
      },
      dailyMetrics,
      platformBreakdown,
      topUsers,
    };
  }

  private calculateDailyMetrics(
    rewards: any[],
    groupBy: string
  ): DailyAdMetrics[] {
    const metricsMap = new Map<string, any>();

    rewards.forEach((reward) => {
      const date = this.getGroupKey(new Date(reward.createdAt), groupBy);

      if (!metricsMap.has(date)) {
        metricsMap.set(date, {
          date,
          totalAdsWatched: 0,
          uniqueUsers: new Set(),
          totalRevenue: 0,
          iosCount: 0,
          androidCount: 0,
        });
      }

      const metrics = metricsMap.get(date);
      metrics.totalAdsWatched++;
      metrics.uniqueUsers.add(reward.userId.toString());
      metrics.totalRevenue += reward.reward;

      if (reward.platform === "ios") {
        metrics.iosCount++;
      } else if (reward.platform === "android") {
        metrics.androidCount++;
      }
    });

    // Convert to array and calculate averages
    return Array.from(metricsMap.values())
      .map((metrics) => ({
        date: metrics.date,
        totalAdsWatched: metrics.totalAdsWatched,
        uniqueUsers: metrics.uniqueUsers.size,
        totalRevenue: Math.round(metrics.totalRevenue * 100) / 100,
        iosCount: metrics.iosCount,
        androidCount: metrics.androidCount,
        averageAdsPerUser:
          Math.round(
            (metrics.totalAdsWatched / metrics.uniqueUsers.size) * 100
          ) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculatePlatformBreakdown(rewards: any[]): PlatformBreakdown[] {
    const iosRewards = rewards.filter((r) => r.platform === "ios");
    const androidRewards = rewards.filter((r) => r.platform === "android");

    const iosCount = iosRewards.length;
    const androidCount = androidRewards.length;
    const total = rewards.length;

    const iosRevenue = iosRewards.reduce((sum, r) => sum + r.reward, 0);
    const androidRevenue = androidRewards.reduce((sum, r) => sum + r.reward, 0);

    return [
      {
        platform: "ios",
        count: iosCount,
        percentage:
          total > 0 ? Math.round((iosCount / total) * 10000) / 100 : 0,
        revenue: Math.round(iosRevenue * 100) / 100,
      },
      {
        platform: "android",
        count: androidCount,
        percentage:
          total > 0 ? Math.round((androidCount / total) * 10000) / 100 : 0,
        revenue: Math.round(androidRevenue * 100) / 100,
      },
    ];
  }

  private async getTopUsers(
    filter: any,
    limit: number
  ): Promise<{ userId: string; adsWatched: number; totalEarnings: number }[]> {
    const topUsers = await AdMobReward.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$userId",
          adsWatched: { $sum: 1 },
          totalEarnings: { $sum: "$reward" },
        },
      },
      { $sort: { adsWatched: -1 } },
      { $limit: limit },
      {
        $project: {
          userId: { $toString: "$_id" },
          adsWatched: 1,
          totalEarnings: { $round: ["$totalEarnings", 2] },
          _id: 0,
        },
      },
    ]);

    return topUsers;
  }

  private getGroupKey(date: Date, groupBy: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    switch (groupBy) {
      case "day":
        return `${year}-${month}-${day}`;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekYear = weekStart.getFullYear();
        const weekMonth = String(weekStart.getMonth() + 1).padStart(2, "0");
        const weekDay = String(weekStart.getDate()).padStart(2, "0");
        return `${weekYear}-${weekMonth}-${weekDay}`;
      case "month":
        return `${year}-${month}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  async exportAnalytics(request: AdminAnalyticsRequest): Promise<string> {
    const analytics = await this.getAdMobAnalytics(request);

    // Generate CSV format
    let csv = "AdMob Analytics Report\n\n";
    csv += "Summary\n";
    csv += `Total Ads Watched,${analytics.summary.totalAdsWatched}\n`;
    csv += `Total Revenue,₦${analytics.summary.totalRevenue}\n`;
    csv += `Unique Users,${analytics.summary.uniqueUsers}\n`;
    csv += `Average Ads Per User,${analytics.summary.averageAdsPerUser}\n`;
    csv += `Average Revenue Per User,₦${analytics.summary.averageRevenuePerUser}\n\n`;

    csv += "Daily Metrics\n";
    csv +=
      "Date,Total Ads,Unique Users,Revenue,iOS Count,Android Count,Avg Ads/User\n";
    analytics.dailyMetrics.forEach((m) => {
      csv += `${m.date},${m.totalAdsWatched},${m.uniqueUsers},₦${m.totalRevenue},${m.iosCount},${m.androidCount},${m.averageAdsPerUser}\n`;
    });

    csv += "\nPlatform Breakdown\n";
    csv += "Platform,Count,Percentage,Revenue\n";
    analytics.platformBreakdown.forEach((p) => {
      csv += `${p.platform},${p.count},${p.percentage}%,₦${p.revenue}\n`;
    });

    csv += "\nTop Users\n";
    csv += "User ID,Ads Watched,Total Earnings\n";
    analytics.topUsers.forEach((u) => {
      csv += `${u.userId},${u.adsWatched},₦${u.totalEarnings}\n`;
    });

    return csv;
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
