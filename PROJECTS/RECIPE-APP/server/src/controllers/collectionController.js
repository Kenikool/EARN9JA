import Collection from "../models/Collection.js";
import Recipe from "../models/Recipe.js";

// Get all collections for current user
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user._id })
      .populate("recipes", "title slug images averageRating")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: collections.length,
      data: collections,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single collection
export const getCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate("user", "name avatar")
      .populate(
        "recipes",
        "title slug images averageRating prepTime cookTime difficulty"
      );

    if (!collection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    // Check if collection is public or belongs to user
    if (
      !collection.isPublic &&
      collection.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to view this collection",
      });
    }

    res.status(200).json({
      status: "success",
      data: collection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get public collections for a user
export const getUserCollections = async (req, res) => {
  try {
    const query = { user: req.params.userId, isPublic: true };

    // If viewing own collections, show all
    if (req.user && req.user._id.toString() === req.params.userId) {
      delete query.isPublic;
    }

    const collections = await Collection.find(query)
      .populate("recipes", "title slug images averageRating")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: collections.length,
      data: collections,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create new collection
export const createCollection = async (req, res) => {
  try {
    const { name, description, isPublic, coverImage } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Collection name is required",
      });
    }

    const collection = await Collection.create({
      name,
      description,
      isPublic: isPublic || false,
      coverImage,
      user: req.user._id,
      recipes: [],
    });

    res.status(201).json({
      status: "success",
      data: collection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update collection
export const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    // Check ownership
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to update this collection",
      });
    }

    const allowedFields = ["name", "description", "isPublic", "coverImage"];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("recipes", "title slug images averageRating");

    res.status(200).json({
      status: "success",
      data: updatedCollection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete collection
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    // Check ownership
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to delete this collection",
      });
    }

    await Collection.findByIdAndDelete(req.params.id);

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

// Add recipe to collection
export const addRecipeToCollection = async (req, res) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({
        message: "Recipe ID is required",
      });
    }

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    // Check ownership
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to modify this collection",
      });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // Check if recipe already in collection
    if (collection.recipes.includes(recipeId)) {
      return res.status(400).json({
        message: "Recipe already in collection",
      });
    }

    collection.recipes.push(recipeId);
    await collection.save();

    const updatedCollection = await Collection.findById(req.params.id).populate(
      "recipes",
      "title slug images averageRating"
    );

    res.status(200).json({
      status: "success",
      data: updatedCollection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Remove recipe from collection
export const removeRecipeFromCollection = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    // Check ownership
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to modify this collection",
      });
    }

    // Remove recipe from collection
    collection.recipes = collection.recipes.filter(
      (id) => id.toString() !== recipeId
    );
    await collection.save();

    const updatedCollection = await Collection.findById(req.params.id).populate(
      "recipes",
      "title slug images averageRating"
    );

    res.status(200).json({
      status: "success",
      data: updatedCollection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
