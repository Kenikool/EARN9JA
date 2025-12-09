import Category from "../models/Category.js";
import { generateSlug } from "./slugify.js";

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

export const seedCategories = async () => {
  try {
    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    
    if (existingCount > 0) {
      console.log(`✅ ${existingCount} categories already exist. Skipping seed.`);
      return;
    }

    // Create categories
    const categories = blogCategories.map((cat) => ({
      ...cat,
      slug: generateSlug(cat.name),
      postCount: 0,
    }));

    await Category.insertMany(categories);
    console.log(`✅ Successfully seeded ${categories.length} blog categories`);
    
    categories.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  }
};
