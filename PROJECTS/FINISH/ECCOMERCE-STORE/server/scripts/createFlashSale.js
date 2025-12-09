import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FlashSale from '../src/models/FlashSale.js';
import Product from '../src/models/Product.js';

dotenv.config();

const createFlashSale = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a random product
    const products = await Product.find().limit(5);
    
    if (products.length === 0) {
      console.log('No products found. Please add products first.');
      process.exit(1);
    }

    // Create flash sales for each product
    const flashSales = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const now = new Date();
      const startTime = new Date(now.getTime() + (i * 60 * 60 * 1000)); // Stagger start times
      const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours duration
      
      const flashSale = await FlashSale.create({
        product: product._id,
        originalPrice: product.price,
        discountedPrice: Math.round(product.price * 0.7), // 30% off
        discountPercentage: 30,
        quantity: 50,
        soldCount: Math.floor(Math.random() * 20), // Random sold count
        startTime,
        endTime,
        isActive: true,
      });

      flashSales.push(flashSale);
      console.log(`Created flash sale for: ${product.name}`);
    }

    console.log(`\n✅ Created ${flashSales.length} flash sales successfully!`);
    console.log('\nFlash Sales:');
    flashSales.forEach((sale, index) => {
      console.log(`${index + 1}. Product ID: ${sale.product}`);
      console.log(`   Discount: ${sale.discountPercentage}%`);
      console.log(`   Price: $${sale.originalPrice} → $${sale.discountedPrice}`);
      console.log(`   Quantity: ${sale.quantity} (${sale.soldCount} sold)`);
      console.log(`   Duration: ${sale.startTime.toLocaleString()} - ${sale.endTime.toLocaleString()}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating flash sales:', error);
    process.exit(1);
  }
};

createFlashSale();
