import mongoose from "mongoose";
import { Task, ITask } from "../models/Task.js";
import { TaskSubmission, ITaskSubmission } from "../models/TaskSubmission.js";
import { walletService } from "./WalletService.js";
import { User } from "../models/User.js";

class TaskService {
  /**
   * Create a new task (Sponsor)
   */
  async createTask(
    sponsorId: string,
    taskData: {
      title: string;
      description: string;
      category: ITask["category"];
      reward: number;
      totalSlots: number;
      requirements: string[];
      proofRequirements: ITask["proofRequirements"];
      estimatedTime: number;
      expiresAt: Date;
      targetAudience?: ITask["targetAudience"];
    }
  ): Promise<ITask> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Calculate total cost (reward * slots + 10% platform fee)
      const totalReward = taskData.reward * taskData.totalSlots;
      const platformFee = totalReward * 0.1;
      const totalCost = totalReward + platformFee;

      // Check sponsor's wallet balance
      const wallet = await walletService.getWalletByUserId(sponsorId);
      if (!wallet || wallet.availableBalance < totalCost) {
        throw new Error("Insufficient balance to create task");
      }

      // Hold funds in escrow
      await walletService.holdInEscrow(
        sponsorId,
        totalCost,
        "task_creation",
        `Task: ${taskData.title}`,
        session
      );

      // Create task
      const task = await Task.create(
        [
          {
            sponsorId,
            ...taskData,
            availableSlots: taskData.totalSlots,
            completedSlots: 0,
            status: "active",
          },
        ],
        { session }
      );

      await session.commitTransaction();
      console.log(`✅ Task created: ${task[0]._id}`);

