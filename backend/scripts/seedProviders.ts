import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import mongoose from "mongoose";
import { ExternalProvider } from "../src/models/ExternalProvider.js";
import { ProviderType, TaskCategory } from "../src/types/provider.types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPaths = [
  join(__dirname, "../.env"),
  join(process.cwd(), ".env"),
  join(process.cwd(), "backend/.env"),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    console.log(`📄 Loading .env from: ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

const providers = [
  {
    providerId: "cpagrip",
    name: "CPAGrip",
    providerType: ProviderType.OFFER_WALL,
    category: TaskCategory.GENERAL,
    apiEndpoint: "https://cpagrip.com",
    apiKey: process.env.CPAGRIP_API_KEY || "your_cpagrip_api_key",
    apiSecret: process.env.CPAGRIP_SECRET_KEY || "your_cpagrip_secret",
    status: "active" as const,
    commissionRate: 0.2, // 20%
    supportedCurrencies: ["USD"],
    config: {
      syncInterval: 15,
      maxTasksPerSync: 100,
      timeout: 30000,
    },
    metrics: {
      totalTasksSynced: 0,
      totalCompletions: 0,
      totalRevenue: 0,
      avgCompletionRate: 0,
    },
  },
  {
    providerId: "ogads",
    name: "OGAds",
    providerType: ProviderType.OFFER_WALL,
    category: TaskCategory.GENERAL,
    apiEndpoint: "https://ogads.com",
    apiKey: process.env.OGADS_API_KEY || "your_ogads_api_key",
    apiSecret: process.env.OGADS_SECRET_KEY || "your_ogads_secret",
    status: "active" as const,
    commissionRate: 0.18, // 18%
    supportedCurrencies: ["USD"],
    config: {
      syncInterval: 15,
      maxTasksPerSync: 100,
      timeout: 30000,
    },
    metrics: {
      totalTasksSynced: 0,
      totalCompletions: 0,
      totalRevenue: 0,
      avgCompletionRate: 0,
    },
  },
  {
    providerId: "adgatemedia",
    name: "AdGate Media",
    providerType: ProviderType.OFFER_WALL,
    category: TaskCategory.GENERAL,
    apiEndpoint: "https://api.adgatemedia.com",
    apiKey: process.env.ADGATE_API_KEY || "your_adgate_api_key",
    apiSecret: process.env.ADGATE_SECRET_KEY || "your_adgate_secret",
    status: "inactive" as const,
    commissionRate: 0.18, // 18%
    supportedCurrencies: ["USD"],
    config: {
      syncInterval: 15,
      maxTasksPerSync: 100,
      timeout: 30000,
    },
    metrics: {
      totalTasksSynced: 0,
      totalCompletions: 0,
      totalRevenue: 0,
      avgCompletionRate: 0,
    },
  },
  {
    providerId: "offertoro",
    name: "OfferToro",
    providerType: ProviderType.OFFER_WALL,
    category: TaskCategory.GENERAL,
    apiEndpoint: "https://www.offertoro.com/api",
    apiKey: process.env.OFFERTORO_API_KEY || "your_offertoro_api_key",
    apiSecret: process.env.OFFERTORO_SECRET_KEY || "your_offertoro_secret",
    status: "inactive" as const,
    commissionRate: 0.15, // 15%
    supportedCurrencies: ["USD"],
    config: {
      syncInterval: 15,
      maxTasksPerSync: 100,
      timeout: 30000,
    },
    metrics: {
      totalTasksSynced: 0,
      totalCompletions: 0,
      totalRevenue: 0,
      avgCompletionRate: 0,
    },
  },
];

async function seedProviders() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/earn9ja";
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing providers (optional - comment out if you want to keep existing)
    // await ExternalProvider.deleteMany({});
    // console.log("🗑️  Cleared existing providers");

    // Insert providers
    for (const providerData of providers) {
      const existing = await ExternalProvider.findOne({
        providerId: providerData.providerId,
      });

      if (existing) {
        console.log(
          `⏭️  Provider ${providerData.name} already exists, skipping...`
        );
        continue;
      }

      await ExternalProvider.create(providerData);
      console.log(`✅ Created provider: ${providerData.name}`);
    }

    console.log("\n🎉 Provider seeding completed!");
    console.log(`📊 Total providers: ${providers.length}`);

    // Display summary
    const allProviders = await ExternalProvider.find();
    console.log("\n📋 Current providers:");
    allProviders.forEach((p) => {
      console.log(
        `  - ${p.name} (${p.providerId}): ${p.status} - ${
          p.commissionRate * 100
        }% commission`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding providers:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seed function
seedProviders();
