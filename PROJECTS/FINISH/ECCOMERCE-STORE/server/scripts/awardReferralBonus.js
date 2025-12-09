import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import LoyaltyPoints from '../src/models/LoyaltyPoints.js';

dotenv.config();

const awardReferralBonus = async (email) => {
  try {
    if (!email) {
      console.error('Please provide an email address');
      console.log('Usage: node server/scripts/awardReferralBonus.js <email>');
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

    let loyaltyPoints = await LoyaltyPoints.findOne({ user: user._id });

    if (!loyaltyPoints) {
      console.log('Creating loyalty points account...');
      loyaltyPoints = await LoyaltyPoints.create({ user: user._id });
    }

    console.log(`Current Points: ${loyaltyPoints.points}`);
    console.log(`\nAwarding 50 referral bonus points...`);

    loyaltyPoints.addPoints(50, 'Referral sign-up bonus (manual award)');
    await loyaltyPoints.save();

    console.log(`✅ Bonus awarded successfully!`);
    console.log(`New Points Balance: ${loyaltyPoints.points}`);
    console.log(`Tier: ${loyaltyPoints.tier}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

const email = process.argv[2];
awardReferralBonus(email);
