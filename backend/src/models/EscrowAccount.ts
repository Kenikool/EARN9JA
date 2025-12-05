import mongoose, { Schema, Document } from "mongoose";

export interface IEscrowAccount extends Document {
  sponsorId: mongoose.Types.ObjectId;
  balance: number;
  reservedBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  status: "active" | "frozen" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const escrowAccountSchema = new Schema<IEscrowAccount>(
  {
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDeposited: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
escrowAccountSchema.index({ sponsorId: 1 });
escrowAccountSchema.index({ status: 1 });

export const EscrowAccount = mongoose.model<IEscrowAccount>(
  "EscrowAccount",
  escrowAccountSchema
);
