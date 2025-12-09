import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import User from './src/models/User.js';

// Load environment variables
dotenv.config();

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.",
    price: 199.99,
    compareAtPrice: 249.99,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500"
    ],
    category: "electronics",
    brand: "AudioTech",
    stock: 50,
    sku: "ATH-WBH-001",
    variants: [
      {
        name: "Color",
        options: ["Black", "White", "Blue", "Red"]
      }
    ],
    specifications: [
      { key: "Battery Life", value: "30 hours" },
      { key: "Connectivity", value: "Bluetooth 5.0" },
      { key: "Noise Cancellation", value: "Active" },
      { key: "Weight", value: "250g" },
      { key: "Warranty", value: "2 years" }
    ],
    tags: ["wireless", "bluetooth", "headphones", "audio"],
    featured: true,
    averageRating: 4.5,
    totalReviews: 128,
    sold: 245,
    views: 1250
  },
  {
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Waterproof and perfect for athletes.",
    price: 299.99,
    compareAtPrice: 349.99,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500",
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500"
    ],
    category: "electronics",
    brand: "FitTech",
    stock: 30,
    sku: "FT-FW-002",
    variants: [
      {
        name: "Size",
        options: ["Small", "Medium", "Large"]
      },
      {
        name: "Color",
        options: ["Black", "Silver", "Rose Gold"]
      }
    ],
    specifications: [
      { key: "Battery Life", value: "7 days" },
      { key: "Water Resistance", value: "50m" },
      { key: "GPS", value: "Built-in" },
      { key: "Heart Rate Monitor", value: "Optical" },
      { key: "Display", value: "AMOLED" }
    ],
    tags: ["fitness", "smartwatch", "health", "gps"],
    featured: true,
    averageRating: 4.7,
    totalReviews: 89,
    sold: 156,
    views: 980
  },
  {
    name: "Organic Cotton T-Shirt",
    slug: "organic-cotton-t-shirt",
    description: "Comfortable and sustainable organic cotton t-shirt. Soft, breathable, and perfect for everyday wear. Available in multiple colors and sizes.",
    price: 29.99,
    compareAtPrice: 39.99,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500"
    ],
    category: "clothing",
    brand: "EcoWear",
    stock: 100,
    sku: "EW-CTS-003",
    variants: [
      {
        name: "Size",
        options: ["S", "M", "L", "XL", "XXL"]
      },
      {
        name: "Color",
        options: ["White", "Black", "Gray", "Navy", "Olive"]
      }
    ],
    specifications: [
      { key: "Material", value: "100% Organic Cotton" },
      { key: "Care", value: "Machine wash cold" },
      { key: "Origin", value: "Ethically sourced" },
      { key: "Fit", value: "Regular fit" }
    ],
    tags: ["organic", "cotton", "t-shirt", "sustainable"],
    featured: false,
    averageRating: 4.3,
    totalReviews: 67,
    sold: 89,
    views: 450
  },
  {
    name: "Professional Camera Lens",
    slug: "professional-camera-lens",
    description: "High-quality 50mm f/1.4 lens for professional photography. Sharp optics, fast autofocus, and weather-sealed construction.",
    price: 899.99,
    compareAtPrice: 1099.99,
    images: [
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500"
    ],
    category: "electronics",
    brand: "PhotoPro",
    stock: 15,
    sku: "PP-LENS-004",
    variants: [
      {
        name: "Mount",
        options: ["Canon EF", "Nikon F", "Sony E"]
      }
    ],
    specifications: [
      { key: "Focal Length", value: "50mm" },
      { key: "Aperture", value: "f/1.4" },
      { key: "Autofocus", value: "Yes" },
      { key: "Weather Sealed", value: "Yes" },
      { key: "Weight", value: "850g" }
    ],
    tags: ["camera", "lens", "photography", "professional"],
    featured: true,
    averageRating: 4.8,
    totalReviews: 34,
    sold: 23,
    views: 320
  },
  {
    name: "Ergonomic Office Chair",
    slug: "ergonomic-office-chair",
    description: "Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh back. Perfect for long work sessions.",
    price: 349.99,
    compareAtPrice: 449.99,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
      "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500",
      "https://images.unsplash.com/photo-1551298370-33d8d3ad26c5?w=500"
    ],
    category: "furniture",
    brand: "OfficeComfort",
    stock: 25,
    sku: "OC-CHAIR-005",
    variants: [
      {
        name: "Color",
        options: ["Black", "Gray", "Blue"]
      }
    ],
    specifications: [
      { key: "Material", value: "Mesh and Leather" },
      { key: "Adjustable Height", value: "Yes" },
      { key: "Lumbar Support", value: "Yes" },
      { key: "Weight Capacity", value: "150kg" },
      { key: "Warranty", value: "5 years" }
    ],
    tags: ["office", "chair", "ergonomic", "furniture"],
    featured: false,
    averageRating: 4.6,
    totalReviews: 78,
    sold: 45,
    views: 290
  },
  {
    name: "Stainless Steel Water Bottle",
    slug: "stainless-steel-water-bottle",
    description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.",
    price: 24.99,
    compareAtPrice: 34.99,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500",
      "https://images.unsplash.com/photo-1544007635-4e271b4f44e6?w=500"
    ],
    category: "lifestyle",
    brand: "HydroFlow",
    stock: 80,
    sku: "HF-BOTTLE-006",
    variants: [
      {
        name: "Size",
        options: ["500ml", "750ml", "1L"]
      },
      {
        name: "Color",
        options: ["Silver", "Black", "Blue", "Green"]
      }
    ],
    specifications: [
      { key: "Material", value: "Stainless Steel" },
      { key: "Insulation", value: "Double wall" },
      { key: "Cold Retention", value: "24 hours" },
      { key: "Hot Retention", value: "12 hours" },
      { key: "BPA Free", value: "Yes" }
    ],
    tags: ["water bottle", "stainless steel", "insulated", "eco-friendly"],
    featured: false,
    averageRating: 4.4,
    totalReviews: 156,
    sold: 203,
    views: 680
  },
  {
    name: "Wireless Gaming Mouse",
    slug: "wireless-gaming-mouse",
    description: "High-precision wireless gaming mouse with RGB lighting, programmable buttons, and 1000Hz polling rate. Perfect for competitive gaming.",
    price: 79.99,
    compareAtPrice: 99.99,
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"
    ],
    category: "electronics",
    brand: "GamePro",
    stock: 40,
    sku: "GP-MOUSE-007",
    variants: [
      {
        name: "Color",
        options: ["Black", "White", "RGB"]
      }
    ],
    specifications: [
      { key: "Connectivity", value: "2.4GHz Wireless" },
      { key: "DPI", value: "Up to 16000" },
      { key: "Polling Rate", value: "1000Hz" },
      { key: "Battery Life", value: "70 hours" },
      { key: "Programmable Buttons", value: "6" }
    ],
    tags: ["gaming", "mouse", "wireless", "rgb"],
    featured: false,
    averageRating: 4.5,
    totalReviews: 92,
    sold: 78,
    views: 420
  },
  {
    name: "Yoga Mat Premium",
    slug: "yoga-mat-premium",
    description: "High-quality yoga mat made from natural rubber with excellent grip and cushioning. Eco-friendly and perfect for all yoga practices.",
    price: 49.99,
    compareAtPrice: 69.99,
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
      "https://images.unsplash.com/photo-1506629905607-0b5ab9a9e21a?w=500",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"
    ],
    category: "sports",
    brand: "ZenFlow",
    stock: 60,
    sku: "ZF-MAT-008",
    variants: [
      {
        name: "Thickness",
        options: ["4mm", "6mm"]
      },
      {
        name: "Color",
        options: ["Purple", "Blue", "Green", "Black"]
      }
    ],
    specifications: [
      { key: "Material", value: "Natural Rubber" },
      { key: "Size", value: "68x183cm" },
      { key: "Thickness", value: "4mm/6mm" },
      { key: "Grip", value: "Excellent" },
      { key: "Eco-friendly", value: "Yes" }
    ],
    tags: ["yoga", "mat", "fitness", "eco-friendly"],
    featured: false,
    averageRating: 4.7,
    totalReviews: 134,
    sold: 167,
    views: 580
  }
];

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Latest gadgets, devices, and electronic accessories",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300"
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Fashion and apparel for men, women, and children",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300"
  },
  {
    name: "Sports & Fitness",
    slug: "sports",
    description: "Equipment and gear for sports and fitness activities",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300"
  },
  {
    name: "Home & Furniture",
    slug: "furniture",
    description: "Furniture, decor, and home improvement items",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300"
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    description: "Daily essentials and lifestyle products",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Seed categories first
    const createdCategories = await Category.insertMany(categories);
    console.log(`📂 Created ${createdCategories.length} categories`);

    // Create category map for products
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Update products with correct category ObjectIds
    const productsWithCategories = products.map(product => ({
      ...product,
      category: categoryMap[product.category] || createdCategories[0]._id
    }));

    // Seed products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`📦 Created ${createdProducts.length} products`);

    // Update category product counts (optional)
    for (const category of createdCategories) {
      const productCount = await Product.countDocuments({ category: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount });
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log('\n🚀 Ready to test the application!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeder
seedDatabase();