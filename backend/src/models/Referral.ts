import mongoose, { Schema, Document } from "mongoose";

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  referralCode: string;
  status: "pending" | "active" | "expired" | "cancelled";
  commissionRate: number; // Percentage (e.g., 5 for 5%)
  commissionPeriodDays: number; // Number of days to earn commission (e.g., 30)
  totalEarnings: number; // Total earnings by referred user
  totalCommission: number; // Total commission earned by referrer
  expiresAt: Date;
  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
      index: true,
    },
    commissionRate: {
      type: Number,
      default: 5, // 5% commission
      min: 0,
      max: 100,
    },
    commissionPeriodDays: {
      type: Number,
      default: 30, // 30 days commission period
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCommission: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    activatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referredUserId: 1, status: 1 });
referralSchema.index({ status: 1, expiresAt: 1 });

// Check if referral is still active
referralSchema.methods.isActive = function (): boolean {
  return (
    this.status === "active" &&
    this.expiresAt > new Date() &&
    this.activatedAt !== undefined
  );
};

// Calculate commission for an earning amount
referralSchema.methods.calculateCommission = function (
  earningAmount: number
): number {
  if (!this.isActive()) {
    return 0;
  }
  return (earningAmount * this.commissionRate) / 100;
};

export const Referral = mongoose.model<IReferral>("Referral", referralSchema);
