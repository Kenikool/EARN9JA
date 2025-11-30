import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  amount: number;
  method: "bank_transfer" | "opay" | "palmpay";
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    phoneNumber?: string;
  };
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  transactionId?: mongoose.Types.ObjectId;
  fee: number;
  netAmount: number;
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["bank_transfer", "opay", "palmpay"],
      required: true,
    },
    accountDetails: {
      accountNumber: String,
      accountName: String,
      bankName: String,
      phoneNumber: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    processedAt: Date,
    failureReason: String,
  },
  {
    timestamps: true,
  }
);

// Compound indexes
withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

export const Withdrawal = mongoose.model<IWithdrawal>(
  "Withdrawal",
  withdrawalSchema
);
