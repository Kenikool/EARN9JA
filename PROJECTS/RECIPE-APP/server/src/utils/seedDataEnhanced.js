import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";
import Collection from "../models/Collection.js";
import MealPlan from "../models/MealPlan.js";
import ShoppingList from "../models/ShoppingList.js";
import dotenv from "dotenv";

dotenv.config();

// Sample user data
const usersData = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "user",
    bio: "Passionate home cook and recipe enthusiast",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "user",
    bio: "Culinary expert and food blogger",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Chef Mario",
    email: "mario@example.com",
    password: "password123",
    role: "user",
    bio: "Professional chef with 10+ years experience",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    name: "Lisa Chen",
    email: "lisa@example.com",
    password: "password123",
    role: "user",
    bio: "Asian cuisine specialist",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    password: "password123",
    role: "user",
    bio: "Mediterranean cooking enthusiast",
    avatar: "https://i.pravatar.cc/150?img=51",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    password: "password123",
    role: "user",
    bio: "Baking specialist and dessert lover",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Carlos Rodriguez",
    email: "carlos@example.com",
    password: "password123",
    role: "user",
    bio: "Mexican cuisine expert",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    name: "Emily Watson",
    email: "emily@example.com",
    password: "password123",
    role: "user",
    bio: "Healthy eating advocate",
    avatar: "https://i.pravatar.cc/150?img=24",
  },
  {
    name: "David Kim",
    email: "david@example.com",
    password: "password123",
    role: "user",
    bio: "Korean BBQ master",
    avatar: "https://i.pravatar.cc/150?img=68",
  },
  {
    name: "Sophie Martin",
    email: "sophie@example.com",
    password: "password123",
    role: "user",
    bio: "French pastry chef",
    avatar: "https://i.pravatar.cc/150?img=44",
  },
];

