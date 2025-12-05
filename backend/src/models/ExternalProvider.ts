import mongoose, { Document, Schema } from "mongoose";
import { ProviderType, TaskCategory } from "../types/provider.types.js";

export interface IExternalProvider extends Document {
  providerId: string;
  name: string;
  providerType: ProviderType;
  category: TaskCategory;
  apiEndpoint: string;
  apiKey: string;
  apiSecret?: string;
  status: "active" | "inactive" | "disabled";
  commissionRate: number;
  supportedCurrencies: string[];
  config: {
    syncInterval: number;
    maxTasksPerSync: number;
    timeout: number;
  };
  metrics: {
    totalTasksSynced: number;
    totalCompletions: number;
    totalRevenue: number;
    avgCompletionRate: number;
  };
  disabledReason?: string;
  disabledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const externalProviderSchema = new Schema<IExternalProvider>(
  {
    providerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    providerType: {
      type: String,
      enum: Object.values(ProviderType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(TaskCategory),
      required: true,
    },
    apiEndpoint: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      required: true,
    },
    apiSecret: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "disabled"],
      default: "active",
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    supportedCurrencies: {
      type: [String],
      default: ["USD"],
    },
    config: {
      syncInterval: {
        type: Number,
        default: 15,
      },
      maxTasksPerSync: {
        type: Number,
        default: 100,
      },
      timeout: {
        type: Number,
        default: 30000,
      },
    },
    metrics: {
      totalTasksSynced: {
        type: Number,
        default: 0,
      },
      totalCompletions: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      avgCompletionRate: {
        type: Number,
        default: 0,
      },
    },
    disabledReason: String,
    disabledAt: Date,
  },
  {
    timestamps: true,
  }
);

externalProviderSchema.index({ providerId: 1 });
externalProviderSchema.index({ status: 1 });
externalProviderSchema.index({ category: 1 });

export const ExternalProvider = mongoose.model<IExternalProvider>(
  "ExternalProvider",
  externalProviderSchema
);
