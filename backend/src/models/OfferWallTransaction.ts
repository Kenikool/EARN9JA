import mongoose, { Document, Schema } from "mongoose";

export interface IOfferWallTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  providerId: string;
  providerName: string;
  externalTransactionId: string;
  offerName: string;
  offerCategory: string;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number; // In NGN
  commissionRate: number;
  commissionAmount: number;
  userEarnings: number; // Amount credited to user
  status: "pending" | "completed" | "failed" | "duplicate";
  postbackData: any; // Raw postback data from provider
  ipAddress?: string;
  userAgent?: string;
  verificationStatus: "verified" | "unverified" | "failed";
  verificationMethod?: string; // signature, hash, ip_whitelist
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OfferWallTransactionSchema = new Schema<IOfferWallTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerId: {
      type: String,
      required: true,
      index: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    externalTransactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    offerName: {
      type: String,
      required: true,
    },
    offerCategory: {
      type: String,
      required: true,
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    originalCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    convertedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    userEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "duplicate"],
      default: "pending",
      index: true,
    },
    postbackData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    verificationStatus: {
      type: String,
      enum: ["verified", "unverified", "failed"],
      default: "unverified",
    },
    verificationMethod: String,
    failureReason: String,
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
OfferWallTransactionSchema.index({ userId: 1, createdAt: -1 });
OfferWallTransactionSchema.index({ providerId: 1, status: 1 });
OfferWallTransactionSchema.index(
  { externalTransactionId: 1 },
  { unique: true }
);
OfferWallTransactionSchema.index({ createdAt: -1 });

// Define interface for static methods
interface IOfferWallTransactionModel
  extends mongoose.Model<IOfferWallTransaction> {
  findByExternalId(
    externalTransactionId: string
  ): Promise<IOfferWallTransaction | null>;
  getUserTransactions(
    userId: string,
    limit?: number
  ): Promise<IOfferWallTransaction[]>;
  getProviderStats(
    providerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalTransactions: number;
    totalRevenue: number;
    totalCommission: number;
    totalUserEarnings: number;
    avgTransactionValue: number;
  }>;
}

// Static methods
OfferWallTransactionSchema.statics.findByExternalId = function (
  externalTransactionId: string
) {
  return this.findOne({ externalTransactionId });
};

OfferWallTransactionSchema.statics.getUserTransactions = function (
  userId: string,
  limit: number = 50
) {
  return this.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
};

OfferWallTransactionSchema.statics.getProviderStats = async function (
  providerId: string,
  startDate?: Date,
  endDate?: Date
) {
  const match: any = { providerId, status: "completed" };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalRevenue: { $sum: "$convertedAmount" },
        totalCommission: { $sum: "$commissionAmount" },
        totalUserEarnings: { $sum: "$userEarnings" },
        avgTransactionValue: { $avg: "$convertedAmount" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      totalCommission: 0,
      totalUserEarnings: 0,
      avgTransactionValue: 0,
    }
  );
};

export const OfferWallTransaction = mongoose.model<
  IOfferWallTransaction,
  IOfferWallTransactionModel
>("OfferWallTransaction", OfferWallTransactionSchema);
