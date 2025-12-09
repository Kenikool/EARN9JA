import mongoose from "mongoose";

const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Currency code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    name: {
      type: String,
      required: [true, "Currency name is required"],
      trim: true,
    },
    symbol: {
      type: String,
      required: [true, "Currency symbol is required"],
      trim: true,
    },
    exchangeRate: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    supportedGateways: [
      {
        type: String,
        enum: ["stripe", "flutterwave", "paystack"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
currencySchema.index({ code: 1 });
currencySchema.index({ isActive: 1 });

const Currency = mongoose.model("Currency", currencySchema);

export default Currency;
