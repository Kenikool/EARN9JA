import { TaskSchedule, ITaskSchedule } from "../models/TaskSchedule.js";
import { Task } from "../models/Task.js";
import mongoose from "mongoose";

export class ScheduleService {
  /**
   * Create a schedule for a task
   */
  static async createSchedule(
    taskId: string,
    sponsorId: string,
    scheduleData: Partial<ITaskSchedule>
  ): Promise<ITaskSchedule> {
    const schedule = new TaskSchedule({
      taskId: new mongoose.Types.ObjectId(taskId),
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
      ...scheduleData,
    });

    // Calculate next execution time
    if (schedule.scheduleType === "scheduled" && schedule.scheduledFor) {
      schedule.nextExecution = schedule.scheduledFor;
    } else if (schedule.scheduleType === "recurring" && schedule.recurring) {
      schedule.nextExecution = this.calculateNextExecution(
        new Date(),
        schedule.recurring,
        schedule.timezone
      );
    } else {
      schedule.nextExecution = new Date(); // Immediate
    }

    return schedule.save();
  }

  /**
   * Get schedule by ID
   */
  static async getSchedule(scheduleId: string): Promise<ITaskSchedule | null> {
    return TaskSchedule.findById(scheduleId).populate("taskId");
  }

  /**
   * Get schedules for a sponsor
   */
  static async getSponsorSchedules(
    sponsorId: string,
    filters?: {
      status?: string;
      scheduleType?: string;
    }
  ): Promise<ITaskSchedule[]> {
    const query: any = {
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
    };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.scheduleType) {
      query.scheduleType = filters.scheduleType;
    }

    return TaskSchedule.find(query)
      .populate("taskId")
      .sort({ nextExecution: 1 });
  }

  /**
   * Update schedule
   */
  static async updateSchedule(
    scheduleId: string,
    updates: Partial<ITaskSchedule>
  ): Promise<ITaskSchedule | null> {
    const schedule = await TaskSchedule.findById(scheduleId);

    if (!schedule) {
      return null;
    }

    Object.assign(schedule, updates);

    // Recalculate next execution if schedule data changed
    if (
      updates.scheduledFor ||
      updates.recurring ||
      updates.scheduleType ||
      updates.timezone
    ) {
      if (schedule.scheduleType === "scheduled" && schedule.scheduledFor) {
        schedule.nextExecution = schedule.scheduledFor;
      } else if (schedule.scheduleType === "recurring" && schedule.recurring) {
        schedule.nextExecution = this.calculateNextExecution(
          schedule.lastExecuted || new Date(),
          schedule.recurring,
          schedule.timezone
        );
      }
    }

    return schedule.save();
  }

  /**
   * Cancel schedule
   */
  static async cancelSchedule(scheduleId: string): Promise<boolean> {
    const result = await TaskSchedule.findByIdAndUpdate(scheduleId, {
      status: "cancelled",
    });

    return !!result;
  }

  /**
   * Get pending schedules ready for execution
   */
  static async getPendingSchedules(): Promise<ITaskSchedule[]> {
    const now = new Date();

    return TaskSchedule.find({
      status: { $in: ["pending", "active"] },
      nextExecution: { $lte: now },
    }).populate("taskId");
  }

  /**
   * Execute schedule (activate task)
   */
  static async executeSchedule(scheduleId: string): Promise<void> {
    const schedule = await TaskSchedule.findById(scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // Activate the task
    await Task.findByIdAndUpdate(schedule.taskId, {
      status: "active",
    });

    // Update schedule
    schedule.lastExecuted = new Date();

    if (schedule.scheduleType === "recurring" && schedule.recurring) {
      // Calculate next execution
      schedule.recurring.occurrencesCount++;

      // Check if schedule should be completed
      const shouldComplete =
        (schedule.recurring.maxOccurrences &&
          schedule.recurring.occurrencesCount >=
            schedule.recurring.maxOccurrences) ||
        (schedule.recurring.endDate &&
          new Date() >= schedule.recurring.endDate);

      if (shouldComplete) {
        schedule.status = "completed";
        schedule.nextExecution = undefined;
      } else {
        schedule.nextExecution = this.calculateNextExecution(
          new Date(),
          schedule.recurring,
          schedule.timezone
        );
        schedule.status = "active";
      }
    } else {
      // One-time schedule
      schedule.status = "completed";
      schedule.nextExecution = undefined;
    }

    await schedule.save();
  }

  /**
   * Calculate next execution time for recurring schedules
   */
  private static calculateNextExecution(
    fromDate: Date,
    recurring: ITaskSchedule["recurring"],
    timezone: string
  ): Date {
    if (!recurring) {
      return fromDate;
    }

    const next = new Date(fromDate);

    switch (recurring.frequency) {
      case "daily":
        next.setDate(next.getDate() + recurring.interval);
        break;

      case "weekly":
        next.setDate(next.getDate() + 7 * recurring.interval);

        // Adjust to specific days of week if specified
        if (recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
          const currentDay = next.getDay();
          const targetDays = recurring.daysOfWeek.sort((a, b) => a - b);

          // Find next target day
          let nextDay = targetDays.find((day) => day > currentDay);
          if (!nextDay) {
            nextDay = targetDays[0];
            next.setDate(next.getDate() + 7);
          }

          const daysToAdd = nextDay - currentDay;
          next.setDate(next.getDate() + daysToAdd);
        }
        break;

      case "monthly":
        next.setMonth(next.getMonth() + recurring.interval);

        // Adjust to specific day of month if specified
        if (recurring.dayOfMonth) {
          next.setDate(recurring.dayOfMonth);
        }
        break;
    }

    return next;
  }

  /**
   * Check for schedule conflicts
   */
  static async checkConflicts(
    sponsorId: string,
    scheduledFor: Date
  ): Promise<ITaskSchedule[]> {
    const startTime = new Date(scheduledFor);
    startTime.setHours(startTime.getHours() - 1);

    const endTime = new Date(scheduledFor);
    endTime.setHours(endTime.getHours() + 1);

    return TaskSchedule.find({
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
      status: { $in: ["pending", "active"] },
      nextExecution: {
        $gte: startTime,
        $lte: endTime,
      },
    }).populate("taskId");
  }

  /**
   * Get schedule statistics for a sponsor
   */
  static async getScheduleStats(sponsorId: string): Promise<any> {
    const schedules = await TaskSchedule.find({
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
    });

    return {
      total: schedules.length,
      pending: schedules.filter((s) => s.status === "pending").length,
      active: schedules.filter((s) => s.status === "active").length,
      completed: schedules.filter((s) => s.status === "completed").length,
      cancelled: schedules.filter((s) => s.status === "cancelled").length,
      immediate: schedules.filter((s) => s.scheduleType === "immediate").length,
      scheduled: schedules.filter((s) => s.scheduleType === "scheduled").length,
      recurring: schedules.filter((s) => s.scheduleType === "recurring").length,
    };
  }
}