      return task[0];
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Create task error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Browse tasks with filters (Worker)
   */
  async browseTasks(
    filters: {
      category?: string;
      minReward?: number;
      maxReward?: number;
      minDuration?: number;
      maxDuration?: number;
      search?: string;
      sortBy?: "newest" | "reward" | "duration";
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{ tasks: ITask[]; total: number; pages: number }> {
    try {
      const query: any = {
        status: "active",
        availableSlots: { $gt: 0 },
        expiresAt: { $gt: new Date() },
      };

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.minReward || filters.maxReward) {
        query.reward = {};
        if (filters.minReward) query.reward.$gte = filters.minReward;
        if (filters.maxReward) query.reward.$lte = filters.maxReward;
      }

      if (filters.minDuration || filters.maxDuration) {
        query.estimatedTime = {};
        if (filters.minDuration) query.estimatedTime.$gte = filters.minDuration;
        if (filters.maxDuration) query.estimatedTime.$lte = filters.maxDuration;
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
        ];
      }

      // Sorting
      let sort: any = { createdAt: -1 }; // Default: newest first
      if (filters.sortBy === "reward") {
        sort = { reward: -1 };
      } else if (filters.sortBy === "duration") {
        sort = { estimatedTime: 1 };
      }

      const skip = (page - 1) * limit;

      const [tasks, total] = await Promise.all([
        Task.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate(
            "sponsorId",
            "email profile.firstName profile.lastName reputation"
          )
          .lean(),
        Task.countDocuments(query),
      ]);

      return {
        tasks: tasks as ITask[],
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("❌ Browse tasks error:", error);
      throw new Error("Failed to browse tasks");
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<ITask | null> {
    try {
      const task = await Task.findById(taskId)
        .populate(
          "sponsorId",
          "email profile.firstName profile.lastName reputation"
        )
        .lean();

      return task as ITask | null;
    } catch (error) {
      console.error("❌ Get task error:", error);
      throw new Error("Failed to get task");
    }
  }

  /**
   * Accept task (Worker)
   */
  async acceptTask(taskId: string, workerId: string): Promise<ITaskSubmission> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get task
      const task = await Task.findById(taskId).session(session);
      if (!task) {
        throw new Error("Task not found");
      }

      // Validate task status
      if (task.status !== "active") {
        throw new Error("Task is not active");
      }

      if (task.availableSlots <= 0) {
        throw new Error("No available slots");
      }

      if (new Date() > task.expiresAt) {
        throw new Error("Task has expired");
      }

      // Check if worker already accepted this task
      const existingSubmission = await TaskSubmission.findOne({
        taskId,
        workerId,
      }).session(session);

      if (existingSubmission) {
        throw new Error("You have already accepted this task");
      }

      // Check target audience criteria
      if (task.targetAudience?.minReputation) {
        const worker = await User.findById(workerId).session(session);
        if (
          !worker ||
          worker.reputation.score < task.targetAudience.minReputation
        ) {
          throw new Error("You do not meet the reputation requirements");
        }
      }

      // Decrease available slots
      task.availableSlots -= 1;
      await task.save({ session });

      // Create submission record
      const submission = await TaskSubmission.create(
        [
          {
            taskId,
            workerId,
            sponsorId: task.sponsorId,
            proofs: [],
            status: "pending",
            acceptedAt: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      console.log(`✅ Task accepted: ${taskId} by ${workerId}`);

      return submission[0];
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Accept task error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Submit task completion (Worker)
   */
  async submitTask(
    submissionId: string,
    workerId: string,
    proofs: ITaskSubmission["proofs"]
  ): Promise<ITaskSubmission> {
    try {
      const submission = await TaskSubmission.findOne({
        _id: submissionId,
        workerId,
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      if (submission.status !== "pending") {
        throw new Error("Submission already reviewed");
      }

      // Update submission
      submission.proofs = proofs;
      submission.submittedAt = new Date();
      await submission.save();

      console.log(`✅ Task submitted: ${submissionId}`);
      return submission;
    } catch (error) {
      console.error("❌ Submit task error:", error);
      throw error;
    }
  }

  /**
   * Review submission (Sponsor)
   */
  async reviewSubmission(
    submissionId: string,
    sponsorId: string,
    action: "approve" | "reject" | "request_revision",
    reviewNotes?: string
  ): Promise<ITaskSubmission> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const submission = await TaskSubmission.findOne({
        _id: submissionId,
        sponsorId,
      })
        .populate("taskId")
        .session(session);

      if (!submission) {
        throw new Error("Submission not found");
      }

      if (
        submission.status !== "pending" &&
        submission.status !== "resubmitted"
      ) {
        throw new Error("Submission already reviewed");
      }

      const task = submission.taskId as any as ITask;

      if (action === "approve") {
        // Approve submission
        submission.status = "approved";
        submission.reviewNotes = reviewNotes;
        submission.reviewedAt = new Date();

        // Add to review history
        if (!submission.reviewHistory) {
          submission.reviewHistory = [];
        }
        submission.reviewHistory.push({
          action: "approve",
          notes: reviewNotes,
          reviewedAt: new Date(),
          reviewedBy: new mongoose.Types.ObjectId(sponsorId),
        });

        await submission.save({ session });

        // Update task completed slots
        task.completedSlots += 1;
        if (task.completedSlots >= task.totalSlots) {
          task.status = "completed";
        }
        await task.save({ session });

        // Release escrow and pay worker
        await walletService.releaseFromEscrow(
          sponsorId.toString(),
          task.reward,
          submission.workerId.toString(),
          "task_earning",
          `Task completed: ${task.title}`,
          task._id.toString(),
          "Task",
          session
        );

        // Update worker reputation
        await this.updateWorkerReputation(
          submission.workerId.toString(),
          "approved",
          session
        );

        console.log(`✅ Submission approved: ${submissionId}`);

        // Process referral commission (after transaction commits)
        session.commitTransaction().then(async () => {
          try {
            const { ReferralService } = await import("./ReferralService.js");
            await ReferralService.processCommission(
              submission.workerId.toString(),
              task.reward
            );
          } catch (referralError) {
            console.error(
              "❌ Failed to process referral commission:",
              referralError
            );
          }
        });
      } else if (action === "reject") {
        // Reject submission
        submission.status = "rejected";
        submission.reviewNotes = reviewNotes;
        submission.reviewedAt = new Date();

        // Add to review history
        if (!submission.reviewHistory) {
          submission.reviewHistory = [];
        }
        submission.reviewHistory.push({
          action: "reject",
          notes: reviewNotes,
          reviewedAt: new Date(),
          reviewedBy: new mongoose.Types.ObjectId(sponsorId),
        });

        await submission.save({ session });

        // Return slot to task
        task.availableSlots += 1;
        await task.save({ session });

        // Update worker reputation
        await this.updateWorkerReputation(
          submission.workerId.toString(),
          "rejected",
          session
        );

        console.log(`✅ Submission rejected: ${submissionId}`);
      } else if (action === "request_revision") {
        // Request revision
        submission.status = "revision_requested";
        submission.revisionNotes = reviewNotes;
        submission.revisionRequestedAt = new Date();
        submission.reviewedAt = new Date();

        // Add to review history
        if (!submission.reviewHistory) {
          submission.reviewHistory = [];
        }
        submission.reviewHistory.push({
          action: "request_revision",
          notes: reviewNotes,
          reviewedAt: new Date(),
          reviewedBy: new mongoose.Types.ObjectId(sponsorId),
        });

        await submission.save({ session });

        console.log(`✅ Revision requested: ${submissionId}`);
      }

      await session.commitTransaction();
      return submission;
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Review submission error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get worker's accepted tasks
   */
  async getWorkerTasks(
    workerId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    submissions: ITaskSubmission[];
    total: number;
    pages: number;
  }> {
    try {
      const query: any = { workerId };
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [submissions, total] = await Promise.all([
        TaskSubmission.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("taskId")
          .populate("sponsorId", "email profile.firstName profile.lastName")
          .lean(),
        TaskSubmission.countDocuments(query),
      ]);

      return {
        submissions: submissions as ITaskSubmission[],
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("❌ Get worker tasks error:", error);
      throw new Error("Failed to get worker tasks");
    }
  }

  /**
   * Get sponsor's created tasks
   */
  async getSponsorTasks(
    sponsorId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ tasks: ITask[]; total: number; pages: number }> {
    try {
      const query: any = { sponsorId };
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [tasks, total] = await Promise.all([
        Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Task.countDocuments(query),
      ]);

      return {
        tasks: tasks as ITask[],
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("❌ Get sponsor tasks error:", error);
      throw new Error("Failed to get sponsor tasks");
    }
  }

  /**
   * Get submissions for a task (Sponsor)
   */
  async getTaskSubmissions(
    taskId: string,
    sponsorId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    submissions: ITaskSubmission[];
    total: number;
    pages: number;
  }> {
    try {
      // Verify task belongs to sponsor
      const task = await Task.findOne({ _id: taskId, sponsorId });
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      const query: any = { taskId };
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [submissions, total] = await Promise.all([
        TaskSubmission.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate(
            "workerId",
            "email profile.firstName profile.lastName reputation"
          )
          .lean(),
        TaskSubmission.countDocuments(query),
      ]);

      return {
        submissions: submissions as ITaskSubmission[],
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("❌ Get task submissions error:", error);
      throw error;
    }
  }

  /**
   * Update task (Sponsor)
   */
  async updateTask(
    taskId: string,
    sponsorId: string,
    updates: Partial<ITask>
  ): Promise<ITask> {
    try {
      const task = await Task.findOne({ _id: taskId, sponsorId });
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      // Prevent updating certain fields
      delete (updates as any).sponsorId;
      delete (updates as any).totalSlots;
      delete (updates as any).availableSlots;
      delete (updates as any).completedSlots;

      Object.assign(task, updates);
      await task.save();

      console.log(`✅ Task updated: ${taskId}`);
      return task;
    } catch (error) {
      console.error("❌ Update task error:", error);
      throw error;
    }
  }

  /**
   * Pause/Resume task (Sponsor)
   */
  async toggleTaskStatus(taskId: string, sponsorId: string): Promise<ITask> {
    try {
      const task = await Task.findOne({ _id: taskId, sponsorId });
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      if (task.status === "active") {
        task.status = "paused";
      } else if (task.status === "paused") {
        task.status = "active";
      } else {
        throw new Error("Cannot toggle task status");
      }

      await task.save();
      console.log(`✅ Task status toggled: ${taskId} - ${task.status}`);
      return task;
    } catch (error) {
      console.error("❌ Toggle task status error:", error);
      throw error;
    }
  }

  /**
   * Delete task (Sponsor)
   */
  async deleteTask(taskId: string, sponsorId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const task = await Task.findOne({ _id: taskId, sponsorId }).session(
        session
      );
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      // Check if task has active submissions
      const activeSubmissions = await TaskSubmission.countDocuments({
        taskId,
        status: { $in: ["pending", "revision_requested"] },
      }).session(session);

      if (activeSubmissions > 0) {
        throw new Error("Cannot delete task with pending submissions");
      }

      // Refund escrow if task not completed
      if (task.status !== "completed") {
        const totalReward = task.reward * task.totalSlots;
        const platformFee = totalReward * 0.1;
        const totalCost = totalReward + platformFee;
        const usedAmount = task.reward * task.completedSlots;
        const refundAmount = totalCost - usedAmount;

        if (refundAmount > 0) {
          await walletService.refundFromEscrow(
            sponsorId,
            refundAmount,
            "task_cancellation",
            `Task cancelled: ${task.title}`,
            session
          );
        }
      }

      // Mark task as cancelled
      task.status = "cancelled";
      await task.save({ session });

      await session.commitTransaction();
      console.log(`✅ Task deleted: ${taskId}`);
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Delete task error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update worker reputation based on submission result
   */
  private async updateWorkerReputation(
    workerId: string,
    result: "approved" | "rejected",
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      const worker = await User.findById(workerId).session(session);
      if (!worker) return;

      if (result === "approved") {
        worker.reputation.totalTasksCompleted += 1;
        worker.reputation.approvalRate =
          (worker.reputation.approvalRate *
            (worker.reputation.totalTasksCompleted - 1) +
            100) /
          worker.reputation.totalTasksCompleted;
      } else {
        worker.reputation.totalTasksCompleted += 1;
        worker.reputation.approvalRate =
          (worker.reputation.approvalRate *
            (worker.reputation.totalTasksCompleted - 1)) /
          worker.reputation.totalTasksCompleted;
      }

      // Recalculate reputation score
      worker.reputation.score = Math.min(
        100,
        worker.reputation.approvalRate * 0.7 +
          Math.min(worker.reputation.totalTasksCompleted / 10, 30)
      );

      await worker.save({ session });
    } catch (error) {
      console.error("❌ Update reputation error:", error);
    }
  }

  /**
   * Handle expired tasks (cron job)
   */
  async handleExpiredTasks(): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const expiredTasks = await Task.find({
        status: "active",
        expiresAt: { $lt: new Date() },
      }).session(session);

      for (const task of expiredTasks) {
        task.status = "expired";
        await task.save({ session });

        // Refund unused escrow
        const usedAmount = task.reward * task.completedSlots;
        const totalReward = task.reward * task.totalSlots;
        const platformFee = totalReward * 0.1;
        const totalCost = totalReward + platformFee;
        const refundAmount = totalCost - usedAmount;

        if (refundAmount > 0) {
          await walletService.refundFromEscrow(
            task.sponsorId.toString(),
            refundAmount,
            "task_expiration",
            `Task expired: ${task.title}`,
            session
          );
        }
      }

      await session.commitTransaction();
      console.log(`✅ Handled ${expiredTasks.length} expired tasks`);
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Handle expired tasks error:", error);
    } finally {
      session.endSession();
    }
  }

  /**
   * Pause task (Sponsor)
   */
  async pauseTask(taskId: string, sponsorId: string): Promise<ITask> {
    try {
      const task = await Task.findOne({ _id: taskId, sponsorId });
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      if (task.status !== "active") {
        throw new Error("Only active tasks can be paused");
      }

      task.status = "paused";
      task.pausedAt = new Date();
      await task.save();

      console.log(`✅ Task paused: ${taskId}`);
      return task;
    } catch (error) {
      console.error("❌ Pause task error:", error);
      throw error;
    }
  }

  /**
   * Resume task (Sponsor)
   */
  async resumeTask(taskId: string, sponsorId: string): Promise<ITask> {
    try {
      const task = await Task.findOne({ _id: taskId, sponsorId });
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      if (task.status !== "paused") {
        throw new Error("Only paused tasks can be resumed");
      }

      task.status = "active";
      task.pausedAt = undefined;
      await task.save();

      console.log(`✅ Task resumed: ${taskId}`);
      return task;
    } catch (error) {
      console.error("❌ Resume task error:", error);
      throw error;
    }
  }

  /**
   * Cancel task and refund escrow (Sponsor)
   */
  async cancelTask(
    taskId: string,
    sponsorId: string
  ): Promise<{ task: ITask; refundAmount: number }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const task = await Task.findOne({ _id: taskId, sponsorId }).session(
        session
      );
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      if (task.status === "cancelled" || task.status === "completed") {
        throw new Error("Task cannot be cancelled");
      }

      // Reject all pending submissions
      await TaskSubmission.updateMany(
        { taskId, status: { $in: ["pending", "revision_requested"] } },
        { status: "rejected", reviewedAt: new Date() }
      ).session(session);

      // Calculate refund amount (remaining slots * reward + platform fee)
      const completedSlots = await TaskSubmission.countDocuments({
        taskId,
        status: "approved",
      }).session(session);

      const remainingSlots = task.totalSlots - completedSlots;
      const refundReward = remainingSlots * task.reward;
      const refundPlatformFee = refundReward * 0.1;
      const refundAmount = refundReward + refundPlatformFee;

      if (refundAmount > 0) {
        await walletService.refundFromEscrow(
          sponsorId,
          refundAmount,
          "task_cancellation",
          `Task cancelled: ${task.title}`,
          session
        );
      }

      // Update task status
      task.status = "cancelled";
      task.cancelledAt = new Date();
      await task.save({ session });

      await session.commitTransaction();
      console.log(`✅ Task cancelled: ${taskId}, refund: ₦${refundAmount}`);

      return { task, refundAmount };
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Cancel task error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get detailed task information (Sponsor)
   */
  async getTaskDetails(
    taskId: string,
    sponsorId: string
  ): Promise<{
    task: ITask;
    stats: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      revision_requested: number;
    };
    escrowBalance: number;
    completionRate: number;
  }> {
    try {
      const task = await Task.findOne({ _id: taskId, sponsorId });
      if (!task) {
        throw new Error("Task not found or unauthorized");
      }

      // Get submission statistics
      const submissionStats = await TaskSubmission.aggregate([
        { $match: { taskId: new mongoose.Types.ObjectId(taskId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        revision_requested: 0,
      };

      submissionStats.forEach((stat) => {
        stats[stat._id as keyof typeof stats] = stat.count;
        stats.total += stat.count;
      });

      // Calculate escrow balance for this task
      const escrowBalance = (task.totalSlots - stats.approved) * task.reward;

      // Calculate completion rate
      const completionRate =
        task.totalSlots > 0 ? (stats.approved / task.totalSlots) * 100 : 0;

      return {
        task,
        stats,
        escrowBalance,
        completionRate,
      };
    } catch (error) {
      console.error("❌ Get task details error:", error);
      throw error;
    }
  }

  /**
   * Get sponsor dashboard statistics
   */
  async getDashboardStats(sponsorId: string): Promise<{
    totalTasks: number;
    activeTasks: number;
    pendingSubmissions: number;
    totalEscrow: number;
    approvalRate: number;
    recentActivity: ITaskSubmission[];
  }> {
    try {
      // Get task statistics
      const taskStats = await Task.aggregate([
        { $match: { sponsorId: new mongoose.Types.ObjectId(sponsorId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalReward: { $sum: { $multiply: ["$reward", "$totalSlots"] } },
          },
        },
      ]);

      // Get submission statistics
      const tasks = await Task.find({ sponsorId }).select("_id");
      const taskIds = tasks.map((t) => t._id);

      const submissionStats = await TaskSubmission.aggregate([
        { $match: { taskId: { $in: taskIds } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Calculate totals
      let totalTasks = 0;
      let activeTasks = 0;
      let totalEscrow = 0;

      taskStats.forEach((stat) => {
        totalTasks += stat.count;
        if (stat._id === "active" || stat._id === "paused") {
          activeTasks += stat.count;
          totalEscrow += stat.totalReward;
        }
      });

      let pendingSubmissions = 0;
      let approvedSubmissions = 0;
      let totalSubmissions = 0;

      submissionStats.forEach((stat) => {
        totalSubmissions += stat.count;
        if (stat._id === "pending" || stat._id === "revision_requested") {
          pendingSubmissions += stat.count;
        }
        if (stat._id === "approved") {
          approvedSubmissions += stat.count;
        }
      });

      // Calculate approval rate
      const approvalRate =
        totalSubmissions > 0
          ? Math.round((approvedSubmissions / totalSubmissions) * 100 * 100) /
            100
          : 0;

      // Get recent activity (last 10 submissions)
      const recentActivity = await TaskSubmission.find({
        taskId: { $in: taskIds },
      })
        .populate("taskId", "title")
        .populate("workerId", "profile.firstName profile.lastName")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      return {
        totalTasks,
        activeTasks,
        pendingSubmissions,
        totalEscrow,
        approvalRate,
        recentActivity: recentActivity as ITaskSubmission[],
      };
    } catch (error) {
      console.error("❌ Get dashboard stats error:", error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
