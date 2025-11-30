import mongoose, { Schema, Document } from "mongoose";

export interface ISpinReward extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  reward: {
    type: "cash" | "bonus_multiplier" | "free_spin" | "badge";
    value: number | string;
    label: string;
  };
  claimed: boolean;
  claimedAt?: Date;
}

const SpinRewardSchema = new Schema<ISpinReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reward: {
      type: {
        type: String,
        enum: ["cash", "bonus_multiplier", "free_spin", "badge"],
        required: true,
      },
      value: {
        type: Schema.Types.Mixed,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and date
SpinRewardSchema.index({ userId: 1, date: 1 });

export default mongoose.model<ISpinReward>("SpinReward", SpinRewardSchema);
