import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../../.env") });

// User schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phoneNumber: String,
  password: String,
  roles: [String],
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

async function checkUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("🔌 Connecting to MongoDB...");
    console.log("📍 URI:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
    console.log("📊 Database:", mongoose.connection.db.databaseName);

    // Check for specific email
    const email = "kenikooltechworld@gmail.com";
    const phone = "09128176313";

    console.log("\n🔍 Searching for user...");
    console.log("📧 Email:", email);
    console.log("📱 Phone:", phone);

    const userByEmail = await User.findOne({ email });
    const userByPhone = await User.findOne({ phoneNumber: phone });

    if (userByEmail) {
      console.log("\n✅ Found user by EMAIL:");
      console.log(JSON.stringify(userByEmail, null, 2));
    } else {
      console.log("\n❌ No user found with email:", email);
    }

    if (userByPhone) {
      console.log("\n✅ Found user by PHONE:");
      console.log(JSON.stringify(userByPhone, null, 2));
    } else {
      console.log("\n❌ No user found with phone:", phone);
    }

    // List all users
    const allUsers = await User.find({}).select(
      "email phoneNumber roles createdAt"
    );
    console.log("\n📋 All users in database:");
    console.log(`Total users: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Phone: ${user.phoneNumber}`);
      console.log(`   Roles: ${user.roles.join(", ")}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the script
checkUser();
