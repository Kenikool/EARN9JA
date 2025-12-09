import mongoose from "mongoose";
import Post from "../models/Post.js";
import { calculateReadingTime } from "./readingTime.js";
import dotenv from "dotenv";

dotenv.config();

const updateReadingTimes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all posts
    const posts = await Post.find({});
    console.log(`📚 Found ${posts.length} posts to update`);

    let updatedCount = 0;

    // Update each post
    for (const post of posts) {
      const newReadingTime = calculateReadingTime(post.content);
      
      if (post.readingTime !== newReadingTime) {
        post.readingTime = newReadingTime;
        await post.save();
        updatedCount++;
        console.log(`✅ Updated post "${post.title}" - Reading time: ${newReadingTime} min`);
      } else {
        console.log(`⏭️  Skipped post "${post.title}" - Already correct (${newReadingTime} min)`);
      }
    }

    console.log(`\n✨ Update complete! Updated ${updatedCount} out of ${posts.length} posts`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating reading times:", error);
    process.exit(1);
  }
};

updateReadingTimes();

