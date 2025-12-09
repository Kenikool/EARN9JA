import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";

// Get all recipes with filtering, sorting, and pagination
export const getRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};

    // Search by title or description
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Filter by cuisine
    if (req.query.cuisine) {
      filter.cuisine = req.query.cuisine;
    }

    // Filter by difficulty
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    // Filter by dietary tags
    if (req.query.dietary) {
      filter.dietaryTags = req.query.dietary;
    }

    // Filter by author
    if (req.query.author) {
      filter.author = req.query.author;
    }

    // Build sort object
    let sort = {};
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    if (sortBy === "rating") {
      sort.averageRating = sortOrder;
    } else if (sortBy === "views") {
      sort.views = sortOrder;
    } else if (sortBy === "time") {
      sort.createdAt = sortOrder;
    } else {
      sort[sortBy] = sortOrder;
    }

    const recipes = await Recipe.find(filter)
      .populate("author", "name avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recipe.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: recipes.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecipes: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single recipe by slug
export const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug })
      .populate("author", "name avatar bio")
      .populate({
        path: "reviews",
        populate: { path: "user", select: "name avatar" },
      });

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // Increment view count
    await Recipe.findByIdAndUpdate(recipe._id, { $inc: { views: 1 } });

    res.status(200).json({
      status: "success",
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create new recipe
export const createRecipe = async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      author: req.user._id,
    };

    const recipe = await Recipe.create(recipeData);

    await recipe.populate("author", "name avatar");

    res.status(201).json({
      status: "success",
      data: recipe,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Recipe with this title already exists",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update recipe
export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // Check if user is the author or admin
    if (
      recipe.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to update this recipe",
      });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("author", "name avatar");

    res.status(200).json({
      status: "success",
      data: updatedRecipe,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete recipe
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // Check if user is the author or admin
    if (
      recipe.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this recipe",
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

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

// Get recipes by user
export const getUserRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ author: req.params.userId })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recipe.countDocuments({ author: req.params.userId });

    res.status(200).json({
      status: "success",
      results: recipes.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecipes: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user's favorite recipes
export const getFavoriteRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favoriteRecipes",
      populate: { path: "author", select: "name avatar" },
    });

    res.status(200).json({
      status: "success",
      data: user.favoriteRecipes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Add recipe to favorites
export const addToFavorites = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { favoriteRecipes: req.params.id },
    });

    res.status(200).json({
      status: "success",
      message: "Recipe added to favorites",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Remove recipe from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favoriteRecipes: req.params.id },
    });

    res.status(200).json({
      status: "success",
      message: "Recipe removed from favorites",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get popular recipes
export const getPopularRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recipes = await Recipe.find()
      .populate("author", "name avatar")
      .sort({ views: -1, averageRating: -1 })
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get recipes by cuisine
export const getRecipesByCuisine = async (req, res) => {
  try {
    const recipes = await Recipe.find({ cuisine: req.params.cuisine })
      .populate("author", "name avatar")
      .sort({ averageRating: -1, views: -1 })
      .limit(20);

    res.status(200).json({
      status: "success",
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
