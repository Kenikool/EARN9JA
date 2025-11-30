import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type:
    | "task_assigned"
    | "task_approved"
    | "task_rejected"
    | "payment_received"
    | "withdrawal_processed"
    | "referral_joined"
    | "achievement_unlocked"
    | "challenge_completed"
    | "daily_bonus"
    | "system_announcement";
  data?: Record<string, any>;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "task_assigned",
        "task_approved",
        "task_rejected",
        "payment_received",
        "withdrawal_processed",
        "referral_joined",
        "achievement_unlocked",
        "challenge_completed",
        "daily_bonus",
        "system_announcement",
      ],
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
