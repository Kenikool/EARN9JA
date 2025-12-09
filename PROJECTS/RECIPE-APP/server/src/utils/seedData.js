import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";
import dotenv from "dotenv";

dotenv.config();

// Sample user data
const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "user",
    bio: "Passionate home cook and recipe enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "user",
    bio: "Culinary expert and food blogger",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Chef Mario",
    email: "mario@example.com",
    password: "password123",
    role: "user",
    bio: "Professional chef with 10+ years experience",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Lisa Chen",
    email: "lisa@example.com",
    password: "password123",
    role: "user",
    bio: "Asian cuisine specialist",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    password: "password123",
    role: "user",
    bio: "Mediterranean cooking enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
];

// Sample recipe data
const recipes = [
  {
    title: "Classic Italian Spaghetti Carbonara",
    description:
      "Authentic Italian carbonara with eggs, pancetta, and Pecorino Romano cheese. Simple ingredients, incredible flavor.",
    images: [
      "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop",
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
      { name: "Eggs", amount: 4, unit: "piece", notes: "large" },
      {
        name: "Pecorino Romano",
        amount: 100,
        unit: "g",
        notes: "freshly grated",
      },
      { name: "Black pepper", amount: 1, unit: "tsp", notes: "freshly ground" },
      { name: "Salt", amount: 1, unit: "tsp", notes: "to taste" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.",
      },
      {
        stepNumber: 2,
        description:
          "In a large bowl, whisk together eggs, grated cheese, and pepper until smooth.",
      },
      {
        stepNumber: 3,
        description:
          "In a large skillet, cook pancetta over medium heat until crispy, about 5-7 minutes.",
      },
      {
        stepNumber: 4,
        description:
          "Reserve 1 cup pasta water, then drain spaghetti and add to the skillet with pancetta.",
      },
      {
        stepNumber: 5,
        description:
          "Remove from heat and quickly toss with egg mixture, adding pasta water as needed to create a creamy sauce.",
      },
      {
        stepNumber: 6,
        description: "Serve immediately with extra cheese and pepper.",
      },
    ],
    nutrition: { calories: 520, protein: 25, carbs: 65, fat: 18, fiber: 3 },
  },
  {
    title: "Perfect Chicken Tikka Masala",
    description:
      "Tender chicken pieces in a rich, creamy tomato-based curry sauce with authentic Indian spices.",
    images: [
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&h=600&fit=crop",
    ],
    prepTime: 30,
    cookTime: 40,
    servings: 6,
    difficulty: "medium",
    cuisine: "Indian",
    dietaryTags: ["gluten-free"],
    ingredients: [
      {
        name: "Chicken breast",
        amount: 800,
        unit: "g",
        notes: "cut into cubes",
      },
      { name: "Yogurt", amount: 200, unit: "ml" },
      { name: "Onion", amount: 1, unit: "piece", notes: "large, diced" },
      { name: "Tomato puree", amount: 400, unit: "ml", notes: "canned" },
      { name: "Heavy cream", amount: 200, unit: "ml" },
      { name: "Garam masala", amount: 2, unit: "tsp" },
      { name: "Cumin powder", amount: 1, unit: "tsp" },
      { name: "Coriander powder", amount: 1, unit: "tsp" },
      { name: "Turmeric", amount: 0.5, unit: "tsp" },
      { name: "Ginger", amount: 2, unit: "tbsp", notes: "fresh, grated" },
      { name: "Garlic", amount: 4, unit: "clove", notes: "minced" },
      { name: "Salt", amount: 1, unit: "tsp", notes: "to taste" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "Marinate chicken in yogurt, half the spices, ginger, and garlic for at least 30 minutes.",
      },
      {
        stepNumber: 2,
        description:
          "In a large skillet, heat oil and cook chicken until golden and cooked through. Set aside.",
      },
      {
        stepNumber: 3,
        description: "In the same pan, sauté onions until golden brown.",
      },
      {
        stepNumber: 4,
        description:
          "Add remaining spices and cook for 1 minute until fragrant.",
      },
      {
        stepNumber: 5,
        description: "Add tomato puree and simmer for 10 minutes.",
      },
      {
        stepNumber: 6,
        description:
          "Return chicken to pan, add cream, and simmer for 10 minutes.",
      },
      {
        stepNumber: 7,
        description: "Adjust seasoning and serve with basmati rice or naan.",
      },
    ],
    nutrition: { calories: 380, protein: 32, carbs: 15, fat: 22, fiber: 3 },
  },
  {
    title: "Fresh Garden Salad",
    description:
      "Crisp mixed greens with fresh vegetables, topped with a homemade vinaigrette dressing.",
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
    ],
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    difficulty: "easy",
    cuisine: "American",
    dietaryTags: ["vegetarian", "gluten-free"],
    ingredients: [
      { name: "Mixed salad greens", amount: 200, unit: "g" },
      { name: "Cucumber", amount: 1, unit: "piece", notes: "sliced" },
      { name: "Tomatoes", amount: 2, unit: "piece", notes: "cherry, halved" },
      { name: "Red onion", amount: 0.5, unit: "piece", notes: "thinly sliced" },
      { name: "Olive oil", amount: 3, unit: "tbsp" },
      { name: "Red wine vinegar", amount: 1, unit: "tbsp" },
      { name: "Dijon mustard", amount: 1, unit: "tsp" },
      { name: "Honey", amount: 1, unit: "tsp" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
      { name: "Black pepper", amount: 0.25, unit: "tsp" },
      {
        name: "Feta cheese",
        amount: 50,
        unit: "g",
        notes: "crumbled (optional)",
      },
    ],
    instructions: [
      {
        stepNumber: 1,
        description: "Wash and dry all salad greens thoroughly.",
      },
      {
        stepNumber: 2,
        description:
          "In a large salad bowl, combine mixed greens, cucumber, tomatoes, and red onion.",
      },
      {
        stepNumber: 3,
        description:
          "In a small bowl, whisk together olive oil, red wine vinegar, Dijon mustard, honey, salt, and pepper.",
      },
      {
        stepNumber: 4,
        description: "Drizzle dressing over salad and toss gently.",
      },
      {
        stepNumber: 5,
        description:
          "Top with crumbled feta cheese if desired and serve immediately.",
      },
    ],
    nutrition: { calories: 120, protein: 3, carbs: 8, fat: 9, fiber: 2 },
  },
  {
    title: "Homemade Chocolate Chip Cookies",
    description:
      "Classic chocolate chip cookies with crispy edges and chewy centers. Perfect for any occasion.",
    images: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop",
    ],
    prepTime: 20,
    cookTime: 12,
    servings: 24,
    difficulty: "easy",
    cuisine: "American",
    dietaryTags: ["vegetarian"],
    ingredients: [
      { name: "All-purpose flour", amount: 280, unit: "g" },
      { name: "Butter", amount: 200, unit: "g", notes: "softened" },
      { name: "Brown sugar", amount: 150, unit: "g" },
      { name: "White sugar", amount: 100, unit: "g" },
      { name: "Eggs", amount: 2, unit: "piece", notes: "large" },
      { name: "Vanilla extract", amount: 1, unit: "tsp" },
      { name: "Baking soda", amount: 1, unit: "tsp" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
      { name: "Chocolate chips", amount: 300, unit: "g" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.",
      },
      {
        stepNumber: 2,
        description:
          "Cream together butter and both sugars until light and fluffy.",
      },
      {
        stepNumber: 3,
        description: "Beat in eggs one at a time, then vanilla extract.",
      },
      {
        stepNumber: 4,
        description:
          "In separate bowl, whisk together flour, baking soda, and salt.",
      },
      {
        stepNumber: 5,
        description: "Gradually mix dry ingredients into wet ingredients.",
      },
      { stepNumber: 6, description: "Fold in chocolate chips." },
      {
        stepNumber: 7,
        description:
          "Drop rounded tablespoons of dough onto prepared baking sheets.",
      },
      {
        stepNumber: 8,
        description: "Bake for 10-12 minutes until golden brown around edges.",
      },
      {
        stepNumber: 9,
        description:
          "Cool on baking sheet for 5 minutes before transferring to wire rack.",
      },
    ],
    nutrition: { calories: 160, protein: 2, carbs: 20, fat: 8, fiber: 1 },
  },
  {
    title: "Authentic Pad Thai",
    description:
      "Traditional Thai stir-fried rice noodles with shrimp, tofu, bean sprouts, and peanuts in a sweet and sour sauce.",
    images: [
      "https://images.unsplash.com/photo-1559847844-5315695dada1?w=800&h=600&fit=crop",
    ],
    prepTime: 25,
    cookTime: 10,
    servings: 4,
    difficulty: "medium",
    cuisine: "Thai",
    dietaryTags: [],
    ingredients: [
      {
        name: "Rice noodles",
        amount: 200,
        unit: "g",
        notes: "flat, medium width",
      },
      { name: "Shrimp", amount: 300, unit: "g", notes: "peeled and deveined" },
      { name: "Tofu", amount: 200, unit: "g", notes: "firm, cubed" },
      { name: "Bean sprouts", amount: 100, unit: "g" },
      { name: "Eggs", amount: 2, unit: "piece" },
      { name: "Garlic", amount: 3, unit: "clove", notes: "minced" },
      { name: "Tamarind paste", amount: 2, unit: "tbsp" },
      { name: "Fish sauce", amount: 2, unit: "tbsp" },
      { name: "Brown sugar", amount: 1, unit: "tbsp" },
      { name: "Peanuts", amount: 50, unit: "g", notes: "crushed" },
      { name: "Lime", amount: 1, unit: "piece", notes: "juiced" },
      { name: "Green onions", amount: 3, unit: "piece", notes: "sliced" },
      { name: "Oil", amount: 2, unit: "tbsp" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "Soak rice noodles in warm water for 20 minutes, then drain.",
      },
      {
        stepNumber: 2,
        description:
          "In a small bowl, mix tamarind paste, fish sauce, and brown sugar to make sauce.",
      },
      {
        stepNumber: 3,
        description: "Heat oil in a large wok or skillet over high heat.",
      },
      {
        stepNumber: 4,
        description: "Add garlic and stir-fry for 30 seconds until fragrant.",
      },
      {
        stepNumber: 5,
        description:
          "Add shrimp and cook until pink, about 2 minutes. Remove and set aside.",
      },
      {
        stepNumber: 6,
        description:
          "Add tofu and cook until golden, about 3 minutes. Remove and set aside.",
      },
      {
        stepNumber: 7,
        description:
          "Push ingredients to one side, add beaten eggs to empty space.",
      },
      {
        stepNumber: 8,
        description: "Scramble eggs, then add noodles and sauce.",
      },
      {
        stepNumber: 9,
        description:
          "Add shrimp, tofu, bean sprouts, and toss everything together.",
      },
      {
        stepNumber: 10,
        description:
          "Garnish with crushed peanuts, green onions, and lime juice.",
      },
    ],
    nutrition: { calories: 420, protein: 28, carbs: 52, fat: 14, fiber: 3 },
  },
  {
    title: "Mediterranean Quinoa Bowl",
    description:
      "Nutritious quinoa bowl with fresh vegetables, chickpeas, and a zesty lemon-herb dressing.",
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    ],
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    difficulty: "easy",
    cuisine: "Mediterranean",
    dietaryTags: ["vegetarian", "gluten-free", "dairy-free"],
    ingredients: [
      { name: "Quinoa", amount: 200, unit: "g" },
      { name: "Chickpeas", amount: 400, unit: "g", notes: "canned, drained" },
      { name: "Cherry tomatoes", amount: 200, unit: "g", notes: "halved" },
      { name: "Cucumber", amount: 1, unit: "piece", notes: "diced" },
      { name: "Red onion", amount: 0.5, unit: "piece", notes: "finely diced" },
      { name: "Kalamata olives", amount: 100, unit: "g", notes: "pitted" },
      { name: "Fresh parsley", amount: 30, unit: "g", notes: "chopped" },
      { name: "Fresh mint", amount: 15, unit: "g", notes: "chopped" },
      { name: "Lemon", amount: 1, unit: "piece", notes: "juiced" },
      { name: "Olive oil", amount: 3, unit: "tbsp" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
      { name: "Black pepper", amount: 0.25, unit: "tsp" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "Rinse quinoa under cold water. Cook according to package directions.",
      },
      { stepNumber: 2, description: "Let quinoa cool to room temperature." },
      {
        stepNumber: 3,
        description:
          "In a large bowl, combine cooked quinoa, chickpeas, tomatoes, cucumber, and red onion.",
      },
      { stepNumber: 4, description: "Add olives, parsley, and mint." },
      {
        stepNumber: 5,
        description:
          "In a small bowl, whisk together lemon juice, olive oil, salt, and pepper.",
      },
      {
        stepNumber: 6,
        description: "Pour dressing over quinoa mixture and toss gently.",
      },
      { stepNumber: 7, description: "Taste and adjust seasoning as needed." },
      { stepNumber: 8, description: "Serve at room temperature or chilled." },
    ],
    nutrition: { calories: 320, protein: 12, carbs: 45, fat: 11, fiber: 8 },
  },
  {
    title: "Beef Tacos with Pico de Gallo",
    description:
      "Flavorful seasoned ground beef tacos topped with fresh pico de gallo and all your favorite toppings.",
    images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
    ],
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: "easy",
    cuisine: "Mexican",
    dietaryTags: [],
    ingredients: [
      { name: "Ground beef", amount: 500, unit: "g" },
      { name: "Taco seasoning", amount: 2, unit: "tbsp" },
      {
        name: "Tortillas",
        amount: 8,
        unit: "piece",
        notes: "small flour or corn",
      },
      { name: "Tomatoes", amount: 3, unit: "piece", notes: "diced" },
      { name: "Onion", amount: 1, unit: "piece", notes: "medium, diced" },
      { name: "Jalapeño", amount: 1, unit: "piece", notes: "minced" },
      { name: "Cilantro", amount: 30, unit: "g", notes: "chopped" },
      { name: "Lime", amount: 2, unit: "piece", notes: "juiced" },
      { name: "Lettuce", amount: 1, unit: "piece", notes: "shredded" },
      { name: "Cheddar cheese", amount: 100, unit: "g", notes: "shredded" },
      { name: "Sour cream", amount: 100, unit: "g", notes: "for serving" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "In a large skillet, cook ground beef over medium-high heat until browned.",
      },
      {
        stepNumber: 2,
        description:
          "Drain excess fat and add taco seasoning with a splash of water.",
      },
      { stepNumber: 3, description: "Simmer for 5 minutes until thickened." },
      {
        stepNumber: 4,
        description:
          "Meanwhile, prepare pico de gallo by combining diced tomatoes, onion, jalapeño, cilantro, and lime juice. Season with salt.",
      },
      {
        stepNumber: 5,
        description: "Warm tortillas according to package directions.",
      },
      { stepNumber: 6, description: "Fill each tortilla with seasoned beef." },
      {
        stepNumber: 7,
        description: "Top with pico de gallo, lettuce, cheese, and sour cream.",
      },
      { stepNumber: 8, description: "Serve immediately with lime wedges." },
    ],
    nutrition: { calories: 520, protein: 32, carbs: 35, fat: 28, fiber: 4 },
  },
  {
    title: "Creamy Mushroom Risotto",
    description:
      "Rich and creamy Italian risotto with mixed mushrooms, white wine, and Parmesan cheese.",
    images: [
      "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop",
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: "medium",
    cuisine: "Italian",
    dietaryTags: ["vegetarian", "gluten-free"],
    ingredients: [
      { name: "Arborio rice", amount: 320, unit: "g" },
      { name: "Mixed mushrooms", amount: 400, unit: "g", notes: "sliced" },
      { name: "White wine", amount: 150, unit: "ml" },
      { name: "Vegetable broth", amount: 1.2, unit: "l", notes: "warm" },
      { name: "Onion", amount: 1, unit: "piece", notes: "medium, diced" },
      { name: "Garlic", amount: 3, unit: "clove", notes: "minced" },
      { name: "Parmesan cheese", amount: 80, unit: "g", notes: "grated" },
      { name: "Butter", amount: 50, unit: "g" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
      { name: "Fresh thyme", amount: 1, unit: "tbsp", notes: "chopped" },
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Black pepper", amount: 0.5, unit: "tsp" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "Heat vegetable broth in a separate pot and keep warm over low heat.",
      },
      {
        stepNumber: 2,
        description:
          "In a large pan, heat olive oil and 25g butter over medium heat.",
      },
      {
        stepNumber: 3,
        description: "Add onion and cook until translucent, about 5 minutes.",
      },
      {
        stepNumber: 4,
        description: "Add garlic and cook for 1 minute until fragrant.",
      },
      {
        stepNumber: 5,
        description: "Add rice and stir for 2 minutes until lightly toasted.",
      },
      { stepNumber: 6, description: "Add wine and stir until absorbed." },
      {
        stepNumber: 7,
        description:
          "Add warm broth one ladle at a time, stirring constantly until absorbed.",
      },
      {
        stepNumber: 8,
        description:
          "Continue adding broth and stirring for 18-20 minutes until rice is creamy.",
      },
      {
        stepNumber: 9,
        description: "In a separate pan, sauté mushrooms until golden.",
      },
      {
        stepNumber: 10,
        description:
          "Stir in mushrooms, remaining butter, Parmesan, and thyme.",
      },
      {
        stepNumber: 11,
        description: "Season with salt and pepper. Serve immediately.",
      },
    ],
    nutrition: { calories: 450, protein: 15, carbs: 68, fat: 12, fiber: 3 },
  },
  {
    title: "Classic Caesar Salad",
    description:
      "Crisp romaine lettuce with homemade Caesar dressing, croutons, and shaved Parmesan cheese.",
    images: [
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop",
    ],
    prepTime: 20,
    cookTime: 10,
    servings: 4,
    difficulty: "easy",
    cuisine: "American",
    dietaryTags: ["vegetarian"],
    ingredients: [
      {
        name: "Romaine lettuce",
        amount: 2,
        unit: "piece",
        notes: "large heads, chopped",
      },
      { name: "Bread", amount: 4, unit: "slice", notes: "day-old, cubed" },
      { name: "Parmesan cheese", amount: 80, unit: "g", notes: "shaved" },
      { name: "Mayonnaise", amount: 4, unit: "tbsp" },
      { name: "Lemon juice", amount: 2, unit: "tbsp" },
      { name: "Worcestershire sauce", amount: 1, unit: "tsp" },
      { name: "Dijon mustard", amount: 1, unit: "tsp" },
      { name: "Garlic", amount: 2, unit: "clove", notes: "minced" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
      { name: "Butter", amount: 1, unit: "tbsp" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
      { name: "Black pepper", amount: 0.25, unit: "tsp" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description:
          "Wash and dry romaine lettuce thoroughly. Chop into bite-sized pieces.",
      },
      {
        stepNumber: 2,
        description:
          "In a small bowl, whisk together mayonnaise, lemon juice, Worcestershire sauce, Dijon mustard, and garlic.",
      },
      {
        stepNumber: 3,
        description: "Season dressing with salt and pepper to taste.",
      },
      {
        stepNumber: 4,
        description:
          "In a large skillet, heat olive oil and butter over medium heat.",
      },
      {
        stepNumber: 5,
        description: "Add bread cubes and toss to coat with oil mixture.",
      },
      {
        stepNumber: 6,
        description:
          "Cook, stirring frequently, until golden brown and crispy, about 8-10 minutes.",
      },
      {
        stepNumber: 7,
        description:
          "In a large bowl, toss lettuce with dressing until well coated.",
      },
      { stepNumber: 8, description: "Add croutons and toss gently." },
      {
        stepNumber: 9,
        description: "Top with shaved Parmesan cheese and serve immediately.",
      },
    ],
    nutrition: { calories: 280, protein: 8, carbs: 15, fat: 22, fiber: 4 },
  },
  {
    title: "Thai Green Curry",
    description:
      "Aromatic and spicy Thai green curry with chicken, vegetables, and creamy coconut milk.",
    images: [
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop",
    ],
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    difficulty: "medium",
    cuisine: "Thai",
    dietaryTags: ["gluten-free", "dairy-free"],
    ingredients: [
      {
        name: "Chicken breast",
        amount: 500,
        unit: "g",
        notes: "cut into strips",
      },
      { name: "Coconut milk", amount: 400, unit: "ml", notes: "canned" },
      { name: "Green curry paste", amount: 3, unit: "tbsp" },
      {
        name: "Bell peppers",
        amount: 2,
        unit: "piece",
        notes: "mixed colors, sliced",
      },
      { name: "Zucchini", amount: 1, unit: "piece", notes: "sliced" },
      { name: "Thai basil", amount: 30, unit: "g" },
      { name: "Fish sauce", amount: 2, unit: "tbsp" },
      { name: "Brown sugar", amount: 1, unit: "tbsp" },
      { name: "Lime", amount: 1, unit: "piece", notes: "juiced" },
      { name: "Oil", amount: 2, unit: "tbsp" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
    ],
    instructions: [
      {
        stepNumber: 1,
        description: "Heat oil in a large pan over medium-high heat.",
      },
      {
        stepNumber: 2,
        description: "Add curry paste and fry for 1-2 minutes until fragrant.",
      },
      {
        stepNumber: 3,
        description:
          "Add half the coconut milk and stir to combine with curry paste.",
      },
      {
        stepNumber: 4,
        description:
          "Add chicken and cook until no longer pink, about 5 minutes.",
      },
      {
        stepNumber: 5,
        description: "Add remaining coconut milk, bell peppers, and zucchini.",
      },
      {
        stepNumber: 6,
        description:
          "Bring to a simmer and cook for 10 minutes until vegetables are tender.",
      },
      {
        stepNumber: 7,
        description: "Season with fish sauce, brown sugar, and salt.",
      },
      { stepNumber: 8, description: "Stir in lime juice and Thai basil." },
      { stepNumber: 9, description: "Taste and adjust seasoning as needed." },
      { stepNumber: 10, description: "Serve hot with jasmine rice." },
    ],
    nutrition: { calories: 420, protein: 35, carbs: 18, fat: 24, fiber: 3 },
  },
];

// Sample review data
const generateReviews = (recipes, users) => {
  const reviewTemplates = [
    "This recipe was absolutely delicious! I followed it exactly and it turned out perfect.",
    "Great recipe! My family loved it. Will definitely make again.",
    "Easy to follow and amazing results. Thanks for sharing!",
    "This was my first time making this dish and it was a huge success!",
    "Fantastic! The flavors were incredible. Highly recommended.",
    "Good recipe but I added some extra spices to make it my own.",
    "Turned out great! Everyone at dinner asked for the recipe.",
    "Perfect timing and instructions. Can't wait to try more recipes from this cook!",
    "Amazing! This will definitely be in my regular rotation.",
    "Delicious and easy to make. Great for weeknight dinners.",
  ];

  const reviews = [];

  recipes.forEach((recipe, recipeIndex) => {
    const numReviews = Math.floor(Math.random() * 5) + 2; // 2-6 reviews per recipe

    for (let i = 0; i < numReviews; i++) {
      const userIndex = (recipeIndex + i) % users.length;
      const review = {
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment:
          reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)],
        recipe: recipe._id,
        user: users[userIndex]._id,
      };
      reviews.push(review);
    }
  });

  return reviews;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/recipe-app"
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Recipe.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log("🗑️ Cleared existing data");

    // Create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    const createdUsers = await User.create(hashedUsers);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create recipes with random authors
    const recipesWithAuthors = recipes.map((recipe, index) => {
      const randomAuthor = createdUsers[index % createdUsers.length];
      return {
        ...recipe,
        author: randomAuthor._id,
      };
    });

    const createdRecipes = await Recipe.create(recipesWithAuthors);
    console.log(`🍳 Created ${createdRecipes.length} recipes`);

    // Update recipe average ratings
    const allRecipes = await Recipe.find({}).populate("author");

    // Generate reviews
    const reviews = generateReviews(allRecipes, createdUsers);
    const createdReviews = await Review.create(reviews);
    console.log(`⭐ Created ${createdReviews.length} reviews`);

    // Update recipe ratings and review counts
    for (const recipe of allRecipes) {
      const recipeReviews = createdReviews.filter(
        (r) => r.recipe.toString() === recipe._id.toString()
      );
      const averageRating =
        recipeReviews.reduce((sum, r) => sum + r.rating, 0) /
        recipeReviews.length;

      await Recipe.findByIdAndUpdate(recipe._id, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: recipeReviews.length,
      });
    }

    console.log("🎉 Database seeded successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Recipes: ${allRecipes.length}`);
    console.log(`   - Reviews: ${createdReviews.length}`);

    // Display sample data
    console.log("\n📝 Sample Users:");
    createdUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    console.log("\n🍽️ Sample Recipes:");
    allRecipes.forEach((recipe, index) => {
      const author = createdUsers.find(
        (u) => u._id.toString() === recipe.author._id.toString()
      );
      console.log(`   ${index + 1}. ${recipe.title} by ${author.name}`);
      console.log(
        `      Rating: ${recipe.averageRating}/5 (${recipe.totalReviews} reviews)`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
};

export default seedDatabase;
