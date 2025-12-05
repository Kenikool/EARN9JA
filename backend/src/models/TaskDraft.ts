import mongoose, { Document, Schema } from "mongoose";

export interface ITaskDraft extends Document {
  userId: mongoose.Types.ObjectId;
  formData: any;
  lastSaved: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskDraftSchema = new Schema<ITaskDraft>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    formData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    lastSaved: {
      type: Date,
      default: Date.now,
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

// Index for automatic cleanup
TaskDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure only one draft per user
TaskDraftSchema.index({ userId: 1 }, { unique: true });

// Update lastSaved on every save
TaskDraftSchema.pre("save", function (next) {
  this.lastSaved = new Date();
  next();
});

export const TaskDraft = mongoose.model<ITaskDraft>(
  "TaskDraft",
  TaskDraftSchema
);
