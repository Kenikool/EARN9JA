import mongoose, { Schema, Document } from "mongoose";

export interface IBulkMessage extends Document {
  title: string;
  body: string;
  type: "in_app" | "push" | "both";

  // Targeting
  targetAudience: {
    type: "all" | "filtered" | "segment";
    filters?: {
      status?: ("active" | "suspended" | "banned")[];
      roles?: ("service_worker" | "sponsor" | "admin")[];
      kycVerified?: boolean;
      registeredAfter?: Date;
      registeredBefore?: Date;
    };
    segmentId?: mongoose.Types.ObjectId;
  };

  // Scheduling
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";

  // Delivery Tracking
  delivery: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    failed: number;
    read: number;
  };

  // Metadata
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  sentAt?: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const bulkMessageSchema = new Schema<IBulkMessage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ["in_app", "push", "both"],
      required: true,
      default: "in_app",
    },
    targetAudience: {
      type: {
        type: String,
        enum: ["all", "filtered", "segment"],
        required: true,
        default: "all",
      },
      filters: {
        status: [
          {
            type: String,
            enum: ["active", "suspended", "banned"],
          },
        ],
        roles: [
          {
            type: String,
            enum: ["service_worker", "sponsor", "admin"],
          },
        ],
        kycVerified: Boolean,
        registeredAfter: Date,
        registeredBefore: Date,
      },
      segmentId: {
        type: Schema.Types.ObjectId,
        ref: "AudienceSegment",
      },
    },
    scheduledFor: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "cancelled"],
      required: true,
      default: "draft",
    },
    delivery: {
      totalRecipients: {
        type: Number,
        default: 0,
      },
      sent: {
        type: Number,
        default: 0,
      },
      delivered: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      read: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
bulkMessageSchema.index({ status: 1, scheduledFor: 1 });
bulkMessageSchema.index({ createdBy: 1, createdAt: -1 });
bulkMessageSchema.index({ createdAt: -1 });

export const BulkMessage = mongoose.model<IBulkMessage>(
  "BulkMessage",
  bulkMessageSchema
);
