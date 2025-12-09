import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const deleteUserByEmail = async (email) => {
  try {
    if (!email) {
      console.error('Please provide an email address');
      console.log('Usage: node server/scripts/deleteUserByEmail.js <email>');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`User with email ${email} not found`);
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Role: ${user.role}`);
    console.log(`Email Verified: ${user.isEmailVerified}`);
    console.log(`Created: ${user.createdAt}`);

    // Delete the user
    await User.deleteOne({ _id: user._id });
    console.log(`\nUser ${email} has been deleted successfully`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Delete user error:', error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];
deleteUserByEmail(email);
