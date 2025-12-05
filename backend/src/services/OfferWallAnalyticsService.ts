import { OfferWallTransaction } from "../models/OfferWallTransaction.js";
import { ExternalProvider } from "../models/ExternalProvider.js";
import { logger } from "../config/logger.js";

interface ProviderAnalytics {
  providerId: string;
  providerName: string;
  totalCompletions: number;
  totalRevenue: number;
  totalCommission: number;
  totalUserEarnings: number;
  avgTransactionValue: number;
  conversionRate: number;
  successRate: number;
  avgCompletionTime: number;
}

interface RevenueReport {
  period: { start: Date; end: Date };
  totalRevenue: number;
  totalCommission: number;
  totalUserEarnings: number;
  transactionCount: number;
  byProvider: Array<{
    providerId: string;
    providerName: string;
    revenue: number;
    commission: number;
    count: number;
  }>;
  byCategory: Array<{
    category: string;
    revenue: number;
    commission: number;
    count: number;
  }>;
  byDay: Array<{
    date: string;
    revenue: number;
    commission: number;
    count: number;
  }>;
}

export class OfferWallAnalyticsService {
  async getProviderAnalytics(
    providerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProviderAnalytics> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const provider = await ExternalProvider.findOne({ providerId });
    if (!provider) {
      throw new Error("Provider not found");
    }

    const transactions = await OfferWallTransaction.find({
      providerId,
      createdAt: { $gte: start, $lte: end },
    });

    const completedTransactions = transactions.filter(
      (t) => t.status === "completed"
    );

    const totalCompletions = completedTransactions.length;
    const totalRevenue = completedTransactions.reduce(
      (sum, t) => sum + t.convertedAmount,
      0
    );
    const totalCommission = completedTransactions.reduce(
      (sum, t) => sum + t.commissionAmount,
      0
    );
    const totalUserEarnings = completedTransactions.reduce(
      (sum, t) => sum + t.userEarnings,
      0
    );
    const avgTransactionValue =
      totalCompletions > 0 ? totalRevenue / totalCompletions : 0;

    const successRate =
      transactions.length > 0
        ? (completedTransactions.length / transactions.length) * 100
        : 0;

    return {
      providerId,
      providerName: provider.name,
      totalCompletions,
      totalRevenue,
      totalCommission,
      totalUserEarnings,
      avgTransactionValue,
      conversionRate: successRate,
      successRate,
      avgCompletionTime: 0,
    };
  }

  async generateRevenueReport(
    startDate?: Date,
    endDate?: Date
  ): Promise<RevenueReport> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const transactions = await OfferWallTransaction.find({
      status: "completed",
      createdAt: { $gte: start, $lte: end },
    });

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + t.convertedAmount,
      0
    );
    const totalCommission = transactions.reduce(
      (sum, t) => sum + t.commissionAmount,
      0
    );
    const totalUserEarnings = transactions.reduce(
      (sum, t) => sum + t.userEarnings,
      0
    );

    const byProvider = await this.groupByProvider(transactions);
    const byCategory = await this.groupByCategory(transactions);
    const byDay = this.groupByDay(transactions, start, end);

    return {
      period: { start, end },
      totalRevenue,
      totalCommission,
      totalUserEarnings,
      transactionCount: transactions.length,
      byProvider,
      byCategory,
      byDay,
    };
  }

  private async groupByProvider(transactions: any[]): Promise<any[]> {
    const providerMap = new Map<string, any>();

    for (const transaction of transactions) {
      const key = transaction.providerId;
      if (!providerMap.has(key)) {
        providerMap.set(key, {
          providerId: transaction.providerId,
          providerName: transaction.providerName,
          revenue: 0,
          commission: 0,
          count: 0,
        });
      }

      const data = providerMap.get(key);
      data.revenue += transaction.convertedAmount;
      data.commission += transaction.commissionAmount;
      data.count += 1;
    }

    return Array.from(providerMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  }

  private async groupByCategory(transactions: any[]): Promise<any[]> {
    const categoryMap = new Map<string, any>();

    for (const transaction of transactions) {
      const key = transaction.offerCategory || "general";
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          category: key,
          revenue: 0,
          commission: 0,
          count: 0,
        });
      }

      const data = categoryMap.get(key);
      data.revenue += transaction.convertedAmount;
      data.commission += transaction.commissionAmount;
      data.count += 1;
    }

    return Array.from(categoryMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  }

  private groupByDay(
    transactions: any[],
    start: Date,
    end: Date
  ): Array<{
    date: string;
    revenue: number;
    commission: number;
    count: number;
  }> {
    const dayMap = new Map<string, any>();

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split("T")[0];
      dayMap.set(dateKey, {
        date: dateKey,
        revenue: 0,
        commission: 0,
        count: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const transaction of transactions) {
      const dateKey = transaction.createdAt.toISOString().split("T")[0];
      if (dayMap.has(dateKey)) {
        const data = dayMap.get(dateKey);
        data.revenue += transaction.convertedAmount;
        data.commission += transaction.commissionAmount;
        data.count += 1;
      }
    }

    return Array.from(dayMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  async compareProviders(
    startDate?: Date,
    endDate?: Date
  ): Promise<ProviderAnalytics[]> {
    const providers = await ExternalProvider.find({ status: "active" });

    const analytics = await Promise.all(
      providers.map((provider) =>
        this.getProviderAnalytics(provider.providerId, startDate, endDate)
      )
    );

    return analytics.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
}

export const offerWallAnalyticsService = new OfferWallAnalyticsService();
