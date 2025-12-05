import mongoose, { Schema, Document } from "mongoose";

export interface ISponsorPackage extends Document {
  name: "bronze" | "silver" | "gold";
  displayName: string;
  monthlyPrice: number;
  taskLimit: number | null; // null means unlimited
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorPackageSchema = new Schema<ISponsorPackage>(
  {
    name: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taskLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    features: {
      type: [String],
      default: [],
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

// Index for efficient queries
sponsorPackageSchema.index({ name: 1 });
sponsorPackageSchema.index({ isActive: 1 });

export const SponsorPackage = mongoose.model<ISponsorPackage>(
  "SponsorPackage",
  sponsorPackageSchema
);

// Helper function to seed default packages
export const seedSponsorPackages = async () => {
  const packages = [
    {
      name: "bronze",
      displayName: "Bronze Package",
      monthlyPrice: 20000, // ₦20,000
      taskLimit: 100,
      features: [
        "Up to 100 tasks per month",
        "Basic analytics dashboard",
        "Email support",
        "Standard task visibility",
      ],
      isActive: true,
    },
    {
      name: "silver",
      displayName: "Silver Package",
      monthlyPrice: 50000, // ₦50,000
      taskLimit: 300,
      features: [
        "Up to 300 tasks per month",
        "Advanced analytics dashboard",
        "Priority email support",
        "Enhanced task visibility",
        "Custom branding options",
      ],
      isActive: true,
    },
    {
      name: "gold",
      displayName: "Gold Package",
      monthlyPrice: 100000, // ₦100,000
      taskLimit: null, // unlimited
      features: [
        "Unlimited tasks per month",
        "Premium analytics dashboard",
        "24/7 priority support",
        "Maximum task visibility",
        "Full custom branding",
        "Dedicated account manager",
        "API access",
      ],
      isActive: true,
    },
  ];

  for (const pkg of packages) {
    await SponsorPackage.findOneAndUpdate({ name: pkg.name }, pkg, {
      upsert: true,
      new: true,
    });
  }

  console.log("✅ Sponsor packages seeded successfully");
};
