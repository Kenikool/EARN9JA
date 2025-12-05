// MongoDB Index Creation Script
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const indexes = [
  {
    collection: "users",
    indexes: [
      { keys: { email: 1 }, options: { unique: true } },
      { keys: { phoneNumber: 1 }, options: { unique: true } },
      { keys: { referralCode: 1 }, options: { unique: true, sparse: true } },
      { keys: { roles: 1 }, options: {} },
      { keys: { "sponsorPackage.expiresAt": 1 }, options: {} },
    ],
  },
  {
    collection: "tasks",
    indexes: [
      { keys: { sponsorId: 1, status: 1 }, options: {} },
      { keys: { category: 1, status: 1 }, options: {} },
      { keys: { createdAt: -1 }, options: {} },
      { keys: { expiresAt: 1 }, options: {} },
    ],
  },
  {
    collection: "tasksubmissions",
    indexes: [
      { keys: { taskId: 1, workerId: 1 }, options: {} },
      { keys: { workerId: 1, status: 1 }, options: {} },
      { keys: { status: 1, createdAt: -1 }, options: {} },
    ],
  },
  {
    collection: "transactions",
    indexes: [
      { keys: { userId: 1, createdAt: -1 }, options: {} },
      { keys: { type: 1, createdAt: -1 }, options: {} },
      { keys: { status: 1 }, options: {} },
    ],
  },
  {
    collection: "financialtransactions",
    indexes: [
      { keys: { type: 1, createdAt: -1 }, options: {} },
      { keys: { userId: 1, createdAt: -1 }, options: {} },
    ],
  },
  {
    collection: "dailyfinancialsummaries",
    indexes: [{ keys: { date: -1 }, options: { unique: true } }],
  },
  {
    collection: "escrowaccounts",
    indexes: [{ keys: { sponsorId: 1 }, options: { unique: true } }],
  },
  {
    collection: "referrals",
    indexes: [
      { keys: { referrerId: 1 }, options: {} },
      { keys: { referredUserId: 1 }, options: { unique: true } },
      { keys: { status: 1, expiresAt: 1 }, options: {} },
    ],
  },
  {
    collection: "dailybonuses",
    indexes: [
      { keys: { userId: 1, date: 1 }, options: { unique: true } },
      { keys: { userId: 1, claimed: 1, date: -1 }, options: {} },
    ],
  },
  {
    collection: "notifications",
    indexes: [
      { keys: { userId: 1, createdAt: -1 }, options: {} },
      { keys: { userId: 1, read: 1 }, options: {} },
    ],
  },
];

async function createIndexes() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    for (const { collection, indexes: collectionIndexes } of indexes) {
      console.log(`\n📊 Creating indexes for ${collection}...`);

      for (const { keys, options } of collectionIndexes) {
        try {
          await db.collection(collection).createIndex(keys, options);
          console.log(`  ✓ Created index: ${JSON.stringify(keys)}`);
        } catch (error) {
          if (error.code === 85 || error.code === 86) {
            // Index already exists or duplicate key
            console.log(`  ⚠ Index already exists: ${JSON.stringify(keys)}`);
          } else {
            console.error(`  ❌ Error creating index: ${error.message}`);
          }
        }
      }
    }

    console.log("\n✅ All indexes created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createIndexes();
