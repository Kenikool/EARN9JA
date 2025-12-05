import mongoose, { Schema, Document } from "mongoose";

export interface ILaunchPhase extends Document {
  currentPhase: 1 | 2 | 3;
  phase1: {
    sponsorCount: number;
    escrowBalance: number;
    tasksReady: number;
    userCount: number;
    completed: boolean;
    completedAt?: Date;
  };
  phase2: {
    consecutiveProfitDays: number;
    userCount: number;
    completed: boolean;
    completedAt?: Date;
  };
  phase3: {
    launched: boolean;
    launchedAt?: Date;
  };
  updatedAt: Date;
  createdAt: Date;
}

const launchPhaseSchema = new Schema<ILaunchPhase>(
  {
    currentPhase: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    phase1: {
      sponsorCount: { type: Number, default: 0 },
      escrowBalance: { type: Number, default: 0 },
      tasksReady: { type: Number, default: 0 },
      userCount: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      completedAt: Date,
    },
    phase2: {
      consecutiveProfitDays: { type: Number, default: 0 },
      userCount: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      completedAt: Date,
    },
    phase3: {
      launched: { type: Boolean, default: false },
      launchedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get or create the singleton instance
launchPhaseSchema.statics.getInstance = async function () {
  let instance = await this.findOne();
  if (!instance) {
    instance = await this.create({});
  }
  return instance;
};

export const LaunchPhase = mongoose.model<ILaunchPhase>(
  "LaunchPhase",
  launchPhaseSchema
);
