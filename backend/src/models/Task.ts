import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  sponsorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: "social_media" | "music" | "survey" | "review" | "game" | "ads";
  platform: string; // e.g., "INSTAGRAM", "SPOTIFY", "GOOGLE_REVIEWS"
  taskType: string; // e.g., "FOLLOW", "STREAM_SONG", "TEXT_REVIEW"
  targetUrl?: string; // For social media links, music tracks, etc.
  reward: number;
  totalSlots: number;
  availableSlots: number;
  completedSlots: number;
  requirements: string[];
  proofRequirements: {
    type: "screenshot" | "link" | "video" | "text";
    description: string;
    required: boolean;
  }[];
  estimatedTime: number; // in minutes
  expiresAt: Date;
  status: "draft" | "active" | "paused" | "completed" | "expired" | "cancelled";
  pausedAt?: Date;
  cancelledAt?: Date;
  targetAudience?: {
    minReputation?: number;
    maxReputation?: number;
    location?: string[];
    ageRange?: { min: number; max: number };
  };
  // Pricing information
  pricing: {
    minimumPrice: number; // System-calculated minimum for this task type
    suggestedPrice: number; // Recommended price
    actualPrice: number; // What sponsor is paying (same as reward)
  };
  // Task-specific metadata
  metadata: {
    platformName?: string; // Human-readable platform name
    taskTypeName?: string; // Human-readable task type name
    icon?: string; // Emoji icon for the task type
    color?: string; // Color theme for the category
    estimatedDuration?: string; // e.g., "2-5 minutes", "30 seconds"
    requirements?: string; // e.g., "Minimum 50 words", "Video (30s+)"
    [key: string]: any; // Allow additional metadata
  };
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ["social_media", "music", "survey", "review", "game", "ads"],
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    taskType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    targetUrl: {
      type: String,
      trim: true,
    },
    reward: {
      type: Number,
      required: true,
      min: 10, // Minimum ₦10
    },
    totalSlots: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSlots: {
      type: Number,
      required: true,
      min: 0,
    },
    completedSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    proofRequirements: [
      {
        type: {
          type: String,
          enum: ["screenshot", "link", "video", "text"],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        required: {
          type: Boolean,
          default: true,
        },
      },
    ],
    estimatedTime: {
      type: Number,
      required: true,
      min: 1,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed", "expired", "cancelled"],
      default: "draft",
      index: true,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    targetAudience: {
      minReputation: Number,
      maxReputation: Number,
      location: [String],
      ageRange: {
        min: Number,
        max: Number,
      },
    },
    pricing: {
      minimumPrice: {
        type: Number,
        required: true,
        min: 10,
      },
      suggestedPrice: {
        type: Number,
        required: true,
        min: 10,
      },
      actualPrice: {
        type: Number,
        required: true,
        min: 10,
      },
    },
    metadata: {
      platformName: String,
      taskTypeName: String,
      icon: String,
      color: String,
      estimatedDuration: String,
      requirements: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskSchema.index({ status: 1, category: 1 });
taskSchema.index({ sponsorId: 1, status: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ reward: -1 });
taskSchema.index({ expiresAt: 1 });
taskSchema.index({ platform: 1 });
taskSchema.index({ taskType: 1 });
taskSchema.index({ category: 1, platform: 1, taskType: 1 });

// Virtual for checking if task is full
taskSchema.virtual("isFull").get(function () {
  return this.availableSlots === 0;
});

// Virtual for checking if task is expired
taskSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

export const Task = mongoose.model<ITask>("Task", taskSchema);
