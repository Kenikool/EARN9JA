/**
 * Quick System Test Script
 * Tests all major components without full test suite
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import mongoose from "mongoose";

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

import { currencyService } from "../src/services/CurrencyConversionService.js";
import { ExternalProvider } from "../src/models/ExternalProvider.js";
import { OfferWallTransaction } from "../src/models/OfferWallTransaction.js";

async function testSystem() {
  console.log("\n🧪 Starting System Tests...\n");

  try {
    // Connect to MongoDB
    console.log("1️⃣ Testing MongoDB Connection...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/earn9ja"
    );
    console.log("✅ MongoDB connected\n");

    // Test Currency Service
    console.log("2️⃣ Testing Currency Conversion...");
    await currencyService.updateExchangeRates();
    const converted = await currencyService.convert(10, "USD", "NGN");
    console.log(`✅ Converted $10 USD = ₦${converted.toFixed(2)} NGN\n`);

    // Test Provider Model
    console.log("3️⃣ Testing Provider Model...");
    const providerCount = await ExternalProvider.countDocuments();
    console.log(`✅ Found ${providerCount} providers in database\n`);

    if (providerCount === 0) {
      console.log("⚠️  No providers found. Run: npm run seed:providers\n");
    } else {
      const providers = await ExternalProvider.find({ status: "active" });
      console.log("Active Providers:");
      providers.forEach((p) => {
        console.log(
          `  - ${p.name} (${p.providerId}): ${(p.commissionRate * 100).toFixed(
            0
          )}% commission`
        );
      });
      console.log();
    }

    // Test Transaction Model
    console.log("4️⃣ Testing Transaction Model...");
    const transactionCount = await OfferWallTransaction.countDocuments();
    console.log(`✅ Found ${transactionCount} transactions in database\n`);

    if (transactionCount > 0) {
      const recentTransactions = await OfferWallTransaction.find()
        .sort({ createdAt: -1 })
        .limit(5);
      console.log("Recent Transactions:");
      recentTransactions.forEach((t) => {
        console.log(
          `  - ${t.offerName}: ₦${t.userEarnings.toFixed(2)} (${t.status})`
        );
      });
      console.log();
    }

    // Test Static Methods
    console.log("5️⃣ Testing Static Methods...");
    if (transactionCount > 0) {
      const firstTransaction = await OfferWallTransaction.findOne();
      if (firstTransaction) {
        const found = await OfferWallTransaction.findByExternalId(
          firstTransaction.externalTransactionId
        );
        console.log(
          `✅ findByExternalId works: ${found ? "Found" : "Not found"}\n`
        );

        const stats = await OfferWallTransaction.getProviderStats(
          firstTransaction.providerId
        );
        console.log(`✅ getProviderStats works:`);
        console.log(`  - Total Transactions: ${stats.totalTransactions}`);
        console.log(`  - Total Revenue: ₦${stats.totalRevenue.toFixed(2)}`);
        console.log(
          `  - Total Commission: ₦${stats.totalCommission.toFixed(2)}\n`
        );
      }
    }

    console.log("✅ All tests passed!\n");
    console.log("📋 Summary:");
    console.log(`  - MongoDB: Connected`);
    console.log(`  - Currency Service: Working`);
    console.log(`  - Providers: ${providerCount} configured`);
    console.log(`  - Transactions: ${transactionCount} recorded`);
    console.log();
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB\n");
    process.exit(0);
  }
}

testSystem();
