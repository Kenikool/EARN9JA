import mongoose, { Schema, Document } from "mongoose";

export interface IChallengeProgress extends Document {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
  rewardClaimed: boolean;
  claimedAt?: Date;
}

const ChallengeProgressSchema = new Schema<IChallengeProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and challenge
ChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export default mongoose.model<IChallengeProgress>(
  "ChallengeProgress",
  ChallengeProgressSchema
);
