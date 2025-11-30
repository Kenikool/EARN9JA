import mongoose, { Document, Schema } from "mongoose";

export interface IPendingTopup extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  reference: string;
  paymentMethod: "bank_transfer";
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  paymentReceipt?: string; // Cloudinary URL
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pendingTopupSchema = new Schema<IPendingTopup>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 500,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer"],
      required: true,
    },
    bankDetails: {
      bankName: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      accountName: {
        type: String,
        required: true,
      },
    },
    paymentReceipt: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNotes: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
pendingTopupSchema.index({ userId: 1, status: 1 });
pendingTopupSchema.index({ createdAt: -1 });
pendingTopupSchema.index({ status: 1, createdAt: -1 });

export const PendingTopup = mongoose.model<IPendingTopup>(
  "PendingTopup",
  pendingTopupSchema
);
