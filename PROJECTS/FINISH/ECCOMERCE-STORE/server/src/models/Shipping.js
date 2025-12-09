import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
  countries: [String],
  states: [String],
  baseRate: {
    type: Number,
    required: true,
    min: 0,
  },
  perKgRate: {
    type: Number,
    required: true,
    min: 0,
  },
});

const shippingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shipping method name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    zones: [zoneSchema],
    estimatedDays: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
shippingSchema.index({ isActive: 1 });

const Shipping = mongoose.model("Shipping", shippingSchema);

export default Shipping;
