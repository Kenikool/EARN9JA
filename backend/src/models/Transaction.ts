import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type:
    | "task_earning"
    | "admob_reward"
    | "referral_bonus"
    | "daily_bonus"
    | "withdrawal"
    | "task_funding"
    | "refund"
    | "platform_fee"
    | "topup"
    | "escrow_transfer"
    | "escrow_transfer_refund";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "task_earning",
        "admob_reward",
        "referral_bonus",
        "daily_bonus",
        "withdrawal",
        "task_funding",
        "refund",
        "platform_fee",
        "topup",
        "escrow_transfer",
        "escrow_transfer_refund",
      ],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: String,
    referenceType: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
