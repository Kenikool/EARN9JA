import mongoose, { Document, Schema } from "mongoose";

export interface ITaskTemplate extends Document {
  name: string;
  description: string;
  category: string;
  platform?: string;
  taskType?: string;
  templateData: {
    title: string;
    description: string;
    requirements: string[];
    estimatedTime?: number;
    targetUrl?: string;
    variables?: string[]; // e.g., ["username", "post_url"]
  };
  usageCount: number;
  isOfficial: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskTemplateSchema = new Schema<ITaskTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["SOCIAL_MEDIA", "SURVEY", "REVIEW", "MUSIC", "GAME", "ADS"],
    },
    platform: {
      type: String,
      trim: true,
    },
    taskType: {
      type: String,
      trim: true,
    },
    templateData: {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      requirements: {
        type: [String],
        default: [],
      },
      estimatedTime: {
        type: Number,
      },
      targetUrl: {
        type: String,
      },
      variables: {
        type: [String],
        default: [],
      },
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TaskTemplateSchema.index({ category: 1, isOfficial: -1 });
TaskTemplateSchema.index({ usageCount: -1 });
TaskTemplateSchema.index({ createdBy: 1 });

export const TaskTemplate = mongoose.model<ITaskTemplate>(
  "TaskTemplate",
  TaskTemplateSchema
);
