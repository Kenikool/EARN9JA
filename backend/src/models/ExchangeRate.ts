import mongoose, { Document, Schema, Model } from "mongoose";

export interface IExchangeRate extends Document {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  timestamp: Date;
  metadata?: {
    apiResponse?: any;
    fluctuationDetected?: boolean;
    percentageChange?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IExchangeRateModel extends Model<IExchangeRate> {
  getLatestRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<IExchangeRate | null>;
  getRateHistory(
    fromCurrency: string,
    toCurrency: string,
    days?: number
  ): Promise<IExchangeRate[]>;
  saveRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    metadata?: any
  ): Promise<IExchangeRate>;
}

const ExchangeRateSchema = new Schema<IExchangeRate>(
  {
    fromCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      enum: ["USD", "EUR", "GBP", "NGN"],
    },
    toCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      enum: ["USD", "EUR", "GBP", "NGN"],
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      required: true,
      default: "exchangerate-api.com",
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    metadata: {
      apiResponse: Schema.Types.Mixed,
      fluctuationDetected: Boolean,
      percentageChange: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, timestamp: -1 });
ExchangeRateSchema.index({ timestamp: -1 });
ExchangeRateSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

// Static methods
ExchangeRateSchema.statics.getLatestRate = async function (
  fromCurrency: string,
  toCurrency: string
): Promise<IExchangeRate | null> {
  return this.findOne({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
  })
    .sort({ timestamp: -1 })
    .exec();
};

ExchangeRateSchema.statics.getRateHistory = async function (
  fromCurrency: string,
  toCurrency: string,
  days: number = 7
): Promise<IExchangeRate[]> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.find({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
    timestamp: { $gte: cutoffDate },
  })
    .sort({ timestamp: -1 })
    .exec();
};

ExchangeRateSchema.statics.saveRate = async function (
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  metadata?: any
): Promise<IExchangeRate> {
  return this.create({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
    rate,
    timestamp: new Date(),
    metadata,
  });
};

export const ExchangeRate = mongoose.model<IExchangeRate, IExchangeRateModel>(
  "ExchangeRate",
  ExchangeRateSchema
);
