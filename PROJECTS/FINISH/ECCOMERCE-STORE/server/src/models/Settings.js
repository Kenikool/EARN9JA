import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // General Settings
    storeName: {
      type: String,
      default: "My Store",
    },
    storeEmail: {
      type: String,
      default: "",
    },
    storePhone: {
      type: String,
      default: "",
    },
    storeAddress: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "NGN"],
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Payment Settings
    stripeEnabled: {
      type: Boolean,
      default: false,
    },
    stripePublicKey: String,
    stripeSecretKey: String,
    paystackEnabled: {
      type: Boolean,
      default: false,
    },
    paystackPublicKey: String,
    paystackSecretKey: String,
    flutterwaveEnabled: {
      type: Boolean,
      default: false,
    },
    flutterwavePublicKey: String,
    flutterwaveSecretKey: String,

    // Email Settings
    orderConfirmationEmails: {
      type: Boolean,
      default: true,
    },
    shippingNotifications: {
      type: Boolean,
      default: true,
    },
    lowStockAlerts: {
      type: Boolean,
      default: true,
    },
    newOrderNotifications: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: false,
    },

    // Security Settings
    sessionTimeout: {
      type: Number,
      default: 30, // minutes
    },
    require2FAForAdmin: {
      type: Boolean,
      default: false,
    },
    enableActivityLogging: {
      type: Boolean,
      default: true,
    },
    gdprCompliance: {
      type: Boolean,
      default: false,
    },
    dataRetentionPeriod: {
      type: Number,
      default: 365, // days
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
