import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Referral from '../src/models/Referral.js';
import LoyaltyPoints from '../src/models/LoyaltyPoints.js';

dotenv.config();

const testReferralSystem = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    console.log('='.repeat(60));
    console.log('REFERRAL SYSTEM TEST');
    console.log('='.repeat(60));

    // Get all users
    const users = await User.find().select('name email createdAt').sort('-createdAt').limit(10);
    console.log(`\nFound ${users.length} users (showing last 10):\n`);

    for (const user of users) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`Created: ${user.createdAt}`);

      // Check referral code
      const referralCode = await Referral.findOne({ referrer: user._id, referred: null });
      if (referralCode) {
        console.log(`✅ Referral Code: ${referralCode.code}`);
      } else {
        console.log(`❌ No referral code generated`);
      }

      // Check if they used a referral code
      const usedReferral = await Referral.findOne({ referred: user._id });
      if (usedReferral) {
        const referrer = await User.findById(usedReferral.referrer).select('name email');
        console.log(`✅ Used referral code: ${usedReferral.code} (from ${referrer?.name})`);
        console.log(`   Status: ${usedReferral.status}`);
        console.log(`   Reward: ${usedReferral.reward} points`);
      } else {
        console.log(`ℹ️  Did not use a referral code`);
      }

      // Check loyalty points
      const loyaltyPoints = await LoyaltyPoints.findOne({ user: user._id });
      if (loyaltyPoints) {
        console.log(`✅ Loyalty Points: ${loyaltyPoints.points} (${loyaltyPoints.tier})`);
        if (loyaltyPoints.transactions.length > 0) {
          console.log(`   Transactions:`);
          loyaltyPoints.transactions.forEach((t, i) => {
            console.log(`   ${i + 1}. ${t.type}: ${t.points} pts - ${t.reason}`);
          });
        }
      } else {
        console.log(`❌ No loyalty points account`);
      }

      // Check referrals made by this user
      const referralsMade = await Referral.find({ referrer: user._id, status: 'completed' });
      if (referralsMade.length > 0) {
        console.log(`✅ Successful Referrals: ${referralsMade.length}`);
        for (const ref of referralsMade) {
          const referred = await User.findById(ref.referred).select('name email');
          console.log(`   - ${referred?.name} (${referred?.email})`);
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('SUMMARY');
    console.log('='.repeat(60));

    const totalUsers = await User.countDocuments();
    const totalReferrals = await Referral.countDocuments({ status: 'completed' });
    const totalLoyaltyAccounts = await LoyaltyPoints.countDocuments();
    const usersWithPoints = await LoyaltyPoints.countDocuments({ points: { $gt: 0 } });

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Completed Referrals: ${totalReferrals}`);
    console.log(`Loyalty Accounts: ${totalLoyaltyAccounts}`);
    console.log(`Users with Points: ${usersWithPoints}`);

    // Check for issues
    console.log(`\n${'='.repeat(60)}`);
    console.log('POTENTIAL ISSUES');
    console.log('='.repeat(60));

    // Users who used referral but have no loyalty points
    const referredUsers = await Referral.find({ status: 'completed' }).distinct('referred');
    for (const userId of referredUsers) {
      const loyaltyPoints = await LoyaltyPoints.findOne({ user: userId });
      if (!loyaltyPoints || loyaltyPoints.points === 0) {
        const user = await User.findById(userId).select('name email');
        console.log(`⚠️  ${user?.name} (${user?.email}) used referral but has no/zero points`);
      }
    }

    // Referrers who should have points
    const referrers = await Referral.find({ status: 'completed' }).distinct('referrer');
    for (const userId of referrers) {
      const loyaltyPoints = await LoyaltyPoints.findOne({ user: userId });
      const referralCount = await Referral.countDocuments({ referrer: userId, status: 'completed' });
      const expectedPoints = referralCount * 100;
      
      if (!loyaltyPoints) {
        const user = await User.findById(userId).select('name email');
        console.log(`⚠️  ${user?.name} (${user?.email}) has ${referralCount} referrals but no loyalty account`);
      } else {
        const referralPoints = loyaltyPoints.transactions
          .filter(t => t.reason.includes('Referral'))
          .reduce((sum, t) => sum + t.points, 0);
        
        if (referralPoints < expectedPoints) {
          const user = await User.findById(userId).select('name email');
          console.log(`⚠️  ${user?.name} (${user?.email}) should have ${expectedPoints} referral points but has ${referralPoints}`);
        }
      }
    }

    console.log(`\n✅ Test completed\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testReferralSystem();
