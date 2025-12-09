import mongoose from "mongoose";

const vendorPayoutSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "paypal", "stripe", "flutterwave", "paystack"],
    },
    transactionId: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vendorPayoutSchema.index({ vendor: 1, status: 1 });
vendorPayoutSchema.index({ createdAt: -1 });

const VendorPayout = mongoose.model("VendorPayout", vendorPayoutSchema);

export default VendorPayout;
