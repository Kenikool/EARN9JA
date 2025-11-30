import mongoose, { Schema, Document } from "mongoose";

export interface IKYC extends Document {
  userId: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "resubmit";
  verificationType: "nin" | "bvn" | "drivers_license" | "voters_card";
  identityNumber: string;
  documents: {
    idCard?: string;
    selfie?: string;
    proofOfAddress?: string;
  };
  verificationData: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    phoneNumber?: string;
  };
  rejectionReason?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KYCSchema = new Schema<IKYC>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "resubmit"],
      default: "pending",
    },
    verificationType: {
      type: String,
      enum: ["nin", "bvn", "drivers_license", "voters_card"],
      required: true,
    },
    identityNumber: {
      type: String,
      required: true,
    },
    documents: {
      idCard: String,
      selfie: String,
      proofOfAddress: String,
    },
    verificationData: {
      fullName: String,
      dateOfBirth: String,
      address: String,
      phoneNumber: String,
    },
    rejectionReason: String,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
KYCSchema.index({ userId: 1 });
KYCSchema.index({ status: 1 });
KYCSchema.index({ submittedAt: -1 });

export const KYC = mongoose.model<IKYC>("KYC", KYCSchema);
