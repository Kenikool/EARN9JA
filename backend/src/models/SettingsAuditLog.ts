import mongoose, { Schema, Document } from "mongoose";

export interface ISettingsAuditLog extends Document {
  settingKey: string;
  oldValue: any;
  newValue: any;
  changedBy: mongoose.Types.ObjectId;
  changedByName: string; // Denormalized for performance
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsAuditLogSchema = new Schema<ISettingsAuditLog>(
  {
    settingKey: {
      type: String,
      required: true,
      trim: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    newValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedByName: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
settingsAuditLogSchema.index({ timestamp: -1 });
settingsAuditLogSchema.index({ settingKey: 1, timestamp: -1 });
settingsAuditLogSchema.index({ changedBy: 1, timestamp: -1 });

// TTL index to automatically delete logs older than 90 days
settingsAuditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export const SettingsAuditLog = mongoose.model<ISettingsAuditLog>(
  "SettingsAuditLog",
  settingsAuditLogSchema
);
