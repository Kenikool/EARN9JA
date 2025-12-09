import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Referral from '../src/models/Referral.js';
import LoyaltyPoints from '../src/models/LoyaltyPoints.js';

dotenv.config();

const fixMissingReferralBonus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find all completed referrals
    const completedReferrals = await Referral.find({ status: 'completed' });
    
    console.log(`Found ${completedReferrals.length} completed referrals\n`);

    for (const referral of completedReferrals) {
      const referredUser = await User.findById(referral.referred);
      
      if (!referredUser) {
        console.log(`⚠️  Referral ${referral.code}: Referred user not found (deleted?)`);
        continue;
      }

      console.log(`Checking referral: ${referral.code}`);
      console.log(`Referred user: ${referredUser.name} (${referredUser.email})`);

      // Check if referred user has loyalty points
      let loyaltyPoints = await LoyaltyPoints.findOne({ user: referral.referred });

      if (!loyaltyPoints) {
        console.log(`  ❌ No loyalty account - Creating one...`);
        loyaltyPoints = await LoyaltyPoints.create({ user: referral.referred });
      }

      // Check if they have the referral bonus
      const hasReferralBonus = loyaltyPoints.transactions.some(
        t => t.reason.includes('Sign up bonus') || t.reason.includes('referral')
      );

      if (!hasReferralBonus) {
        console.log(`  ❌ Missing referral bonus - Awarding 50 points...`);
        loyaltyPoints.addPoints(50, 'Sign up bonus via referral (retroactive)');
        await loyaltyPoints.save();
        console.log(`  ✅ Awarded 50 points!`);
      } else {
        console.log(`  ✅ Already has referral bonus (${loyaltyPoints.points} points)`);
      }
    }

    console.log(`\n✅ All referrals checked and fixed!\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixMissingReferralBonus();
