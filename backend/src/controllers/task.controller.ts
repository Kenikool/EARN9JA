import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { taskService } from "../services/TaskService.js";

class TaskController {
  /**
   * Browse tasks (Worker)
   */
  async browseTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        category,
        minReward,
        maxReward,
        minDuration,
        maxDuration,
        search,
        sortBy,
        page = "1",
        limit = "20",
      } = req.query;

      const filters = {
        category: category as string,
        minReward: minReward ? parseFloat(minReward as string) : undefined,
        maxReward: maxReward ? parseFloat(maxReward as string) : undefined,
        minDuration: minDuration ? parseInt(minDuration as string) : undefined,
        maxDuration: maxDuration ? parseInt(maxDuration as string) : undefined,
        search: search as string,
        sortBy: sortBy as "newest" | "reward" | "duration",
      };

      const result = await taskService.browseTasks(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Browse tasks error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to browse tasks",
      });
    }
  }

  /**
   * Get task by ID
   */
  async getTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;

      const task = await taskService.getTaskById(taskId);

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        task,
      });
    } catch (error: any) {
      console.error("Get task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get task",
      });
    }
  }

  /**
   * Create task (Sponsor)
   */
  async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const taskData = {
        ...req.body,
        expiresAt: new Date(req.body.expiresAt),
      };

      const task = await taskService.createTask(userId, taskData);

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        task,
      });
    } catch (error: any) {
      console.error("Create task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create task",
      });
    }
  }

  /**
   * Update task (Sponsor)
   */
  async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;
      const updates = req.body;

      if (updates.expiresAt) {
        updates.expiresAt = new Date(updates.expiresAt);
      }

      const task = await taskService.updateTask(taskId, userId, updates);

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task,
      });
    } catch (error: any) {
      console.error("Update task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update task",
      });
    }
  }

  /**
   * Toggle task status (Sponsor)
   */
  async toggleTaskStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;

      const task = await taskService.toggleTaskStatus(taskId, userId);

      res.status(200).json({
        success: true,
        message: `Task ${task.status}`,
        task,
      });
    } catch (error: any) {
      console.error("Toggle task status error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to toggle task status",
      });
    }
  }

  /**
   * Delete task (Sponsor)
   */
  async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;

      await taskService.deleteTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete task",
      });
    }
  }

  /**
   * Accept task (Worker)
   */
  async acceptTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;

      const submission = await taskService.acceptTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: "Task accepted successfully",
        submission,
      });
    } catch (error: any) {
      console.error("Accept task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to accept task",
      });
    }
  }

  /**
   * Submit task (Worker)
   */
  async submitTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { submissionId } = req.params;
      const { proofs } = req.body;

      const submission = await taskService.submitTask(
        submissionId,
        userId,
        proofs
      );

      res.status(200).json({
        success: true,
        message: "Task submitted successfully",
        submission,
      });
    } catch (error: any) {
      console.error("Submit task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to submit task",
      });
    }
  }

  /**
   * Get worker's tasks
   */
  async getMyTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { status, page = "1", limit = "20" } = req.query;

      const result = await taskService.getWorkerTasks(
        userId,
        status as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Get my tasks error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get tasks",
      });
    }
  }

  /**
   * Get sponsor's campaigns
   */
  async getMyCampaigns(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { status, page = "1", limit = "20" } = req.query;

      const result = await taskService.getSponsorTasks(
        userId,
        status as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Get my campaigns error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get campaigns",
      });
    }
  }

  /**
   * Get task submissions (Sponsor)
   */
  async getTaskSubmissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;
      const { status, page = "1", limit = "20" } = req.query;

      const result = await taskService.getTaskSubmissions(
        taskId,
        userId,
        status as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Get task submissions error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get submissions",
      });
    }
  }

  /**
   * Review submission (Sponsor)
   */
  async reviewSubmission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { submissionId } = req.params;
      const { action, reviewNotes } = req.body;

      const submission = await taskService.reviewSubmission(
        submissionId,
        userId,
        action,
        reviewNotes
      );

      res.status(200).json({
        success: true,
        message: `Submission ${action}d successfully`,
        submission,
      });
    } catch (error: any) {
      console.error("Review submission error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to review submission",
      });
    }
  }

  /**
   * Pause task (Sponsor)
   */
  async pauseTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;

      const task = await taskService.pauseTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: "Task paused successfully",
        task,
      });
    } catch (error: any) {
      console.error("Pause task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to pause task",
      });
    }
  }

  /**
   * Resume task (Sponsor)
   */
  async resumeTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;

      const task = await taskService.resumeTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: "Task resumed successfully",
        task,
      });
    } catch (error: any) {
      console.error("Resume task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to resume task",
      });
    }
  }

  /**
   * Cancel task (Sponsor)
   */
  async cancelTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;

      const result = await taskService.cancelTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: "Task cancelled and funds refunded successfully",
        ...result,
      });
    } catch (error: any) {
      console.error("Cancel task error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to cancel task",
      });
    }
  }

  /**
   * Get task details (Sponsor)
   */
  async getTaskDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { taskId } = req.params;

      const details = await taskService.getTaskDetails(taskId, userId);

      res.status(200).json({
        success: true,
        ...details,
      });
    } catch (error: any) {
      console.error("Get task details error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get task details",
      });
    }
  }

  /**
   * Get dashboard stats (Sponsor)
   */
  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const stats = await taskService.getDashboardStats(userId);

      res.status(200).json({
        success: true,
        ...stats,
      });
    } catch (error: any) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get dashboard stats",
      });
    }
  }
}

export const taskController = new TaskController();
