import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';

dotenv.config();

const fixOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all orders to be marked as paid
    const result = await Order.updateMany(
      {},
      {
        $set: {
          isPaid: true,
          paidAt: new Date(),
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} orders`);
    console.log(`Total orders in database: ${await Order.countDocuments()}`);

    // Show revenue calculation
    const revenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    console.log(`💰 Total Revenue: $${revenue[0]?.total?.toFixed(2) || '0.00'}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixOrders();
