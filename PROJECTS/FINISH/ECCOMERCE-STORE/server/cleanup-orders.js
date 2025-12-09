// Cleanup all orders and create a fresh one
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Order = (await import('./src/models/Order.js')).default;
    const Product = (await import('./src/models/Product.js')).default;
    const User = (await import('./src/models/User.js')).default;
    const Shipping = (await import('./src/models/Shipping.js')).default;

    // Delete all orders
    const deleteResult = await Order.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} orders`);

    // Get admin user
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
      console.log('❌ Admin user not found');
      await mongoose.connection.close();
      return;
    }

    // Get product
    const product = await Product.findOne({ name: 'Test Smartphone' });
    if (!product) {
      console.log('❌ Product not found');
      await mongoose.connection.close();
      return;
    }

    // Get shipping method
    const shipping = await Shipping.findOne({ name: 'Standard Shipping' });
    if (!shipping) {
      console.log('❌ Shipping method not found');
      await mongoose.connection.close();
      return;
    }

    // Create a fresh order
    const order = await Order.create({
      user: admin._id,
      items: [{
        product: product._id,
        name: product.name,
        quantity: 1,
        image: product.images[0],
        price: product.price
      }],
      shippingAddress: {
        fullName: 'Admin User',
        phone: '1234567890',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'USA'
      },
      paymentMethod: 'stripe',
      itemsPrice: product.price,
      taxPrice: product.price * 0.1,
      shippingPrice: shipping.zones[0].baseRate,
      totalPrice: product.price + (product.price * 0.1) + shipping.zones[0].baseRate,
      isPaid: true,
      paidAt: new Date(),
      paymentResult: {
        id: 'test_payment_cleanup',
        status: 'completed',
        updateTime: new Date().toISOString(),
        emailAddress: 'admin@test.com',
        gateway: 'stripe'
      }
    });

    console.log('✅ Created fresh order:', order._id);
    console.log('   Order Number:', order.orderNumber);
    console.log('   Has items:', !!order.items);
    console.log('   Items length:', order.items?.length);
    if (order.items && order.items.length > 0) {
      console.log('   Product:', order.items[0].product);
    }
    console.log('   Is Paid:', order.isPaid);

    await mongoose.connection.close();
    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanup();
