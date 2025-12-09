import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const cleanupIncompleteUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find users who registered but never verified email and are older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const incompleteUsers = await User.find({
      isEmailVerified: false,
      createdAt: { $lt: sevenDaysAgo },
      role: { $ne: 'admin' }, // Don't delete admin accounts
    });

    console.log(`Found ${incompleteUsers.length} incomplete user registrations older than 7 days`);

    if (incompleteUsers.length > 0) {
      const result = await User.deleteMany({
        isEmailVerified: false,
        createdAt: { $lt: sevenDaysAgo },
        role: { $ne: 'admin' },
      });

      console.log(`Deleted ${result.deletedCount} incomplete user accounts`);
      
      // List deleted users
      incompleteUsers.forEach(user => {
        console.log(`- ${user.email} (created: ${user.createdAt})`);
      });
    } else {
      console.log('No incomplete users to clean up');
    }

    await mongoose.connection.close();
    console.log('Cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
};

cleanupIncompleteUsers();
