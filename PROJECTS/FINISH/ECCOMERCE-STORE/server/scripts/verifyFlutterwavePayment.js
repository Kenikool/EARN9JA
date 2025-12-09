import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import Wallet from '../src/models/Wallet.js';
import User from '../src/models/User.js';

dotenv.config();

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

async function verifyAndAddFunds() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get transaction ID from command line
    const transactionId = process.argv[2];
    const userEmail = process.argv[3];

    if (!transactionId || !userEmail) {
      console.log('Usage: node verifyFlutterwavePayment.js <transaction_id> <user_email>');
      console.log('Example: node verifyFlutterwavePayment.js 1234567 user@example.com');
      process.exit(1);
    }

    console.log(`\nVerifying Flutterwave transaction: ${transactionId}`);
    console.log(`For user: ${userEmail}\n`);

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error('User not found!');
      process.exit(1);
    }

    // Verify payment with Flutterwave
    const response = await axios.get(
      `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY_TEST}`,
        },
      }
    );

    console.log('Flutterwave Response:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.status === 'success') {
      const data = response.data.data;
      
      if (data.status === 'successful') {
        console.log('\n✅ Payment verified successfully!');
        console.log(`Amount: ${data.currency} ${data.amount}`);
        console.log(`Status: ${data.status}`);
        console.log(`Reference: ${data.tx_ref}`);

        // Get or create wallet
        let wallet = await Wallet.findOne({ user: user._id });
        if (!wallet) {
          wallet = await Wallet.create({ user: user._id });
          console.log('\n📝 Created new wallet');
        }

        // Check if already processed
        const existingTx = wallet.transactions.find(
          tx => tx.reference === transactionId
        );

        if (existingTx) {
          console.log('\n⚠️  Payment already processed!');
          console.log(`Current balance: $${wallet.balance}`);
        } else {
          // Add funds
          await wallet.addFunds(
            data.amount,
            `Wallet top-up via flutterwave`,
            transactionId
          );

          console.log('\n💰 Funds added to wallet!');
          console.log(`New balance: $${wallet.balance}`);
        }
      } else {
        console.log(`\n❌ Payment status: ${data.status}`);
      }
    } else {
      console.log('\n❌ Verification failed');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

verifyAndAddFunds();
