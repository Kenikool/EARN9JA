import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import LoyaltyPoints from '../src/models/LoyaltyPoints.js';

dotenv.config();

const checkLoyaltyPoints = async (email) => {
  try {
    if (!email) {
      console.error('Please provide an email address');
      console.log('Usage: node server/scripts/checkLoyaltyPoints.js <email>');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`User with email ${email} not found`);
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`User: ${user.name} (${user.email})`);
    console.log(`User ID: ${user._id}`);
    console.log(`Created: ${user.createdAt}\n`);

    const loyaltyPoints = await LoyaltyPoints.findOne({ user: user._id });

    if (!loyaltyPoints) {
      console.log('❌ No loyalty points account found for this user');
      console.log('\nCreating loyalty points account...');
      
      const newLoyaltyPoints = await LoyaltyPoints.create({ user: user._id });
      console.log('✅ Loyalty points account created');
      console.log(`Points: ${newLoyaltyPoints.points}`);
      console.log(`Tier: ${newLoyaltyPoints.tier}`);
    } else {
      console.log('✅ Loyalty Points Account Found');
      console.log(`Points: ${loyaltyPoints.points}`);
      console.log(`Tier: ${loyaltyPoints.tier}`);
      console.log(`\nTransaction History (${loyaltyPoints.transactions.length} transactions):`);
      
      if (loyaltyPoints.transactions.length > 0) {
        loyaltyPoints.transactions.forEach((transaction, index) => {
          console.log(`\n${index + 1}. ${transaction.type.toUpperCase()}`);
          console.log(`   Points: ${transaction.points}`);
          console.log(`   Reason: ${transaction.reason}`);
          console.log(`   Date: ${transaction.date}`);
        });
      } else {
        console.log('No transactions yet');
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

const email = process.argv[2];
checkLoyaltyPoints(email);
