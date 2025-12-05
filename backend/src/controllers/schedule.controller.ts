import { Request, Response } from "express";
import { ScheduleService } from "../services/ScheduleService";

export class ScheduleController {
  /**
   * Create schedule
   * POST /api/schedules
   */
  static async createSchedule(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const { taskId, ...scheduleData } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: "Task ID is required",
        });
      }

      const schedule = await ScheduleService.createSchedule(
        taskId,
        userId,
        scheduleData
      );

      res.status(201).json({
        success: true,
        message: "Schedule created successfully",
        data: schedule,
      });
    } catch (error: any) {
      console.error("Create schedule error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create schedule",
        error: error.message,
      });
    }
  }

  /**
   * Get schedule by ID
   * GET /api/schedules/:id
   */
  static async getSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const schedule = await ScheduleService.getSchedule(id);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: "Schedule not found",
        });
      }

      res.status(200).json({
        success: true,
        data: schedule,
      });
    } catch (error: any) {
      console.error("Get schedule error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get schedule",
        error: error.message,
      });
    }
  }

  /**
   * Get sponsor schedules
   * GET /api/schedules
   */
  static async getSponsorSchedules(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const { status, scheduleType } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const schedules = await ScheduleService.getSponsorSchedules(userId, {
        status: status as string,
        scheduleType: scheduleType as string,
      });

      res.status(200).json({
        success: true,
        data: schedules,
      });
    } catch (error: any) {
      console.error("Get schedules error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get schedules",
        error: error.message,
      });
    }
  }

  /**
   * Update schedule
   * PUT /api/schedules/:id
   */
  static async updateSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const schedule = await ScheduleService.updateSchedule(id, updates);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: "Schedule not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Schedule updated successfully",
        data: schedule,
      });
    } catch (error: any) {
      console.error("Update schedule error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update schedule",
        error: error.message,
      });
    }
  }

  /**
   * Cancel schedule
   * DELETE /api/schedules/:id
   */
  static async cancelSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cancelled = await ScheduleService.cancelSchedule(id);

      if (!cancelled) {
        return res.status(404).json({
          success: false,
          message: "Schedule not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Schedule cancelled successfully",
      });
    } catch (error: any) {
      console.error("Cancel schedule error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel schedule",
        error: error.message,
      });
    }
  }

  /**
   * Check schedule conflicts
   * POST /api/schedules/check-conflicts
   */
  static async checkConflicts(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const { scheduledFor } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!scheduledFor) {
        return res.status(400).json({
          success: false,
          message: "Scheduled time is required",
        });
      }

      const conflicts = await ScheduleService.checkConflicts(
        userId,
        new Date(scheduledFor)
      );

      res.status(200).json({
        success: true,
        data: {
          hasConflicts: conflicts.length > 0,
          conflicts,
        },
      });
    } catch (error: any) {
      console.error("Check conflicts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check conflicts",
        error: error.message,
      });
    }
  }

  /**
   * Get schedule statistics
   * GET /api/schedules/stats
   */
  static async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const stats = await ScheduleService.getScheduleStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Get stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get statistics",
        error: error.message,
      });
    }
  }
}
