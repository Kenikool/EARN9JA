import NotificationService from "./NotificationService.js";

/**
 * Notification helper functions for easy integration across services
 * All methods use sendToUser to ensure push notifications are sent
 */

export class NotificationHelpers {
  // SPONSOR NOTIFICATIONS

  static async notifyTaskExpiring(
    sponsorId: string,
    taskId: string,
    taskTitle: string,
    hoursRemaining: number
  ) {
    await NotificationService.sendToUser({
      userId: sponsorId,
      title: "Task Expiring Soon ⏰",
      body: `Your task "${taskTitle}" will expire in ${hoursRemaining} hours. ${
        hoursRemaining < 12 ? "Consider extending the deadline." : ""
      }`,
      type: "task_expiring",
      data: { taskId, hoursRemaining },
      actionUrl: `/sponsor/task/${taskId}`,
    });
  }

  static async notifyLowEscrowBalance(
    sponsorId: string,
    currentBalance: number,
    threshold: number
  ) {
    await NotificationService.sendToUser({
      userId: sponsorId,
      title: "Low Escrow Balance ⚠️",
      body: `Your escrow balance is ₦${currentBalance.toLocaleString()}. Top up to continue posting tasks.`,
      type: "low_escrow_balance",
      data: { currentBalance, threshold },
      actionUrl: "/sponsor/escrow-dashboard",
    });
  }

  static async notifyDisputeFiled(
    sponsorId: string,
    disputeId: string,
    taskTitle: string,
    workerId: string
  ) {
    await NotificationService.sendToUser({
      userId: sponsorId,
      title: "Dispute Filed 🚨",
      body: `A worker has filed a dispute for task "${taskTitle}". Please review and respond.`,
      type: "dispute_filed",
      data: { disputeId, taskTitle, workerId },
      actionUrl: `/sponsor/disputes/${disputeId}`,
    });
  }

  static async notifyTopupConfirmed(
    sponsorId: string,
    amount: number,
    newBalance: number
  ) {
    await NotificationService.sendToUser({
      userId: sponsorId,
      title: "Top-up Confirmed ✅",
      body: `₦${amount.toLocaleString()} has been added to your escrow. New balance: ₦${newBalance.toLocaleString()}`,
      type: "topup_confirmed",
      data: { amount, newBalance },
      actionUrl: "/sponsor/escrow-dashboard",
    });
  }

  static async notifyTaskPaused(
    sponsorId: string,
    taskId: string,
    taskTitle: string
  ) {
    await NotificationService.sendToUser({
      userId: sponsorId,
      title: "Task Paused",
      body: `Your task "${taskTitle}" has been paused. Workers can no longer accept it.`,
      type: "task_paused",
      data: { taskId },
      actionUrl: `/sponsor/task/${taskId}`,
    });
  }

  static async notifyTaskCancelled(
    sponsorId: string,
    taskId: string,
    taskTitle: string,
    refundAmount: number
  ) {
    await NotificationService.sendToUser({
      userId: sponsorId,
      title: "Task Cancelled",
      body: `Your task "${taskTitle}" has been cancelled. ₦${refundAmount.toLocaleString()} refunded to escrow.`,
      type: "task_cancelled",
      data: { taskId, refundAmount },
      actionUrl: "/sponsor/escrow-dashboard",
    });
  }

  // WORKER NOTIFICATIONS

  static async notifyNewTaskAvailable(
    workerId: string,
    taskId: string,
    taskTitle: string,
    reward: number,
    category: string
  ) {
    await NotificationService.sendToUser({
      userId: workerId,
      title: "New Task Available! 🎯",
      body: `"${taskTitle}" - Earn ₦${reward.toLocaleString()}. Category: ${category}`,
      type: "new_task_available",
      data: { taskId, reward, category },
      actionUrl: `/tasks/${taskId}`,
    });
  }

  static async notifyTaskDeadline(
    workerId: string,
    taskId: string,
    taskTitle: string,
    hoursRemaining: number
  ) {
    await NotificationService.sendToUser({
      userId: workerId,
      title: "Task Deadline Approaching ⏰",
      body: `"${taskTitle}" is due in ${hoursRemaining} hours. Submit your work soon!`,
      type: "task_deadline",
      data: { taskId, hoursRemaining },
      actionUrl: `/tasks/submission/${taskId}`,
    });
  }

  static async notifyReferralBonus(
    workerId: string,
    referralName: string,
    bonusAmount: number,
    reason: string
  ) {
    await NotificationService.sendToUser({
      userId: workerId,
      title: "Referral Bonus Earned! 🎁",
      body: `You earned ₦${bonusAmount.toLocaleString()} because ${referralName} ${reason}`,
      type: "referral_bonus",
      data: { referralName, bonusAmount, reason },
      actionUrl: "/profile/referrals",
    });
  }

  static async notifyAchievementUnlocked(
    userId: string,
    achievementId: string,
    achievementName: string,
    achievementDescription: string,
    reward?: number
  ) {
    await NotificationService.sendToUser({
      userId,
      title: "Achievement Unlocked! 🏆",
      body: `"${achievementName}" - ${achievementDescription}${
        reward ? ` +₦${reward}` : ""
      }`,
      type: "achievement_unlocked",
      data: { achievementId, reward },
      actionUrl: "/gamification/achievements",
    });
  }

  static async notifyChallengeProgress(
    userId: string,
    challengeId: string,
    challengeName: string,
    progress: number,
    target: number
  ) {
    const percentage = Math.round((progress / target) * 100);
    await NotificationService.sendToUser({
      userId,
      title: "Challenge Progress 📊",
      body: `"${challengeName}" - ${progress}/${target} (${percentage}%) Keep going!`,
      type: "challenge_progress",
      data: { challengeId, progress, target, percentage },
      actionUrl: `/gamification/challenges/${challengeId}`,
    });
  }

  static async notifyDailyBonusAvailable(userId: string, streak: number) {
    await NotificationService.sendToUser({
      userId,
      title: "Daily Bonus Available! 🎁",
      body: `Your daily bonus is ready to claim! Current streak: ${streak} days`,
      type: "daily_bonus_available",
      data: { streak },
      actionUrl: "/gamification/daily-bonus",
    });
  }

  static async notifyWithdrawalProcessed(
    userId: string,
    withdrawalId: string,
    amount: number,
    method: string
  ) {
    await NotificationService.sendToUser({
      userId,
      title: "Withdrawal Processed ✅",
      body: `Your withdrawal of ₦${amount.toLocaleString()} via ${method} has been processed successfully.`,
      type: "withdrawal_processed",
      data: { withdrawalId, amount, method },
      actionUrl: "/wallet/transactions",
    });
  }

  static async notifyPaymentReceived(
    userId: string,
    amount: number,
    source: string,
    transactionId: string
  ) {
    await NotificationService.sendToUser({
      userId,
      title: "Payment Received 💰",
      body: `You received ₦${amount.toLocaleString()} from ${source}`,
      type: "payment_received",
      data: { amount, source, transactionId },
      actionUrl: "/wallet/transactions",
    });
  }
}
