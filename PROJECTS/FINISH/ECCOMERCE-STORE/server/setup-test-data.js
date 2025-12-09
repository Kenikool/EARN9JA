// Setup test data for Phase 6
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function setupTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    
    let admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create category
    let category = await Category.findOne({ name: 'Electronics' });
    if (!category) {
      category = await Category.create({
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics'
      });
      console.log('✅ Category created');
    } else {
      console.log('✅ Category already exists');
    }

    // Create product
    let product = await Product.findOne({ name: 'Test Smartphone' });
    if (!product) {
      product = await Product.create({
        name: 'Test Smartphone',
        description: 'Latest smartphone for testing',
        price: 599.99,
        countInStock: 50,
        category: category._id,
        vendor: admin._id,
        images: ['https://example.com/phone.jpg'],
        slug: 'test-smartphone-' + Date.now()
      });
      console.log('✅ Product created');
    } else {
      console.log('✅ Product already exists');
    }

    // Create shipping method
    const Shipping = (await import('./src/models/Shipping.js')).default;
    
    // Delete old shipping method if it exists without zones
    await Shipping.deleteMany({ name: 'Standard Shipping' });
    
    const shipping = await Shipping.create({
      name: 'Standard Shipping',
      description: '5-7 business days',
      zones: [{
        countries: ['USA', 'Canada'],
        states: [],
        baseRate: 10.00,
        perKgRate: 2.00
      }],
      estimatedDays: {
        min: 5,
        max: 7
      },
      isActive: true
    });
    console.log('✅ Shipping method created');

    // Create an order for the admin user
    const Order = (await import('./src/models/Order.js')).default;
    let order = await Order.findOne({ user: admin._id, 'orderItems.product': product._id });
    if (!order) {
      const itemsPrice = parseFloat(product.price);
      const taxPrice = itemsPrice * 0.1;
      const shippingPrice = parseFloat(shipping.zones[0].baseRate);
      const totalPrice = itemsPrice + taxPrice + shippingPrice;
      
      order = await Order.create({
        user: admin._id,
        orderItems: [{
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
        paymentMethod: 'test',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: true,
        paidAt: new Date()
      });
      console.log('✅ Order created and marked as paid');
    } else {
      console.log('✅ Order already exists');
    }

    console.log('\n========================================');
    console.log('Test Data Setup Complete!');
    console.log('========================================');
    console.log('Admin Email: admin@test.com');
    console.log('Admin Password: admin123456');
    console.log('Category ID:', category._id);
    console.log('Product ID:', product._id);
    console.log('Shipping ID:', shipping._id);
    console.log('Order ID:', order._id);
    console.log('========================================\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupTestData();
