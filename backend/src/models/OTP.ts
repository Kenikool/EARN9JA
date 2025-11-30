import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  identifier: string;
  type: "email" | "phone";
  code: string;
  purpose: "registration" | "login" | "password_reset" | "withdrawal";
  attempts: number;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["registration", "login", "password_reset", "withdrawal"],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for identifier + purpose
otpSchema.index({ identifier: 1, purpose: 1 });
// TTL index is already defined in schema with expires field

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);
