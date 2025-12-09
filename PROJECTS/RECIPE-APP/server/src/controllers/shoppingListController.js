import ShoppingList from "../models/ShoppingList.js";
import Recipe from "../models/Recipe.js";
import MealPlan from "../models/MealPlan.js";

// Get user's shopping lists
export const getUserShoppingLists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const shoppingLists = await ShoppingList.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ShoppingList.countDocuments({ user: req.user._id });

    res.status(200).json({
      status: "success",
      results: shoppingLists.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalShoppingLists: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: shoppingLists,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single shopping list
export const getShoppingList = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        message: "Shopping list not found",
      });
    }

    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to access this shopping list",
      });
    }

    res.status(200).json({
      status: "success",
      data: shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create shopping list from recipes
export const createShoppingListFromRecipes = async (req, res) => {
  try {
    const { recipeIds, title } = req.body;

    console.log("Creating shopping list from recipes:", { recipeIds, title });

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      console.log("Invalid recipe IDs:", recipeIds);
      return res.status(400).json({
        message: "At least one recipe ID is required",
      });
    }

    // Validate recipes exist
    const recipes = await Recipe.find({ _id: { $in: recipeIds } });
    console.log(
      `Found ${recipes.length} recipes out of ${recipeIds.length} requested`
    );

    if (recipes.length !== recipeIds.length) {
      console.log(
        "Missing recipes. Found:",
        recipes.map((r) => r._id)
      );
      console.log("Requested:", recipeIds);
      return res.status(400).json({
        message: "One or more recipes not found",
      });
    }

    // Helper function to categorize ingredients
    const categorizeIngredient = (ingredientName) => {
      const name = ingredientName.toLowerCase();

      // Produce
      if (
        /(tomato|lettuce|onion|garlic|pepper|carrot|potato|cucumber|spinach|broccoli|cauliflower|cabbage|celery|mushroom|zucchini|eggplant|avocado|lemon|lime|apple|banana|orange|berry|fruit|vegetable)/i.test(
          name
        )
      ) {
        return "produce";
      }
      // Dairy
      if (
        /(milk|cream|cheese|butter|yogurt|sour cream|cottage cheese|mozzarella|parmesan|cheddar)/i.test(
          name
        )
      ) {
        return "dairy";
      }
      // Meat
      if (
        /(chicken|beef|pork|lamb|turkey|duck|bacon|sausage|ham|steak|ground beef|ground turkey)/i.test(
          name
        )
      ) {
        return "meat";
      }
      // Seafood
      if (
        /(fish|salmon|tuna|shrimp|crab|lobster|cod|tilapia|seafood)/i.test(name)
      ) {
        return "seafood";
      }
      // Bakery
      if (
        /(bread|bun|roll|bagel|croissant|muffin|tortilla|pita|naan)/i.test(name)
      ) {
        return "bakery";
      }
      // Pantry
      if (
        /(flour|sugar|salt|rice|pasta|oil|vinegar|sauce|stock|broth|beans|lentils|quinoa|oats|cereal)/i.test(
          name
        )
      ) {
        return "pantry";
      }
      // Spices
      if (
        /(spice|herb|pepper|paprika|cumin|coriander|cinnamon|nutmeg|ginger|turmeric|oregano|basil|thyme|rosemary|parsley|cilantro|dill|sage|bay leaf)/i.test(
          name
        )
      ) {
        return "spices";
      }
      // Frozen
      if (/(frozen|ice cream)/i.test(name)) {
        return "frozen";
      }
      // Beverages
      if (/(juice|soda|water|tea|coffee|wine|beer)/i.test(name)) {
        return "beverages";
      }

      return "other";
    };

    // Aggregate ingredients
    const ingredientMap = new Map();

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          ingredientMap.set(key, {
            ...existing,
            amount: existing.amount + ingredient.amount,
          });
        } else {
          ingredientMap.set(key, {
            ingredient: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            checked: false,
            category: categorizeIngredient(ingredient.name),
          });
        }
      });
    });

    const items = Array.from(ingredientMap.values());

    const shoppingList = await ShoppingList.create({
      user: req.user._id,
      title: title || `Shopping List - ${new Date().toLocaleDateString()}`,
      items,
      source: {
        type: "recipes",
        recipeIds,
      },
    });

    console.log("Shopping list created successfully:", shoppingList._id);

    res.status(201).json({
      status: "success",
      data: shoppingList,
    });
  } catch (error) {
    console.error("Error in createShoppingListFromRecipes:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create shopping list from meal plan
export const createShoppingListFromMealPlan = async (req, res) => {
  try {
    const { mealPlanId, title } = req.body;

    const mealPlan = await MealPlan.findById(mealPlanId)
      .populate("meals.breakfast", "ingredients")
      .populate("meals.lunch", "ingredients")
      .populate("meals.dinner", "ingredients")
      .populate("meals.snacks.recipe", "ingredients");

    if (!mealPlan) {
      return res.status(404).json({
        message: "Meal plan not found",
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to access this meal plan",
      });
    }

    // Aggregate ingredients from all meals
    const ingredientMap = new Map();

    const addIngredients = (ingredients) => {
      ingredients.forEach((ingredient) => {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          ingredientMap.set(key, {
            ...existing,
            amount: existing.amount + ingredient.amount,
          });
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            checked: false,
          });
        }
      });
    };

    if (mealPlan.meals.breakfast?.ingredients) {
      addIngredients(mealPlan.meals.breakfast.ingredients);
    }
    if (mealPlan.meals.lunch?.ingredients) {
      addIngredients(mealPlan.meals.lunch.ingredients);
    }
    if (mealPlan.meals.dinner?.ingredients) {
      addIngredients(mealPlan.meals.dinner.ingredients);
    }
    if (mealPlan.meals.snacks) {
      mealPlan.meals.snacks.forEach((snack) => {
        if (snack.recipe?.ingredients) {
          addIngredients(snack.recipe.ingredients);
        }
      });
    }

    const items = Array.from(ingredientMap.values());

    const shoppingList = await ShoppingList.create({
      user: req.user._id,
      title: title || `Shopping List - ${mealPlan.date.toLocaleDateString()}`,
      items,
      source: {
        type: "mealPlan",
        mealPlanId,
      },
    });

    res.status(201).json({
      status: "success",
      data: shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create custom shopping list
export const createCustomShoppingList = async (req, res) => {
  try {
    const { title, items } = req.body;

    if (!title || !items || !Array.isArray(items)) {
      return res.status(400).json({
        message: "Title and items array are required",
      });
    }

    // Validate items structure
    const validatedItems = items.map((item) => ({
      name: item.name,
      amount: item.amount || null,
      unit: item.unit || null,
      checked: false,
    }));

    const shoppingList = await ShoppingList.create({
      user: req.user._id,
      title,
      items: validatedItems,
      source: {
        type: "custom",
      },
    });

    res.status(201).json({
      status: "success",
      data: shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update shopping list
export const updateShoppingList = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        message: "Shopping list not found",
      });
    }

    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this shopping list",
      });
    }

    const updatedShoppingList = await ShoppingList.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: updatedShoppingList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete shopping list
export const deleteShoppingList = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        message: "Shopping list not found",
      });
    }

    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this shopping list",
      });
    }

    await ShoppingList.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update item checked status
