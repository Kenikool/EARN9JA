import mongoose, { Schema, Document } from "mongoose";

export interface IVersionCheckLog extends Document {
  userId?: mongoose.Types.ObjectId;
  currentVersion: string;
  platform: "ios" | "android";
  updateAvailable: boolean;
  updateRequired: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const versionCheckLogSchema = new Schema<IVersionCheckLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    currentVersion: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["ios", "android"],
      required: true,
    },
    updateAvailable: {
      type: Boolean,
      required: true,
      default: false,
    },
    updateRequired: {
      type: Boolean,
      required: true,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and analytics
versionCheckLogSchema.index({ userId: 1, timestamp: -1 });
versionCheckLogSchema.index({ platform: 1, timestamp: -1 });
versionCheckLogSchema.index({ currentVersion: 1, platform: 1 });
versionCheckLogSchema.index({ timestamp: -1 });

// TTL index to automatically delete logs older than 90 days
versionCheckLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export const VersionCheckLog = mongoose.model<IVersionCheckLog>(
  "VersionCheckLog",
  versionCheckLogSchema
);
