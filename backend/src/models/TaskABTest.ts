import mongoose, { Document, Schema } from "mongoose";

export interface ITaskABTest extends Document {
  sponsorId: mongoose.Types.ObjectId;
  testName: string;
  description?: string;
  variants: {
    variantId: string;
    name: string;
    taskId: mongoose.Types.ObjectId;
    trafficPercentage: number;
    impressions: number;
    submissions: number;
    completions: number;
    totalSpent: number;
  }[];
  trafficSplit: {
    [variantId: string]: number;
  };
  successMetric: "completion_rate" | "cost_per_completion" | "submission_rate";
  status: "draft" | "running" | "paused" | "completed" | "cancelled";
  startDate?: Date;
  endDate?: Date;
  duration?: number; // in days
  minSampleSize: number;
  confidenceLevel: number; // 90, 95, or 99
  statisticalSignificance?: {
    achieved: boolean;
    pValue?: number;
    confidenceInterval?: number;
    winner?: string;
  };
  autoSelectWinner: boolean;
  winnerSelected?: boolean;
  selectedWinner?: string;
  winnerSelectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskABTestSchema = new Schema<ITaskABTest>(
  {
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    variants: [
      {
        variantId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        taskId: {
          type: Schema.Types.ObjectId,
          ref: "Task",
          required: true,
        },
        trafficPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        impressions: {
          type: Number,
          default: 0,
          min: 0,
        },
        submissions: {
          type: Number,
          default: 0,
          min: 0,
        },
        completions: {
          type: Number,
          default: 0,
          min: 0,
        },
        totalSpent: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    trafficSplit: {
      type: Map,
      of: Number,
      required: true,
    },
    successMetric: {
      type: String,
      enum: ["completion_rate", "cost_per_completion", "submission_rate"],
      required: true,
      default: "completion_rate",
    },
    status: {
      type: String,
      enum: ["draft", "running", "paused", "completed", "cancelled"],
      default: "draft",
      index: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    duration: {
      type: Number,
      min: 1,
    },
    minSampleSize: {
      type: Number,
      required: true,
      default: 100,
      min: 30,
    },
    confidenceLevel: {
      type: Number,
      required: true,
      default: 95,
      enum: [90, 95, 99],
    },
    statisticalSignificance: {
      achieved: {
        type: Boolean,
        default: false,
      },
      pValue: {
        type: Number,
      },
      confidenceInterval: {
        type: Number,
      },
      winner: {
        type: String,
      },
    },
    autoSelectWinner: {
      type: Boolean,
      default: true,
    },
    winnerSelected: {
      type: Boolean,
      default: false,
    },
    selectedWinner: {
      type: String,
    },
    winnerSelectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TaskABTestSchema.index({ sponsorId: 1, status: 1 });
TaskABTestSchema.index({ status: 1, endDate: 1 });
TaskABTestSchema.index({ "variants.taskId": 1 });

// Validation: traffic split must sum to 100
TaskABTestSchema.pre("save", function (next) {
  const totalTraffic = this.variants.reduce(
    (sum, v) => sum + v.trafficPercentage,
    0
  );
  if (Math.abs(totalTraffic - 100) > 0.01) {
    next(new Error("Traffic split must sum to 100%"));
  }
  next();
});

export const TaskABTest = mongoose.model<ITaskABTest>(
  "TaskABTest",
  TaskABTestSchema
);
