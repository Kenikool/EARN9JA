import mongoose, { Schema, Document } from "mongoose";

export interface IDispute extends Document {
  taskId: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reportedAgainst: mongoose.Types.ObjectId;
  type: "task_not_completed" | "payment_issue" | "fraud" | "other";
  description: string;
  evidence: {
    type: "image" | "video" | "link" | "text";
    url?: string;
    content?: string;
  }[];
  status: "pending" | "under_review" | "resolved" | "rejected";
  resolution?: {
    decision: string;
    action: "refund_worker" | "refund_sponsor" | "no_action" | "ban_user";
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "TaskSubmission",
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedAgainst: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["task_not_completed", "payment_issue", "fraud", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    evidence: [
      {
        type: {
          type: String,
          enum: ["image", "video", "link", "text"],
          required: true,
        },
        url: String,
        content: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "rejected"],
      default: "pending",
    },
    resolution: {
      decision: String,
      action: {
        type: String,
        enum: ["refund_worker", "refund_sponsor", "no_action", "ban_user"],
      },
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

disputeSchema.index({ taskId: 1 });
disputeSchema.index({ reportedBy: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ createdAt: -1 });

export const Dispute = mongoose.model<IDispute>("Dispute", disputeSchema);
