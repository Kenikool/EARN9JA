import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";
import Post from "../models/Post.js";

dotenv.config();

const updateCategoryPostCounts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const categories = await Category.find();
    console.log(`📊 Found ${categories.length} categories`);

    for (const category of categories) {
      const postCount = await Post.countDocuments({
        category: category._id,
        status: "published",
      });

      category.postCount = postCount;
      await category.save();

      console.log(`✅ Updated ${category.name}: ${postCount} posts`);
    }

    console.log("\n🎉 All category post counts updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating category post counts:", error);
    process.exit(1);
  }
};

updateCategoryPostCounts();