export const updateItemStatus = async (req, res) => {
  try {
    const itemIndex = parseInt(req.params.itemIndex);
    const { checked } = req.body;

    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        message: "Shopping list not found",
      });
    }

    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this shopping list",
      });
    }

    if (
      isNaN(itemIndex) ||
      itemIndex < 0 ||
      itemIndex >= shoppingList.items.length
    ) {
      return res.status(400).json({
        message: "Invalid item index",
      });
    }

    shoppingList.items[itemIndex].checked = checked;
    await shoppingList.save();

    res.status(200).json({
      status: "success",
      data: shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Add item to shopping list
export const addItem = async (req, res) => {
  try {
    const { name, amount, unit } = req.body;

    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        message: "Shopping list not found",
      });
    }

    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this shopping list",
      });
    }

    shoppingList.items.push({
      name,
      amount: amount || null,
      unit: unit || null,
      checked: false,
    });

    await shoppingList.save();

    res.status(200).json({
      status: "success",
      data: shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Remove item from shopping list
export const removeItem = async (req, res) => {
  try {
    const { itemIndex } = req.body;

    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        message: "Shopping list not found",
      });
    }

    // Check if user owns the shopping list
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this shopping list",
      });
    }

    if (itemIndex < 0 || itemIndex >= shoppingList.items.length) {
      return res.status(400).json({
        message: "Invalid item index",
      });
    }

    shoppingList.items.splice(itemIndex, 1);
    await shoppingList.save();

    res.status(200).json({
      status: "success",
      data: shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
