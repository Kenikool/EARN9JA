import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  phoneNumber: string;
  passwordHash: string;
  roles: ("service_worker" | "sponsor" | "admin")[];
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: string;
    location?: {
      state: string;
      city: string;
    };
    language: string;
  };
  sponsorInfo?: {
    companyName?: string;
    businessType?: string;
    taxId?: string;
    businessDescription?: string;
    verificationStatus?: "pending" | "verified" | "rejected";
  };
  reputation: {
    score: number;
    level: number;
    totalTasksCompleted: number;
    approvalRate: number;
    averageCompletionTime?: number;
    badges: string[];
    ratings: {
      average: number;
      count: number;
    };
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    taskAlerts: boolean;
    paymentAlerts: boolean;
    marketingEmails: boolean;
  };
  notificationPreferences?: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    taskReminders: boolean;
    paymentAlerts: boolean;
    marketingEmails: boolean;
    weeklyReports: boolean;
  };
  walletId?: mongoose.Types.ObjectId;
  isKYCVerified: boolean;
  status: "active" | "suspended" | "banned" | "pending_verification";
  deviceIds: string[];
  ipAddresses: string[];
  fcmTokens: string[];
  lastLoginAt?: Date;
  referralCode?: string;
  referredBy?: string;
  bonusMultiplier?: {
    value: number;
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    roles: [
      {
        type: String,
        enum: ["service_worker", "sponsor", "admin"],
        default: ["service_worker"],
      },
    ],
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      avatar: String,
      bio: String,
      dateOfBirth: Date,
      gender: String,
      location: {
        state: String,
        city: String,
      },
      language: { type: String, default: "en" },
    },
    reputation: {
      score: { type: Number, default: 50, min: 0, max: 100 },
      level: { type: Number, default: 1 },
      totalTasksCompleted: { type: Number, default: 0 },
      approvalRate: { type: Number, default: 100 },
      averageCompletionTime: Number,
      badges: [String],
      ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
      },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      taskAlerts: { type: Boolean, default: true },
      paymentAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    notificationPreferences: {
      pushNotifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      paymentAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      weeklyReports: { type: Boolean, default: true },
    },
    sponsorInfo: {
      companyName: String,
      businessType: String,
      taxId: String,
      businessDescription: String,
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
    },
    isKYCVerified: { type: Boolean, default: false },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned", "pending_verification"],
      default: "active",
    },
    deviceIds: [String],
    ipAddresses: [String],
    fcmTokens: [String],
    lastLoginAt: Date,
    referralCode: String,
    referredBy: String,
    bonusMultiplier: {
      value: Number,
      expiresAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Cascade delete related data when user is deleted
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const userId = this._id;

    // Delete wallet
    await mongoose.model("Wallet").deleteOne({ userId });

    // Delete transactions
    await mongoose.model("Transaction").deleteMany({ userId });

    // Delete KYC documents
    await mongoose.model("KYC").deleteMany({ userId });

    // Delete OTP records
    await mongoose.model("OTP").deleteMany({ identifier: this.email });
    await mongoose.model("OTP").deleteMany({ identifier: this.phoneNumber });

    console.log(`🗑️ Cascade deleted all data for user: ${userId}`);
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
