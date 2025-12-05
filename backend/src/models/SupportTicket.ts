import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  category: "technical" | "payment" | "task" | "account" | "other";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: mongoose.Types.ObjectId;
  responses: {
    userId: mongoose.Types.ObjectId;
    message: string;
    isAdmin: boolean;
    createdAt: Date;
  }[];
  attachments?: string[];
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["technical", "payment", "task", "account", "other"],
      default: "other",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    responses: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        isAdmin: {
          type: Boolean,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [String],
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
SupportTicketSchema.index({ createdAt: -1 });
SupportTicketSchema.index({ userId: 1, status: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>(
  "SupportTicket",
  SupportTicketSchema
);
