import mongoose, { Document, Schema } from "mongoose";

export interface ITaskBudget extends Document {
  taskId: mongoose.Types.ObjectId;
  sponsorId: mongoose.Types.ObjectId;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  dailyLimit?: number;
  alertThresholds: {
    percentage: number;
    triggered: boolean;
    triggeredAt?: Date;
  }[];
  autoPauseEnabled: boolean;
  autoPauseThreshold: number;
  isPaused: boolean;
  pausedAt?: Date;
  pauseReason?: string;
  rolloverEnabled: boolean;
  rolloverAmount?: number;
  spendingHistory: {
    date: Date;
    amount: number;
    submissionId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskBudgetSchema = new Schema<ITaskBudget>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      unique: true,
      index: true,
    },
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    spentBudget: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    remainingBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyLimit: {
      type: Number,
      min: 0,
    },
    alertThresholds: [
      {
        percentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        triggered: {
          type: Boolean,
          default: false,
        },
        triggeredAt: {
          type: Date,
        },
      },
    ],
    autoPauseEnabled: {
      type: Boolean,
      default: true,
    },
    autoPauseThreshold: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
      max: 100,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    pausedAt: {
      type: Date,
    },
    pauseReason: {
      type: String,
    },
    rolloverEnabled: {
      type: Boolean,
      default: false,
    },
    rolloverAmount: {
      type: Number,
      min: 0,
    },
    spendingHistory: [
      {
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        submissionId: {
          type: Schema.Types.ObjectId,
          ref: "TaskSubmission",
          required: true,
        },
        workerId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TaskBudgetSchema.index({ sponsorId: 1, isPaused: 1 });
TaskBudgetSchema.index({ taskId: 1, spentBudget: 1 });

// Virtual for spending percentage
TaskBudgetSchema.virtual("spendingPercentage").get(function () {
  if (this.totalBudget === 0) return 0;
  return (this.spentBudget / this.totalBudget) * 100;
});

// Virtual for checking if budget is exhausted
TaskBudgetSchema.virtual("isExhausted").get(function () {
  return this.remainingBudget <= 0;
});

// Method to check if daily limit is reached
TaskBudgetSchema.methods.isDailyLimitReached = function (): boolean {
  if (!this.dailyLimit) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySpending = this.spendingHistory
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    })
    .reduce((sum, entry) => sum + entry.amount, 0);

  return todaySpending >= this.dailyLimit;
};

export const TaskBudget = mongoose.model<ITaskBudget>(
  "TaskBudget",
  TaskBudgetSchema
);
