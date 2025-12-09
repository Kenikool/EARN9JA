import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Category from "../models/Category.js";
import { generateSlug } from "./slugify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const blogCategories = [
  {
    name: "Technology",
    description: "Posts about technology, gadgets, and innovations",
  },
  {
    name: "Programming",
    description: "Coding tutorials, tips, and best practices",
  },
  {
    name: "Web Development",
    description: "Frontend, backend, and full-stack development",
  },
  {
    name: "Mobile Development",
    description: "iOS, Android, and cross-platform mobile apps",
  },
  {
    name: "Data Science",
    description: "Machine learning, AI, and data analysis",
  },
  {
    name: "DevOps",
    description: "CI/CD, cloud infrastructure, and deployment",
  },
  {
    name: "Design",
    description: "UI/UX design, graphics, and creative work",
  },
  {
    name: "Business",
    description: "Entrepreneurship, startups, and business strategies",
  },
  {
    name: "Lifestyle",
    description: "Personal stories, life tips, and experiences",
  },
  {
    name: "Health & Fitness",
    description: "Wellness, exercise, and healthy living",
  },
  {
    name: "Travel",
    description: "Travel guides, tips, and experiences",
  },
  {
    name: "Food & Cooking",
    description: "Recipes, cooking tips, and food reviews",
  },
  {
    name: "Tutorial",
    description: "Step-by-step guides and how-to articles",
  },
  {
    name: "Opinion",
    description: "Personal opinions and thought pieces",
  },
  {
    name: "News",
    description: "Latest news and updates",
  },
];

const resetCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Delete all existing categories
    const deleteResult = await Category.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old categories`);

    // Create new blog categories
    const categories = blogCategories.map((cat) => ({
      ...cat,
      slug: generateSlug(cat.name),
      postCount: 0,
    }));

    await Category.insertMany(categories);
    console.log(`✅ Successfully created ${categories.length} blog categories:`);
    
    categories.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

resetCategories();
