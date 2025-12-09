import MealPlan from "../models/MealPlan.js";
import Recipe from "../models/Recipe.js";

// Get user's meal plans
export const getUserMealPlans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const mealPlans = await MealPlan.find({ user: req.user._id })
      .populate(
        "meals.breakfast",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.lunch",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.dinner",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.snacks.recipe",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MealPlan.countDocuments({ user: req.user._id });

    res.status(200).json({
      status: "success",
      results: mealPlans.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMealPlans: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: mealPlans,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single meal plan
export const getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
      .populate(
        "meals.breakfast",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.lunch",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.dinner",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.snacks.recipe",
        "title slug images prepTime cookTime servings difficulty cuisine"
      );

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

    res.status(200).json({
      status: "success",
      data: mealPlan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create meal plan
export const createMealPlan = async (req, res) => {
  try {
    const { date, meals } = req.body;

    // Check if user already has a meal plan for this date
    const existingMealPlan = await MealPlan.findOne({
      user: req.user._id,
      date: new Date(date),
    });

    if (existingMealPlan) {
      return res.status(400).json({
        message: "You already have a meal plan for this date",
      });
    }

    // Validate that recipes exist
    const recipeIds = [];
    if (meals.breakfast) recipeIds.push(meals.breakfast);
    if (meals.lunch) recipeIds.push(meals.lunch);
    if (meals.dinner) recipeIds.push(meals.dinner);
    if (meals.snacks) {
      meals.snacks.forEach((snack) => recipeIds.push(snack.recipe));
    }

    if (recipeIds.length > 0) {
      const existingRecipes = await Recipe.find({ _id: { $in: recipeIds } });
      if (existingRecipes.length !== recipeIds.length) {
        return res.status(400).json({
          message: "One or more recipes not found",
        });
      }
    }

    const mealPlan = await MealPlan.create({
      user: req.user._id,
      date,
      meals,
    });

    await mealPlan.populate(
      "meals.breakfast",
      "title slug images prepTime cookTime servings difficulty cuisine"
    );
    await mealPlan.populate(
      "meals.lunch",
      "title slug images prepTime cookTime servings difficulty cuisine"
    );
    await mealPlan.populate(
      "meals.dinner",
      "title slug images prepTime cookTime servings difficulty cuisine"
    );
    await mealPlan.populate(
      "meals.snacks.recipe",
      "title slug images prepTime cookTime servings difficulty cuisine"
    );

    res.status(201).json({
      status: "success",
      data: mealPlan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update meal plan
export const updateMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        message: "Meal plan not found",
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this meal plan",
      });
    }

    // Validate recipes if meals are being updated
    if (req.body.meals) {
      const recipeIds = [];
      const { meals } = req.body;

      if (meals.breakfast) recipeIds.push(meals.breakfast);
      if (meals.lunch) recipeIds.push(meals.lunch);
      if (meals.dinner) recipeIds.push(meals.dinner);
      if (meals.snacks) {
        meals.snacks.forEach((snack) => recipeIds.push(snack.recipe));
      }

      if (recipeIds.length > 0) {
        const existingRecipes = await Recipe.find({ _id: { $in: recipeIds } });
        if (existingRecipes.length !== recipeIds.length) {
          return res.status(400).json({
            message: "One or more recipes not found",
          });
        }
      }
    }

    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "meals.breakfast",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.lunch",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.dinner",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.snacks.recipe",
        "title slug images prepTime cookTime servings difficulty cuisine"
      );

    res.status(200).json({
      status: "success",
      data: updatedMealPlan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete meal plan
export const deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        message: "Meal plan not found",
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this meal plan",
      });
    }

    await MealPlan.findByIdAndDelete(req.params.id);

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

// Get meal plan for specific date
export const getMealPlanByDate = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      user: req.user._id,
      date: new Date(req.params.date),
    })
      .populate(
        "meals.breakfast",
        "title slug images prepTime cookTime servings difficulty cuisine ingredients"
      )
      .populate(
        "meals.lunch",
        "title slug images prepTime cookTime servings difficulty cuisine ingredients"
      )
      .populate(
        "meals.dinner",
        "title slug images prepTime cookTime servings difficulty cuisine ingredients"
      )
      .populate(
        "meals.snacks.recipe",
        "title slug images prepTime cookTime servings difficulty cuisine ingredients"
      );

    if (!mealPlan) {
      return res.status(404).json({
        message: "No meal plan found for this date",
      });
    }

    res.status(200).json({
      status: "success",
      data: mealPlan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get meal plans for date range
export const getMealPlansByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    const mealPlans = await MealPlan.find({
      user: req.user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate(
        "meals.breakfast",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.lunch",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.dinner",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .populate(
        "meals.snacks.recipe",
        "title slug images prepTime cookTime servings difficulty cuisine"
      )
      .sort({ date: 1 });

    res.status(200).json({
      status: "success",
      data: mealPlans,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Generate shopping list from meal plan
export const generateShoppingList = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
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
        const key = `${ingredient.name}-${ingredient.unit}`;
        if (ingredientMap.has(key)) {
          ingredientMap.set(key, {
            ...ingredientMap.get(key),
            amount: ingredientMap.get(key).amount + ingredient.amount,
          });
        } else {
          ingredientMap.set(key, { ...ingredient });
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

    const shoppingList = Array.from(ingredientMap.values());

    res.status(200).json({
      status: "success",
      data: {
        mealPlan: mealPlan.date,
        shoppingList,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
