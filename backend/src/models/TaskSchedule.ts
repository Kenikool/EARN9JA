import mongoose, { Document, Schema } from "mongoose";

export interface ITaskSchedule extends Document {
  taskId: mongoose.Types.ObjectId;
  sponsorId: mongoose.Types.ObjectId;
  scheduleType: "immediate" | "scheduled" | "recurring";
  scheduledFor?: Date;
  timezone: string;
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
    maxOccurrences?: number;
    occurrencesCount: number;
  };
  status: "pending" | "active" | "completed" | "cancelled";
  lastExecuted?: Date;
  nextExecution?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskScheduleSchema = new Schema<ITaskSchedule>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scheduleType: {
      type: String,
      enum: ["immediate", "scheduled", "recurring"],
      required: true,
      default: "immediate",
    },
    scheduledFor: {
      type: Date,
      index: true,
    },
    timezone: {
      type: String,
      required: true,
      default: "Africa/Lagos",
    },
    recurring: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      interval: {
        type: Number,
        min: 1,
        default: 1,
      },
      daysOfWeek: {
        type: [Number],
        validate: {
          validator: function (days: number[]) {
            return days.every((day) => day >= 0 && day <= 6);
          },
          message: "Days of week must be between 0 (Sunday) and 6 (Saturday)",
        },
      },
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
      },
      endDate: {
        type: Date,
      },
      maxOccurrences: {
        type: Number,
        min: 1,
      },
      occurrencesCount: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      required: true,
      default: "pending",
      index: true,
    },
    lastExecuted: {
      type: Date,
    },
    nextExecution: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of pending schedules
TaskScheduleSchema.index({ status: 1, nextExecution: 1 });
TaskScheduleSchema.index({ sponsorId: 1, status: 1 });

export const TaskSchedule = mongoose.model<ITaskSchedule>(
  "TaskSchedule",
  TaskScheduleSchema
);
