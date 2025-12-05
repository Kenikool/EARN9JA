import mongoose, { Document, Schema } from "mongoose";

export interface ITwoFactorAuth extends Document {
  userId: string;
  secret: string;
  backupCodes: string[];
  enabled: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TwoFactorAuthSchema = new Schema<ITwoFactorAuth>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    secret: {
      type: String,
      required: true,
    },
    backupCodes: {
      type: [String],
      default: [],
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const TwoFactorAuth = mongoose.model<ITwoFactorAuth>(
  "TwoFactorAuth",
  TwoFactorAuthSchema
);

export default TwoFactorAuth;
