import { TaskBudget, ITaskBudget } from "../models/TaskBudget.js";
import { Task } from "../models/Task.js";
import notificationService from "./NotificationService.js";
import mongoose from "mongoose";

export class BudgetService {
  /**
   * Create budget for a task
   */
  static async createBudget(
    taskId: string,
    sponsorId: string,
    budgetData: {
      totalBudget?: number;
      dailyLimit?: number;
      alertThresholds?: number[];
      autoPauseEnabled?: boolean;
      autoPauseThreshold?: number;
      rolloverEnabled?: boolean;
    }
  ): Promise<ITaskBudget> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Calculate total budget if not provided
    const totalBudget = budgetData.totalBudget || task.reward * task.totalSlots;

    // Default alert thresholds: 50%, 75%, 90%
    const alertThresholds = (budgetData.alertThresholds || [50, 75, 90]).map(
      (percentage) => ({
        percentage,
        triggered: false,
      })
    );

    const budget = new TaskBudget({
      taskId: new mongoose.Types.ObjectId(taskId),
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
      totalBudget,
      spentBudget: 0,
      remainingBudget: totalBudget,
      dailyLimit: budgetData.dailyLimit,
      alertThresholds,
      autoPauseEnabled: budgetData.autoPauseEnabled ?? true,
      autoPauseThreshold: budgetData.autoPauseThreshold ?? 100,
      rolloverEnabled: budgetData.rolloverEnabled ?? false,
      spendingHistory: [],
    });

