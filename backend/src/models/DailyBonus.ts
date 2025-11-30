import mongoose, { Schema, Document } from "mongoose";

export interface IDailyBonus extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  day: number; // Day in the streak (1-7, resets after 7)
  amount: number;
  claimed: boolean;
  claimedAt?: Date;
  streakCount: number; // Total consecutive days
}

const DailyBonusSchema = new Schema<IDailyBonus>(
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
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    amount: {
      type: Number,
      required: true,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
    },
    streakCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and date
DailyBonusSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyBonus>("DailyBonus", DailyBonusSchema);
