import mongoose, { Schema, Document } from "mongoose";

export interface IFinancialTransaction extends Document {
  type:
    | "ad_revenue"
    | "ad_expense"
    | "task_commission"
    | "task_payment"
    | "bonus_payment"
    | "escrow_deposit"
    | "escrow_release";
  amount: number;
  userId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  escrowAccountId?: mongoose.Types.ObjectId;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const financialTransactionSchema = new Schema<IFinancialTransaction>(
  {
    type: {
      type: String,
      enum: [
        "ad_revenue",
        "ad_expense",
        "task_commission",
        "task_payment",
        "bonus_payment",
        "escrow_deposit",
        "escrow_release",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    escrowAccountId: {
      type: Schema.Types.ObjectId,
      ref: "EscrowAccount",
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
financialTransactionSchema.index({ type: 1, createdAt: -1 });
financialTransactionSchema.index({ userId: 1, createdAt: -1 });

export const FinancialTransaction = mongoose.model<IFinancialTransaction>(
  "FinancialTransaction",
  financialTransactionSchema
);
