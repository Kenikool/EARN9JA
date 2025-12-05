import mongoose from "mongoose";
import {
  DailyFinancialSummary,
  IDailyFinancialSummary,
} from "../models/DailyFinancialSummary.js";
import { FinancialTransaction } from "../models/FinancialTransaction.js";
import { User } from "../models/User.js";

interface FinancialMetrics {
  date: Date;
  adRevenue: number;
  adExpenses: number;
  taskRevenue: number;
  taskExpenses: number;
  bonusExpenses: number;
  escrowDeposits: number;
  netProfit: number;
  profitMargin: number;
  metrics: {
    totalAdsWatched: number;
    totalTasksCompleted: number;
    totalBonusesPaid: number;
    activeUsers: number;
    newUsers: number;
  };
}

export class FinancialSummaryService {
  /**
   * Calculate daily financial summary for a specific date
   */
  async calculateDailySummary(date: Date): Promise<FinancialMetrics> {
    try {
      // Set date to start of day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Aggregate financial transactions for the day
      const transactions = await FinancialTransaction.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      let adRevenue = 0;
      let adExpenses = 0;
      let taskRevenue = 0;
      let taskExpenses = 0;
      let bonusExpenses = 0;
      let escrowDeposits = 0;

      // Count metrics
      const adsWatched = new Set();
      const tasksCompleted = new Set();
      let bonusesPaid = 0;

      transactions.forEach((transaction) => {
        switch (transaction.type) {
          case "ad_revenue":
            adRevenue += transaction.amount;
            if (transaction.metadata?.rewardId) {
              adsWatched.add(transaction.metadata.rewardId);
            }
            break;
          case "ad_expense":
            adExpenses += transaction.amount;
            break;
          case "task_commission":
            taskRevenue += transaction.amount;
            if (transaction.taskId) {
              tasksCompleted.add(transaction.taskId.toString());
            }
            break;
          case "task_payment":
            taskExpenses += transaction.amount;
            break;
          case "bonus_payment":
            bonusExpenses += transaction.amount;
            bonusesPaid++;
            break;
          case "escrow_deposit":
            if (
              transaction.metadata?.action !== "reserve" &&
              transaction.metadata?.action !== "refund"
            ) {
              escrowDeposits += transaction.amount;
            }
            break;
        }
      });

      // Calculate active and new users for the day
      const activeUsers = await User.countDocuments({
        lastLoginAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const newUsers = await User.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      // Calculate net profit and margin
      const totalRevenue = adRevenue + taskRevenue + escrowDeposits;
      const totalExpenses = adExpenses + taskExpenses + bonusExpenses;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin =
        totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        date: startOfDay,
        adRevenue,
        adExpenses,
        taskRevenue,
        taskExpenses,
        bonusExpenses,
        escrowDeposits,
        netProfit,
        profitMargin,
        metrics: {
          totalAdsWatched: adsWatched.size,
          totalTasksCompleted: tasksCompleted.size,
          totalBonusesPaid: bonusesPaid,
          activeUsers,
          newUsers,
        },
      };
    } catch (error) {
      console.error("Error calculating daily summary:", error);
      throw error;
    }
  }

  /**
   * Save or update daily financial summary
   */
  async saveDailySummary(date: Date): Promise<IDailyFinancialSummary> {
    try {
      const metrics = await this.calculateDailySummary(date);

      // Set date to start of day for consistency
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      // Upsert the summary
      const summary = await DailyFinancialSummary.findOneAndUpdate(
        { date: startOfDay },
        metrics,
        { upsert: true, new: true }
      );

      console.log(
        `✅ Daily financial summary saved for ${startOfDay.toDateString()}: Net Profit = ₦${metrics.netProfit.toFixed(
          2
        )}`
      );

      return summary;
    } catch (error) {
      console.error("Error saving daily summary:", error);
      throw error;
    }
  }

  /**
   * Get financial metrics for a period
   */
  async getFinancialMetrics(period: "today" | "week" | "month"): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    adRevenue: number;
    taskRevenue: number;
    escrowDeposits: number;
    adExpenses: number;
    taskExpenses: number;
    bonusExpenses: number;
    metrics: {
      totalAdsWatched: number;
      totalTasksCompleted: number;
      totalBonusesPaid: number;
      activeUsers: number;
      newUsers: number;
    };
  }> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "today":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      const summaries = await DailyFinancialSummary.find({
        date: { $gte: startDate },
      });

