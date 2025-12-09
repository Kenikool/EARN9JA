import mongoose from "mongoose";
import Post from "../models/Post.js";
import dotenv from "dotenv";

dotenv.config();

const updatePublishedDates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update all published posts that don't have publishedAt
    const result = await Post.updateMany(
      { status: "published", publishedAt: null },
      { $set: { publishedAt: new Date() } }
    );

    console.log(`Updated ${result.modifiedCount} posts with publishedAt dates`);

    await mongoose.connection.close();
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

updatePublishedDates();
