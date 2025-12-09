import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const disable2FA = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Disable 2FA for all users
    const result = await User.updateMany(
      { twoFactorEnabled: true },
      {
        $set: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorMethod: null,
        },
      }
    );

    console.log(`✅ Disabled 2FA for ${result.modifiedCount} users`);
    console.log(`Total users: ${await User.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

disable2FA();
