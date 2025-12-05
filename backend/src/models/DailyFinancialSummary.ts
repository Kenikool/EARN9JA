import mongoose, { Schema, Document } from "mongoose";

export interface IDailyFinancialSummary extends Document {
  date: Date;
  adRevenue: number;
  adExpenses: number;
  taskRevenue: number;
  taskExpenses: number;
  bonusExpenses: number;
  escrowDeposits: number;
  netProfit: number;
  profitMargin: number;
  metrics: {
    totalAdsWatched: number;
    totalTasksCompleted: number;
    totalBonusesPaid: number;
    activeUsers: number;
    newUsers: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const dailyFinancialSummarySchema = new Schema<IDailyFinancialSummary>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    adRevenue: {
      type: Number,
      default: 0,
    },
    adExpenses: {
      type: Number,
      default: 0,
    },
    taskRevenue: {
      type: Number,
      default: 0,
    },
    taskExpenses: {
      type: Number,
      default: 0,
    },
    bonusExpenses: {
      type: Number,
      default: 0,
    },
    escrowDeposits: {
      type: Number,
      default: 0,
    },
    netProfit: {
      type: Number,
      default: 0,
    },
    profitMargin: {
      type: Number,
      default: 0,
    },
    metrics: {
      totalAdsWatched: { type: Number, default: 0 },
      totalTasksCompleted: { type: Number, default: 0 },
      totalBonusesPaid: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient date-based queries
dailyFinancialSummarySchema.index({ date: -1 });

export const DailyFinancialSummary = mongoose.model<IDailyFinancialSummary>(
  "DailyFinancialSummary",
  dailyFinancialSummarySchema
);
