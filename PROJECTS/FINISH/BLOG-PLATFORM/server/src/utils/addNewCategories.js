import Category from "../models/Category.js";
import { generateSlug } from "./slugify.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const newCategories = [
  {
    name: "Music",
    description: "Music reviews, artist spotlights, and industry news",
  },
  {
    name: "Movies",
    description: "Film reviews, cinema news, and movie recommendations",
  },
  {
    name: "Entertainment",
    description: "TV shows, celebrities, pop culture, and entertainment news",
  },
  {
    name: "Weather",
    description: "Weather updates, climate discussions, and forecasts",
  },
];

const addNewCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check and add each category if it doesn't exist
    for (const cat of newCategories) {
      const slug = generateSlug(cat.name);
      const existingCategory = await Category.findOne({ slug });

      if (existingCategory) {
        console.log(`⏭️  Category "${cat.name}" already exists. Skipping.`);
      } else {
        await Category.create({
          ...cat,
          slug,
          postCount: 0,
        });
        console.log(`✅ Added category: ${cat.name} (${slug})`);
      }
    }

    console.log("\n🎉 Successfully added new categories!");
    
    // Show all categories
    const allCategories = await Category.find().sort({ name: 1 });
    console.log(`\n📋 Total categories: ${allCategories.length}`);
    allCategories.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error adding categories:", error);
    process.exit(1);
  }
};

addNewCategories();
