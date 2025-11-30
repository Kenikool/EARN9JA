import mongoose, { Schema, Document } from "mongoose";

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "seasonal" | "special";
  category?: "tasks" | "earnings" | "social" | "streak";
  startDate: Date;
  endDate: Date;
  active: boolean;
  criteria: {
    type: string;
    target: number;
    category?: string;
  };
  reward: {
    type: "cash" | "multiplier" | "badge";
    value: number | string;
    description: string;
  };
  participants: number;
  completions: number;
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "seasonal", "special"],
      required: true,
    },
    category: {
      type: String,
      enum: ["tasks", "earnings", "social", "streak"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    criteria: {
      type: {
        type: String,
        required: true,
      },
      target: {
        type: Number,
        required: true,
      },
      category: String,
    },
    reward: {
      type: {
        type: String,
        enum: ["cash", "multiplier", "badge"],
        required: true,
      },
      value: {
        type: Schema.Types.Mixed,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
    participants: {
      type: Number,
      default: 0,
    },
    completions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active challenges
ChallengeSchema.index({ active: 1, endDate: 1 });

export default mongoose.model<IChallenge>("Challenge", ChallengeSchema);
