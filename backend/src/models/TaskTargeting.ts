import mongoose, { Document, Schema } from "mongoose";

export interface ITaskTargeting extends Document {
  taskId: mongoose.Types.ObjectId;
  geographic: {
    countries?: string[];
    states?: string[];
    cities?: string[];
    radius?: {
      center: {
        latitude: number;
        longitude: number;
      };
      radiusKm: number;
    };
  };
  demographic?: {
    ageRange?: {
      min: number;
      max: number;
    };
    gender?: "male" | "female" | "all";
    deviceTypes?: string[];
  };
  userCriteria?: {
    minReputationLevel?: number;
    minCompletionRate?: number;
    minTasksCompleted?: number;
  };
  estimatedAudience: number;
  pricingMultiplier: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskTargetingSchema = new Schema<ITaskTargeting>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      unique: true,
      index: true,
    },
    geographic: {
      countries: {
        type: [String],
        default: [],
      },
      states: {
        type: [String],
        default: [],
      },
      cities: {
        type: [String],
        default: [],
      },
      radius: {
        center: {
          latitude: {
            type: Number,
          },
          longitude: {
            type: Number,
          },
        },
        radiusKm: {
          type: Number,
        },
      },
    },
    demographic: {
      ageRange: {
        min: {
          type: Number,
          min: 13,
          max: 100,
        },
        max: {
          type: Number,
          min: 13,
          max: 100,
        },
      },
      gender: {
        type: String,
        enum: ["male", "female", "all"],
        default: "all",
      },
      deviceTypes: {
        type: [String],
        default: [],
      },
    },
    userCriteria: {
      minReputationLevel: {
        type: Number,
        min: 0,
        max: 5,
      },
      minCompletionRate: {
        type: Number,
        min: 0,
        max: 100,
      },
      minTasksCompleted: {
        type: Number,
        min: 0,
      },
    },
    estimatedAudience: {
      type: Number,
      required: true,
      default: 0,
    },
    pricingMultiplier: {
      type: Number,
      required: true,
      default: 1.0,
      min: 1.0,
      max: 3.0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
TaskTargetingSchema.index({ "geographic.countries": 1 });
TaskTargetingSchema.index({ "geographic.states": 1 });
TaskTargetingSchema.index({ "geographic.cities": 1 });

export const TaskTargeting = mongoose.model<ITaskTargeting>(
  "TaskTargeting",
  TaskTargetingSchema
);
