import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformSettings extends Document {
  // Financial Settings
  financial: {
    minimumWithdrawal: number;
    platformCommissionRate: number;
    referralBonusAmount: number;
    minimumTaskReward: number;
  };

  // User Limits
  userLimits: {
    maxActiveTasksPerUser: number;
    maxSubmissionsPerTask: number;
    dailySpinLimit: number;
  };

  // Operational Controls
  operational: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    kycRequired: boolean;
  };

  // Task Management
  taskManagement: {
    approvalAutoTimeoutDays: number;
    maxTaskDurationDays: number;
  };

  // Metadata
  lastModified: Date;
  lastModifiedBy: mongoose.Types.ObjectId;
  version: number; // For optimistic locking

  createdAt: Date;
  updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    financial: {
      minimumWithdrawal: {
        type: Number,
        required: true,
        default: 1000,
        min: 100,
      },
      platformCommissionRate: {
        type: Number,
        required: true,
        default: 10,
        min: 0,
        max: 50,
      },
      referralBonusAmount: {
        type: Number,
        required: true,
        default: 100,
        min: 0,
      },
      minimumTaskReward: {
        type: Number,
        required: true,
        default: 50,
        min: 10,
      },
    },
    userLimits: {
      maxActiveTasksPerUser: {
        type: Number,
        required: true,
        default: 10,
        min: 1,
        max: 100,
      },
      maxSubmissionsPerTask: {
        type: Number,
        required: true,
        default: 100,
        min: 1,
      },
      dailySpinLimit: {
        type: Number,
        required: true,
        default: 3,
        min: 0,
      },
    },
    operational: {
      maintenanceMode: {
        type: Boolean,
        required: true,
        default: false,
      },
      registrationEnabled: {
        type: Boolean,
        required: true,
        default: true,
      },
      kycRequired: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
    taskManagement: {
      approvalAutoTimeoutDays: {
        type: Number,
        required: true,
        default: 7,
        min: 1,
        max: 30,
      },
      maxTaskDurationDays: {
        type: Number,
        required: true,
        default: 30,
        min: 1,
        max: 365,
      },
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
platformSettingsSchema.index({ lastModified: -1 });

// Ensure only one settings document exists
platformSettingsSchema.pre("save", async function (next) {
  const count = await mongoose.model("PlatformSettings").countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error("Only one PlatformSettings document is allowed");
  }
  next();
});

export const PlatformSettings = mongoose.model<IPlatformSettings>(
  "PlatformSettings",
  platformSettingsSchema
);
