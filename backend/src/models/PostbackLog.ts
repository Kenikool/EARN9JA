import mongoose, { Document, Schema } from "mongoose";

export interface IPostbackLog extends Document {
  providerId: string;
  externalTransactionId?: string;
  userId?: string;
  requestData: any;
  requestHeaders: any;
  ipAddress?: string;
  userAgent?: string;
  processingResult: {
    success: boolean;
    message: string;
    error?: string;
    transactionId?: string;
  };
  processingTime: number; // milliseconds
  createdAt: Date;
}

const PostbackLogSchema = new Schema<IPostbackLog>(
  {
    providerId: {
      type: String,
      required: true,
      index: true,
    },
    externalTransactionId: {
      type: String,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    requestData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    requestHeaders: {
      type: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    processingResult: {
      success: Boolean,
      message: String,
      error: String,
      transactionId: String,
    },
    processingTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PostbackLogSchema.index({ providerId: 1, createdAt: -1 });
PostbackLogSchema.index({ externalTransactionId: 1 });
PostbackLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

export const PostbackLog = mongoose.model<IPostbackLog>(
  "PostbackLog",
  PostbackLogSchema
);