    return budget.save();
  }

  /**
   * Get budget by task ID
   */
  static async getBudgetByTaskId(taskId: string): Promise<ITaskBudget | null> {
    return TaskBudget.findOne({ taskId: new mongoose.Types.ObjectId(taskId) });
  }

  /**
   * Get budgets for a sponsor
   */
  static async getSponsorBudgets(
    sponsorId: string,
    filters?: {
      isPaused?: boolean;
      isExhausted?: boolean;
    }
  ): Promise<ITaskBudget[]> {
    const query: any = {
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
    };

    if (filters?.isPaused !== undefined) {
      query.isPaused = filters.isPaused;
    }

    const budgets = await TaskBudget.find(query)
      .populate("taskId")
      .sort({ createdAt: -1 });

    // Filter by exhausted status if needed
    if (filters?.isExhausted !== undefined) {
      return budgets.filter((budget) => {
        const isExhausted = budget.remainingBudget <= 0;
        return isExhausted === filters.isExhausted;
      });
    }

    return budgets;
  }

  /**
   * Update budget
   */
  static async updateBudget(
    taskId: string,
    updates: Partial<ITaskBudget>
  ): Promise<ITaskBudget | null> {
    const budget = await TaskBudget.findOne({
      taskId: new mongoose.Types.ObjectId(taskId),
    });

    if (!budget) {
      return null;
    }

    // Update fields
    Object.assign(budget, updates);

    // Recalculate remaining budget if total or spent changed
    if (
      updates.totalBudget !== undefined ||
      updates.spentBudget !== undefined
    ) {
      budget.remainingBudget = budget.totalBudget - budget.spentBudget;
    }

    return budget.save();
  }

  /**
   * Record spending
   */
  static async recordSpending(
    taskId: string,
    amount: number,
    submissionId: string,
    workerId: string
  ): Promise<ITaskBudget> {
    const budget = await TaskBudget.findOne({
      taskId: new mongoose.Types.ObjectId(taskId),
    });

    if (!budget) {
      throw new Error("Budget not found for this task");
    }

    // Add to spending history
    budget.spendingHistory.push({
      date: new Date(),
      amount,
      submissionId: new mongoose.Types.ObjectId(submissionId),
      workerId: new mongoose.Types.ObjectId(workerId),
    });

    // Update spent and remaining budget
    budget.spentBudget += amount;
    budget.remainingBudget = budget.totalBudget - budget.spentBudget;

    // Check alert thresholds
    await this.checkAlertThresholds(budget);

    // Check auto-pause
    await this.checkAutoPause(budget);

    return budget.save();
  }

  /**
   * Check and trigger alert thresholds
   */
  private static async checkAlertThresholds(
    budget: ITaskBudget
  ): Promise<void> {
    const spendingPercentage = (budget.spentBudget / budget.totalBudget) * 100;

    for (const threshold of budget.alertThresholds) {
      if (!threshold.triggered && spendingPercentage >= threshold.percentage) {
        threshold.triggered = true;
        threshold.triggeredAt = new Date();

        // Send notification
        await notificationService.createNotification({
          userId: budget.sponsorId.toString(),
          type: "budget_alert",
          title: "Budget Alert",
          body: `Your task budget has reached ${
            threshold.percentage
          }% (₦${budget.spentBudget.toLocaleString()} of ₦${budget.totalBudget.toLocaleString()})`,
          data: {
            taskId: budget.taskId.toString(),
            percentage: threshold.percentage,
            spentBudget: budget.spentBudget,
            totalBudget: budget.totalBudget,
          },
        });
      }
    }
  }

  /**
   * Check and trigger auto-pause
   */
  private static async checkAutoPause(budget: ITaskBudget): Promise<void> {
    if (!budget.autoPauseEnabled || budget.isPaused) {
      return;
    }

    const spendingPercentage = (budget.spentBudget / budget.totalBudget) * 100;

    if (spendingPercentage >= budget.autoPauseThreshold) {
      // Pause the budget
      budget.isPaused = true;
      budget.pausedAt = new Date();
      budget.pauseReason = `Budget threshold reached (${budget.autoPauseThreshold}%)`;

      // Pause the task
      await Task.findByIdAndUpdate(budget.taskId, {
        status: "paused",
        pausedAt: new Date(),
      });

      // Send notification
      await notificationService.createNotification({
        userId: budget.sponsorId.toString(),
        type: "task_paused",
        title: "Task Auto-Paused",
        body: `Your task has been automatically paused because the budget threshold (${budget.autoPauseThreshold}%) was reached.`,
        data: {
          taskId: budget.taskId.toString(),
          spentBudget: budget.spentBudget,
          totalBudget: budget.totalBudget,
          threshold: budget.autoPauseThreshold,
        },
      });
    }
  }

  /**
   * Resume budget (unpause)
   */
  static async resumeBudget(taskId: string): Promise<ITaskBudget | null> {
    const budget = await TaskBudget.findOne({
      taskId: new mongoose.Types.ObjectId(taskId),
    });

    if (!budget) {
      return null;
    }

    budget.isPaused = false;
    budget.pausedAt = undefined;
    budget.pauseReason = undefined;

    // Resume the task
    await Task.findByIdAndUpdate(taskId, {
      status: "active",
      pausedAt: null,
    });

    return budget.save();
  }

  /**
   * Get budget analytics
   */
  static async getBudgetAnalytics(taskId: string): Promise<any> {
    const budget = await TaskBudget.findOne({
      taskId: new mongoose.Types.ObjectId(taskId),
    }).populate("taskId");

    if (!budget) {
      throw new Error("Budget not found");
    }

    // Calculate daily spending
    const dailySpending = this.calculateDailySpending(budget.spendingHistory);

    // Calculate average spending per submission
    const avgSpendingPerSubmission =
      budget.spendingHistory.length > 0
        ? budget.spentBudget / budget.spendingHistory.length
        : 0;

    // Estimate completion date
    const estimatedCompletionDate = this.estimateCompletionDate(
      budget,
      dailySpending
    );

    return {
      totalBudget: budget.totalBudget,
      spentBudget: budget.spentBudget,
      remainingBudget: budget.remainingBudget,
      spendingPercentage: (budget.spentBudget / budget.totalBudget) * 100,
      dailyLimit: budget.dailyLimit,
      dailySpending,
      avgSpendingPerSubmission,
      totalSubmissions: budget.spendingHistory.length,
      isPaused: budget.isPaused,
      pauseReason: budget.pauseReason,
      estimatedCompletionDate,
      alertThresholds: budget.alertThresholds,
    };
  }

  /**
   * Calculate daily spending
   */
  private static calculateDailySpending(
    spendingHistory: ITaskBudget["spendingHistory"]
  ): Record<string, number> {
    const dailySpending: Record<string, number> = {};

    spendingHistory.forEach((entry) => {
      const dateKey = new Date(entry.date).toISOString().split("T")[0];
      dailySpending[dateKey] = (dailySpending[dateKey] || 0) + entry.amount;
    });

    return dailySpending;
  }

  /**
   * Estimate completion date based on spending rate
   */
  private static estimateCompletionDate(
    budget: ITaskBudget,
    dailySpending: Record<string, number>
  ): Date | null {
    if (budget.remainingBudget <= 0) {
      return null;
    }

    const spendingDays = Object.keys(dailySpending).length;
    if (spendingDays === 0) {
      return null;
    }

    const avgDailySpending =
      Object.values(dailySpending).reduce((sum, val) => sum + val, 0) /
      spendingDays;

    if (avgDailySpending === 0) {
      return null;
    }

    const daysRemaining = Math.ceil(budget.remainingBudget / avgDailySpending);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);

    return estimatedDate;
  }

  /**
   * Apply rollover to new task
   */
  static async applyRollover(
    oldTaskId: string,
    newTaskId: string
  ): Promise<void> {
    const oldBudget = await TaskBudget.findOne({
      taskId: new mongoose.Types.ObjectId(oldTaskId),
    });

    if (!oldBudget || !oldBudget.rolloverEnabled) {
      return;
    }

    const rolloverAmount = oldBudget.remainingBudget;
    if (rolloverAmount <= 0) {
      return;
    }

    const newBudget = await TaskBudget.findOne({
      taskId: new mongoose.Types.ObjectId(newTaskId),
    });

    if (newBudget) {
      newBudget.totalBudget += rolloverAmount;
      newBudget.remainingBudget += rolloverAmount;
      newBudget.rolloverAmount = rolloverAmount;
      await newBudget.save();
    }

    // Mark old budget as rolled over
    oldBudget.remainingBudget = 0;
    await oldBudget.save();
  }

  /**
   * Get sponsor budget summary
   */
  static async getSponsorBudgetSummary(sponsorId: string): Promise<any> {
    const budgets = await TaskBudget.find({
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
    });

    const totalAllocated = budgets.reduce(
      (sum, budget) => sum + budget.totalBudget,
      0
    );
    const totalSpent = budgets.reduce(
      (sum, budget) => sum + budget.spentBudget,
      0
    );
    const totalRemaining = budgets.reduce(
      (sum, budget) => sum + budget.remainingBudget,
      0
    );

    const activeBudgets = budgets.filter(
      (b) => !b.isPaused && b.remainingBudget > 0
    );
    const pausedBudgets = budgets.filter((b) => b.isPaused);
    const exhaustedBudgets = budgets.filter((b) => b.remainingBudget <= 0);

    return {
      totalBudgets: budgets.length,
      totalAllocated,
      totalSpent,
      totalRemaining,
      spendingPercentage:
        totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
      activeBudgets: activeBudgets.length,
      pausedBudgets: pausedBudgets.length,
      exhaustedBudgets: exhaustedBudgets.length,
    };
  }
}
