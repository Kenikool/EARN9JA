import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// User schema (simplified for script)
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

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Admin details
    const adminData = {
      firstName: "Admin",
      lastName: "Earn9ja",
      email: "admin@earn9ja.site",
      phoneNumber: "08000000000",
      password: "Admin@Earn9ja2024!", // Change this!
      roles: ["admin"],
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("⚠️  Admin already exists with email:", adminData.email);
      console.log("📧 Email:", adminData.email);
      console.log("🔐 Use existing password or reset it manually");
      process.exit(0);
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const admin = new User({
      ...adminData,
      password: hashedPassword,
    });

    await admin.save();

    console.log("\n✅ Admin account created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", adminData.email);
    console.log("🔐 Password:", adminData.password);
    console.log("👤 Role: admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    console.log("📱 Login through the mobile app with these credentials");
    console.log("🎛️  Admin panel will be accessible after login\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

// Run the script
createAdmin();
