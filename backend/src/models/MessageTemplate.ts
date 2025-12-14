import mongoose, { Schema, Document } from "mongoose";

export interface IMessageTemplate extends Document {
  name: string;
  title: string;
  body: string;
  variables: string[]; // e.g., ['user_name', 'platform_name']
  targetAudience?: {
    type: string;
    filters?: any;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageTemplateSchema = new Schema<IMessageTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },
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
    variables: [
      {
        type: String,
        trim: true,
      },
    ],
    targetAudience: {
      type: {
        type: String,
      },
      filters: Schema.Types.Mixed,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
messageTemplateSchema.index({ name: 1 });
messageTemplateSchema.index({ createdBy: 1 });

export const MessageTemplate = mongoose.model<IMessageTemplate>(
  "MessageTemplate",
  messageTemplateSchema
);