      // Aggregate the summaries
      const aggregated = summaries.reduce(
        (acc, summary) => {
          acc.adRevenue += summary.adRevenue;
          acc.adExpenses += summary.adExpenses;
          acc.taskRevenue += summary.taskRevenue;
          acc.taskExpenses += summary.taskExpenses;
          acc.bonusExpenses += summary.bonusExpenses;
          acc.escrowDeposits += summary.escrowDeposits;
          acc.metrics.totalAdsWatched += summary.metrics.totalAdsWatched;
          acc.metrics.totalTasksCompleted +=
            summary.metrics.totalTasksCompleted;
          acc.metrics.totalBonusesPaid += summary.metrics.totalBonusesPaid;
          acc.metrics.activeUsers += summary.metrics.activeUsers;
          acc.metrics.newUsers += summary.metrics.newUsers;
          return acc;
        },
        {
          adRevenue: 0,
          adExpenses: 0,
          taskRevenue: 0,
          taskExpenses: 0,
          bonusExpenses: 0,
          escrowDeposits: 0,
          metrics: {
            totalAdsWatched: 0,
            totalTasksCompleted: 0,
            totalBonusesPaid: 0,
            activeUsers: 0,
            newUsers: 0,
          },
        }
      );

      const totalRevenue =
        aggregated.adRevenue +
        aggregated.taskRevenue +
        aggregated.escrowDeposits;
      const totalExpenses =
        aggregated.adExpenses +
        aggregated.taskExpenses +
        aggregated.bonusExpenses;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin =
        totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        ...aggregated,
      };
    } catch (error) {
      console.error("Error getting financial metrics:", error);
      throw error;
    }
  }

  /**
   * Check if today is profitable
   */
  async checkProfitability(): Promise<{
    isProfitable: boolean;
    netProfit: number;
    profitMargin: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const summary = await DailyFinancialSummary.findOne({ date: today });

      if (!summary) {
        // Calculate on the fly if not yet saved
        const metrics = await this.calculateDailySummary(today);
        return {
          isProfitable: metrics.netProfit > 0,
          netProfit: metrics.netProfit,
          profitMargin: metrics.profitMargin,
        };
      }

      return {
        isProfitable: summary.netProfit > 0,
        netProfit: summary.netProfit,
        profitMargin: summary.profitMargin,
      };
    } catch (error) {
      console.error("Error checking profitability:", error);
      throw error;
    }
  }

  /**
   * Get consecutive profitable days count
   */
  async getConsecutiveProfitableDays(): Promise<number> {
    try {
      const summaries = await DailyFinancialSummary.find()
        .sort({ date: -1 })
        .limit(30);

      let consecutiveDays = 0;
      for (const summary of summaries) {
        if (summary.netProfit > 0) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      return consecutiveDays;
    } catch (error) {
      console.error("Error getting consecutive profitable days:", error);
      throw error;
    }
  }

  /**
   * Get profit/loss trend data
   */
  async getProfitLossTrend(
    period: "daily" | "weekly" | "monthly",
    limit: number = 30
  ): Promise<
    Array<{
      date: string;
      revenue: number;
      expenses: number;
      profit: number;
      profitMargin: number;
    }>
  > {
    try {
      const summaries = await DailyFinancialSummary.find()
        .sort({ date: -1 })
        .limit(limit);

      return summaries.map((summary) => ({
        date: summary.date.toISOString().split("T")[0],
        revenue:
          summary.adRevenue + summary.taskRevenue + summary.escrowDeposits,
        expenses:
          summary.adExpenses + summary.taskExpenses + summary.bonusExpenses,
        profit: summary.netProfit,
        profitMargin: summary.profitMargin,
      }));
    } catch (error) {
      console.error("Error getting profit/loss trend:", error);
      throw error;
    }
  }
}

export const financialSummaryService = new FinancialSummaryService();
