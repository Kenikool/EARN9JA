import mongoose, { Document, Schema } from "mongoose";

export interface ITaskSubmission extends Document {
  taskId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  sponsorId: mongoose.Types.ObjectId;
  proofs: {
    type: "screenshot" | "link" | "video" | "text";
    content: string; // URL for media, text for text proofs
    description?: string;
  }[];
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "revision_requested"
    | "resubmitted";
  reviewNotes?: string;
  reviewedAt?: Date;
  revisionNotes?: string;
  revisionRequestedAt?: Date;
  resubmittedAt?: Date;
  reviewHistory?: {
    action: "approve" | "reject" | "request_revision";
    notes?: string;
    reviewedAt: Date;
    reviewedBy: mongoose.Types.ObjectId;
  }[];
  submittedAt: Date;
  acceptedAt: Date; // When worker accepted the task
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const taskSubmissionSchema = new Schema<ITaskSubmission>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    proofs: [
      {
        type: {
          type: String,
          enum: ["screenshot", "link", "video", "text"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        description: String,
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "revision_requested",
        "resubmitted",
      ],
      default: "pending",
      index: true,
    },
    reviewNotes: String,
    reviewedAt: Date,
    revisionNotes: String,
    revisionRequestedAt: Date,
    resubmittedAt: Date,
    reviewHistory: [
      {
        action: {
          type: String,
          enum: ["approve", "reject", "request_revision"],
          required: true,
        },
        notes: String,
        reviewedAt: {
          type: Date,
          required: true,
        },
        reviewedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskSubmissionSchema.index({ taskId: 1, workerId: 1 }, { unique: true });
taskSubmissionSchema.index({ workerId: 1, status: 1 });
taskSubmissionSchema.index({ sponsorId: 1, status: 1 });
taskSubmissionSchema.index({ createdAt: -1 });

// Virtual for completion time
taskSubmissionSchema.virtual("completionTime").get(function () {
  if (this.submittedAt && this.acceptedAt) {
    return Math.floor(
      (this.submittedAt.getTime() - this.acceptedAt.getTime()) / 1000 / 60
    ); // in minutes
  }
  return null;
});

export const TaskSubmission = mongoose.model<ITaskSubmission>(
  "TaskSubmission",
  taskSubmissionSchema
);
