import mongoose, { Schema, Document } from "mongoose";

export interface IEscrow extends Document {
  sponsorId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  amount: number;
  status: "held" | "released" | "refunded" | "partially_released";
  totalSlots: number;
  releasedSlots: number;
  amountPerSlot: number;
  platformFee: number;
  createdAt: Date;
  updatedAt: Date;
  releasedAt?: Date;
  refundedAt?: Date;
}

const escrowSchema = new Schema<IEscrow>(
  {
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["held", "released", "refunded", "partially_released"],
      default: "held",
      index: true,
    },
    totalSlots: {
      type: Number,
      required: true,
      min: 1,
    },
    releasedSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountPerSlot: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },
    releasedAt: Date,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for queries
escrowSchema.index({ sponsorId: 1, status: 1 });
escrowSchema.index({ taskId: 1, status: 1 });
escrowSchema.index({ status: 1, createdAt: -1 });

export const Escrow = mongoose.model<IEscrow>("Escrow", escrowSchema);