// Sample recipe data
const recipesData = [
  {
    title: "Classic Italian Spaghetti Carbonara",
    description:
      "Authentic Italian carbonara with eggs, pancetta, and Pecorino Romano cheese.",
    images: [
      "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: "medium",
    cuisine: "Italian",
    dietaryTags: [],
    ingredients: [
      { name: "Spaghetti", amount: 400, unit: "g" },
      { name: "Pancetta", amount: 150, unit: "g", notes: "diced" },
      { name: "Eggs", amount: 4, unit: "piece" },
      { name: "Pecorino Romano", amount: 100, unit: "g", notes: "grated" },
      { name: "Black pepper", amount: 1, unit: "tsp" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "Bring a large pot of salted water to boil. Cook spaghetti until al dente.",
      },
      {
        stepNumber: 2,
        description: "Whisk together eggs, cheese, and pepper.",
      },
      { stepNumber: 3, description: "Cook pancetta until crispy." },
      {
        stepNumber: 4,
        description: "Drain pasta, add to pancetta, remove from heat.",
      },
      {
        stepNumber: 5,
        description: "Toss with egg mixture, adding pasta water as needed.",
      },
    ],
    nutrition: { calories: 520, protein: 25, carbs: 65, fat: 18, fiber: 3 },
  },
  {
    title: "Perfect Chicken Tikka Masala",
    description: "Tender chicken in a rich, creamy tomato curry sauce.",
    images: [
      "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 30,
    cookTime: 40,
    servings: 6,
    difficulty: "medium",
    cuisine: "Indian",
    dietaryTags: ["gluten-free"],
    ingredients: [
      { name: "Chicken breast", amount: 800, unit: "g", notes: "cubed" },
      { name: "Yogurt", amount: 200, unit: "ml" },
      { name: "Tomato puree", amount: 400, unit: "ml" },
      { name: "Heavy cream", amount: 200, unit: "ml" },
      { name: "Garam masala", amount: 2, unit: "tsp" },
      { name: "Ginger", amount: 2, unit: "tbsp", notes: "grated" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description: "Marinate chicken in yogurt and spices for 30 minutes.",
      },
      { stepNumber: 2, description: "Cook chicken until golden." },
      {
        stepNumber: 3,
        description: "Sauté onions, add spices and tomato puree.",
      },
      {
        stepNumber: 4,
        description: "Add chicken and cream, simmer 10 minutes.",
      },
    ],
    nutrition: { calories: 380, protein: 32, carbs: 15, fat: 22, fiber: 3 },
  },
  {
    title: "Fresh Garden Salad",
    description: "Crisp mixed greens with fresh vegetables and vinaigrette.",
    images: [
      "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    difficulty: "easy",
    cuisine: "American",
    dietaryTags: ["vegetarian", "gluten-free", "vegan"],
    ingredients: [
      { name: "Mixed greens", amount: 200, unit: "g" },
      { name: "Cucumber", amount: 1, unit: "piece" },
      { name: "Tomatoes", amount: 2, unit: "piece" },
      { name: "Olive oil", amount: 3, unit: "tbsp" },
      { name: "Vinegar", amount: 1, unit: "tbsp" },
    ],
    instructions: [
      { stepNumber: 1, description: "Wash and dry all greens." },
      { stepNumber: 2, description: "Combine vegetables in bowl." },
      { stepNumber: 3, description: "Whisk dressing ingredients." },
      { stepNumber: 4, description: "Toss salad with dressing and serve." },
    ],
    nutrition: { calories: 120, protein: 3, carbs: 8, fat: 9, fiber: 2 },
  },
  {
    title: "Homemade Chocolate Chip Cookies",
    description: "Classic cookies with crispy edges and chewy centers.",
    images: [
      "https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 20,
    cookTime: 12,
    servings: 24,
    difficulty: "easy",
    cuisine: "American",
    dietaryTags: ["vegetarian"],
    ingredients: [
      { name: "Flour", amount: 280, unit: "g" },
      { name: "Butter", amount: 200, unit: "g" },
      { name: "Brown sugar", amount: 150, unit: "g" },
      { name: "Eggs", amount: 2, unit: "piece" },
      { name: "Chocolate chips", amount: 300, unit: "g" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description: "Preheat oven to 375°F. Line baking sheets.",
      },
      { stepNumber: 2, description: "Cream butter and sugars." },
      { stepNumber: 3, description: "Beat in eggs and vanilla." },
      {
        stepNumber: 4,
        description: "Mix in dry ingredients and chocolate chips.",
      },
      { stepNumber: 5, description: "Bake 10-12 minutes until golden." },
    ],
    nutrition: { calories: 160, protein: 2, carbs: 20, fat: 8, fiber: 1 },
  },
  {
    title: "Authentic Pad Thai",
    description: "Traditional Thai stir-fried noodles with shrimp and peanuts.",
    images: [
      "https://images.pexels.com/photos/4393426/pexels-photo-4393426.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 25,
    cookTime: 10,
    servings: 4,
    difficulty: "medium",
    cuisine: "Thai",
    dietaryTags: [],
    ingredients: [
      { name: "Rice noodles", amount: 200, unit: "g" },
      { name: "Shrimp", amount: 300, unit: "g" },
      { name: "Tofu", amount: 200, unit: "g" },
      { name: "Bean sprouts", amount: 100, unit: "g" },
      { name: "Tamarind paste", amount: 2, unit: "tbsp" },
      { name: "Peanuts", amount: 50, unit: "g" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description: "Soak noodles in warm water for 20 minutes.",
      },
      { stepNumber: 2, description: "Mix sauce ingredients." },
      { stepNumber: 3, description: "Stir-fry shrimp and tofu." },
      {
        stepNumber: 4,
        description: "Add noodles and sauce, toss everything together.",
      },
    ],
    nutrition: { calories: 420, protein: 28, carbs: 52, fat: 14, fiber: 3 },
  },
  {
    title: "Beef Tacos with Fresh Salsa",
    description: "Seasoned ground beef tacos with homemade pico de gallo.",
    images: [
      "https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 20,
    cookTime: 15,
    servings: 6,
    difficulty: "easy",
    cuisine: "Mexican",
    dietaryTags: ["gluten-free"],
    ingredients: [
      { name: "Ground beef", amount: 500, unit: "g" },
      { name: "Taco seasoning", amount: 2, unit: "tbsp" },
      { name: "Corn tortillas", amount: 12, unit: "piece" },
      { name: "Tomatoes", amount: 3, unit: "piece", notes: "diced" },
      { name: "Onion", amount: 1, unit: "piece", notes: "diced" },
      { name: "Cilantro", amount: 0.5, unit: "cup", notes: "chopped" },
      { name: "Lime", amount: 2, unit: "piece" },
    ],
    instructions: [
      { stepNumber: 1, description: "Brown ground beef with taco seasoning." },
      {
        stepNumber: 2,
        description: "Mix tomatoes, onion, cilantro, and lime juice for salsa.",
      },
      { stepNumber: 3, description: "Warm tortillas in a dry skillet." },
      {
        stepNumber: 4,
        description: "Assemble tacos with beef and fresh salsa.",
      },
    ],
    nutrition: { calories: 340, protein: 22, carbs: 28, fat: 16, fiber: 4 },
  },
  {
    title: "Creamy Mushroom Risotto",
    description: "Rich and creamy Italian rice dish with wild mushrooms.",
    images: [
      "https://images.pexels.com/photos/8753657/pexels-photo-8753657.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 10,
    cookTime: 35,
    servings: 4,
    difficulty: "medium",
    cuisine: "Italian",
    dietaryTags: ["vegetarian", "gluten-free"],
    ingredients: [
      { name: "Arborio rice", amount: 300, unit: "g" },
      { name: "Mixed mushrooms", amount: 400, unit: "g", notes: "sliced" },
      { name: "Vegetable stock", amount: 1, unit: "l" },
      { name: "White wine", amount: 150, unit: "ml" },
      { name: "Parmesan", amount: 100, unit: "g", notes: "grated" },
      { name: "Butter", amount: 50, unit: "g" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description: "Sauté mushrooms until golden, set aside.",
      },
      { stepNumber: 2, description: "Toast rice in butter, add wine." },
      {
        stepNumber: 3,
        description: "Add stock gradually, stirring constantly.",
      },
      { stepNumber: 4, description: "Stir in mushrooms and parmesan." },
    ],
    nutrition: { calories: 450, protein: 14, carbs: 68, fat: 12, fiber: 3 },
  },
  {
    title: "Grilled Salmon with Lemon Butter",
    description:
      "Perfectly grilled salmon fillet with herb lemon butter sauce.",
    images: [
      "https://images.pexels.com/photos/3296287/pexels-photo-3296287.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: "easy",
    cuisine: "American",
    dietaryTags: ["gluten-free", "keto"],
    ingredients: [
      { name: "Salmon fillets", amount: 4, unit: "piece" },
      { name: "Butter", amount: 60, unit: "g" },
      { name: "Lemon", amount: 2, unit: "piece" },
      { name: "Fresh dill", amount: 2, unit: "tbsp", notes: "chopped" },
      { name: "Garlic", amount: 2, unit: "clove", notes: "minced" },
    ],
    instructions: [
      { stepNumber: 1, description: "Season salmon with salt and pepper." },
      { stepNumber: 2, description: "Grill salmon 6-8 minutes per side." },
      {
        stepNumber: 3,
        description: "Melt butter with lemon juice, dill, and garlic.",
      },
      {
        stepNumber: 4,
        description: "Drizzle lemon butter over grilled salmon.",
      },
    ],
    nutrition: { calories: 380, protein: 34, carbs: 2, fat: 26, fiber: 0 },
  },
  {
    title: "Classic Margherita Pizza",
    description:
      "Traditional Italian pizza with fresh mozzarella, basil, and tomato sauce.",
    images: [
      "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 90,
    cookTime: 12,
    servings: 4,
    difficulty: "medium",
    cuisine: "Italian",
    dietaryTags: ["vegetarian"],
    ingredients: [
      { name: "Pizza dough", amount: 500, unit: "g" },
      { name: "Tomato sauce", amount: 200, unit: "ml" },
      { name: "Fresh mozzarella", amount: 250, unit: "g", notes: "sliced" },
      { name: "Fresh basil", amount: 1, unit: "cup", notes: "fresh leaves" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
    ],
    instructions: [
      { stepNumber: 1, description: "Preheat oven to 475°F with pizza stone." },
      { stepNumber: 2, description: "Roll out dough and spread tomato sauce." },
      { stepNumber: 3, description: "Add mozzarella slices evenly." },
      {
        stepNumber: 4,
        description: "Bake 10-12 minutes, top with fresh basil.",
      },
    ],
    nutrition: { calories: 420, protein: 18, carbs: 52, fat: 16, fiber: 3 },
  },
  {
    title: "Chocolate Lava Cake",
    description: "Decadent molten chocolate cake with a gooey center.",
    images: [
      "https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    difficulty: "medium",
    cuisine: "French",
    dietaryTags: ["vegetarian"],
    ingredients: [
      { name: "Dark chocolate", amount: 200, unit: "g" },
      { name: "Butter", amount: 100, unit: "g" },
      { name: "Eggs", amount: 2, unit: "piece" },
      { name: "Egg yolks", amount: 2, unit: "piece" },
      { name: "Sugar", amount: 60, unit: "g" },
      { name: "Flour", amount: 40, unit: "g" },
    ],
    instructions: [
      { stepNumber: 1, description: "Melt chocolate and butter together." },
      {
        stepNumber: 2,
        description: "Whisk eggs, yolks, and sugar until thick.",
      },
      { stepNumber: 3, description: "Fold in chocolate mixture and flour." },
      {
        stepNumber: 4,
        description: "Bake at 425°F for 12 minutes until edges are set.",
      },
    ],
    nutrition: { calories: 480, protein: 8, carbs: 42, fat: 32, fiber: 3 },
  },
];

// Enhanced seeding function
const seedEnhancedData = async () => {
  try {
    console.log("🌱 Starting enhanced database seeding...");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/recipe-app"
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Recipe.deleteMany({}),
      Review.deleteMany({}),
      Collection.deleteMany({}),
      MealPlan.deleteMany({}),
      ShoppingList.deleteMany({}),
    ]);
    console.log("✅ Cleared existing data");

    // Create users with hashed passwords
    console.log("\n👥 Creating users...");
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword };
      })
    );

    const users = await User.create(hashedUsers);
    console.log(`✅ Created ${users.length} users`);

    // Create recipes
    console.log("\n🍳 Creating recipes...");
    const recipesWithAuthors = recipesData.map((recipe, index) => ({
      ...recipe,
      author: users[index % users.length]._id,
    }));

    const recipes = await Recipe.create(recipesWithAuthors);
    console.log(`✅ Created ${recipes.length} recipes`);

    // Create reviews
    console.log("\n⭐ Creating reviews...");
    const reviews = [];
    recipes.forEach((recipe, recipeIndex) => {
      const numReviews = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < numReviews; i++) {
        const userIndex = (recipeIndex + i) % users.length;
        reviews.push({
          recipe: recipe._id,
          user: users[userIndex]._id,
          rating: Math.floor(Math.random() * 2) + 4,
          comment: "This recipe was amazing! Highly recommended.",
        });
      }
    });

    const createdReviews = await Review.create(reviews);
    console.log(`✅ Created ${createdReviews.length} reviews`);

    // Update recipe ratings
    for (const recipe of recipes) {
      const recipeReviews = createdReviews.filter(
        (r) => r.recipe.toString() === recipe._id.toString()
      );
      const avgRating =
        recipeReviews.reduce((sum, r) => sum + r.rating, 0) /
        recipeReviews.length;

      await Recipe.findByIdAndUpdate(recipe._id, {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: recipeReviews.length,
      });
    }

    // Create follow relationships
    console.log("\n🔗 Creating follow relationships...");
    await User.findByIdAndUpdate(users[0]._id, {
      following: [users[1]._id, users[2]._id, users[3]._id],
    });
    await User.findByIdAndUpdate(users[1]._id, {
      followers: [users[0]._id],
      following: [users[0]._id, users[2]._id],
    });
    await User.findByIdAndUpdate(users[2]._id, {
      followers: [users[0]._id, users[1]._id],
      following: [users[0]._id],
    });
    await User.findByIdAndUpdate(users[3]._id, {
      followers: [users[0]._id],
      following: [users[1]._id, users[4]._id],
    });
    await User.findByIdAndUpdate(users[4]._id, {
      followers: [users[3]._id],
      following: [users[2]._id],
    });
    console.log("✅ Created follow relationships");

    // Create collections
    console.log("\n📚 Creating collections...");
    const collections = [
      {
        name: "Italian Favorites",
        description: "My go-to Italian recipes",
        user: users[0]._id,
        recipes: recipes
          .filter((r) => r.cuisine === "Italian")
          .map((r) => r._id),
        isPublic: true,
      },
      {
        name: "Quick Weeknight Meals",
        description: "Easy recipes for busy nights",
        user: users[0]._id,
        recipes: recipes
          .filter((r) => r.difficulty === "easy")
          .slice(0, 3)
          .map((r) => r._id),
        isPublic: true,
      },
      {
        name: "Healthy Options",
        description: "Nutritious and delicious",
        user: users[1]._id,
        recipes: recipes
          .filter((r) => r.dietaryTags.includes("vegetarian"))
          .map((r) => r._id),
        isPublic: true,
      },
      {
        name: "Asian Cuisine",
        description: "Best Asian recipes",
        user: users[3]._id,
        recipes: recipes
          .filter((r) => r.cuisine === "Thai" || r.cuisine === "Indian")
          .map((r) => r._id),
        isPublic: true,
      },
    ];

    const createdCollections = await Collection.create(collections);
    console.log(`✅ Created ${createdCollections.length} collections`);

    // Create meal plans
    console.log("\n📅 Creating meal plans...");
    const today = new Date();
    const mealPlans = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      mealPlans.push({
        user: users[0]._id,
        date: date,
        meals: {
          breakfast: i % 2 === 0 ? recipes[i % recipes.length]._id : undefined,
          lunch: recipes[(i + 1) % recipes.length]._id,
          dinner: recipes[(i + 2) % recipes.length]._id,
        },
      });
    }

    const createdMealPlans = await MealPlan.create(mealPlans);
    console.log(`✅ Created ${createdMealPlans.length} meal plans`);

    // Create shopping lists
    console.log("\n🛒 Creating shopping lists...");
    const shoppingLists = [
      {
        user: users[0]._id,
        items: [
          {
            ingredient: "Tomatoes",
            amount: 5,
            unit: "piece",
            checked: false,
            category: "produce",
          },
          {
            ingredient: "Milk",
            amount: 1,
            unit: "l",
            checked: true,
            category: "dairy",
          },
          {
            ingredient: "Chicken breast",
            amount: 500,
            unit: "g",
            checked: false,
            category: "meat",
          },
          {
            ingredient: "Pasta",
            amount: 500,
            unit: "g",
            checked: false,
            category: "pantry",
          },
        ],
      },
    ];

    const createdShoppingLists = await ShoppingList.create(shoppingLists);
    console.log(`✅ Created ${createdShoppingLists.length} shopping lists`);

    // Add favorites
    console.log("\n❤️ Adding favorite recipes...");
    await User.findByIdAndUpdate(users[0]._id, {
      favoriteRecipes: recipes.slice(0, 3).map((r) => r._id),
    });
    await User.findByIdAndUpdate(users[1]._id, {
      favoriteRecipes: recipes.slice(1, 4).map((r) => r._id),
    });
    console.log("✅ Added favorite recipes");

    console.log("\n🎉 Enhanced database seeding complete!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Recipes: ${recipes.length}`);
    console.log(`   - Reviews: ${createdReviews.length}`);
    console.log(`   - Collections: ${createdCollections.length}`);
    console.log(`   - Meal Plans: ${createdMealPlans.length}`);
    console.log(`   - Shopping Lists: ${createdShoppingLists.length}`);

    console.log("\n🔐 Test User Credentials:");
    console.log("   Email: john@example.com | Password: password123");
    console.log("   Email: jane@example.com | Password: password123");
    console.log("   Email: mario@example.com | Password: password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEnhancedData();
}

export default seedEnhancedData;
