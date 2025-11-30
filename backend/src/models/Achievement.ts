import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  category: "tasks" | "earnings" | "social" | "streak" | "special";
  unlockedAt: Date;
  progress?: {
    current: number;
    target: number;
  };
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeId: {
      type: String,
      required: true,
    },
    badgeName: {
      type: String,
      required: true,
    },
    badgeDescription: {
      type: String,
      required: true,
    },
    badgeIcon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["tasks", "earnings", "social", "streak", "special"],
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      current: { type: Number, default: 0 },
      target: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and badge
AchievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.model<IAchievement>("Achievement", AchievementSchema);
