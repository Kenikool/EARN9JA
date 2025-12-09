import dotenv from 'dotenv';
import mongoose from 'mongoose';
import subscriptionProcessor from '../src/services/subscriptionProcessor.js';

dotenv.config();

async function runSubscriptionProcessor() {
  try {
    console.log('🚀 Subscription Processor Starting...');
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log('=====================================\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Process due subscriptions
    const results = await subscriptionProcessor.processDueSubscriptions();

    console.log('\n=====================================');
    console.log('📊 Processing Summary:');
    console.log(`✓ Successful: ${results.successful}`);
    console.log(`✗ Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(err => {
        console.log(`  - Subscription ${err.subscriptionId}: ${err.error}`);
      });
    }

    // Send upcoming delivery reminders
    console.log('\n📧 Sending upcoming delivery reminders...');
    await subscriptionProcessor.sendUpcomingDeliveryReminders();

    console.log('\n✅ Subscription processing complete!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runSubscriptionProcessor();
