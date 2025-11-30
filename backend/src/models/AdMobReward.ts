import mongoose, { Schema, Document } from "mongoose";

export interface IAdMobReward extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: string;
  reward: number;
  platform: "ios" | "android";
  deviceId: string;
  ipAddress: string;
  timestamp: Date;
  verified: boolean;
  transactionId?: mongoose.Types.ObjectId;
  fraudScore: number;
  metadata: {
    adUnitId?: string;
    adNetwork?: string;
    adType?: string;
    sessionId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const adMobRewardSchema = new Schema<IAdMobReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskId: {
      type: String,
      required: true,
      default: "admob_reward",
    },
    reward: {
      type: Number,
      required: true,
      min: 0,
    },
    platform: {
      type: String,
      enum: ["ios", "android"],
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
    fraudScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    metadata: {
      adUnitId: String,
      adNetwork: String,
      adType: String,
      sessionId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
adMobRewardSchema.index({ userId: 1, createdAt: -1 });
adMobRewardSchema.index({ deviceId: 1, createdAt: -1 });
adMobRewardSchema.index({ ipAddress: 1, createdAt: -1 });
adMobRewardSchema.index({ createdAt: -1 });
adMobRewardSchema.index({ platform: 1, createdAt: -1 });

// Index for fraud detection queries
adMobRewardSchema.index({ userId: 1, deviceId: 1, timestamp: -1 });

export const AdMobReward = mongoose.model<IAdMobReward>(
  "AdMobReward",
  adMobRewardSchema
);
