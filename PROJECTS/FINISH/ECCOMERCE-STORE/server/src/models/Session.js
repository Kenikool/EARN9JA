import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    deviceInfo: {
      userAgent: String,
      browser: String,
      os: String,
      device: String,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      city: String,
      coordinates: [Number],
    },
    isTrusted: {
      type: Boolean,
      default: false,
    },
    trustExpiresAt: Date,
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
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


const Session = mongoose.model("Session", sessionSchema);

export default Session;
