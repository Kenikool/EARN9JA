import Category from "../models/Category.js";
import Product from "../models/Product.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { parent, active } = req.query;

    const query = {};

    // Filter by parent (for subcategories)
    if (parent !== undefined) {
      query.parent = parent === "null" ? null : parent;
    }

    // Filter by active status
    if (active !== undefined) {
      query.isActive = active === "true";
    }

    const categories = await Category.find(query)
      .populate("parent", "name slug")
      .sort("name");

    res.status(200).json({
      status: "success",
      data: { categories },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch categories",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).populate(
      "parent",
      "name slug"
    );

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    // Get subcategories
    const subcategories = await Category.find({
      parent: category._id,
      isActive: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        category,
        subcategories,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, parent } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Category name is required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        status: "error",
        message: "Category with this name already exists",
      });
    }

    // If parent is provided, check if it exists
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(404).json({
          status: "error",
          message: "Parent category not found",
        });
      }
    }

    const category = await Category.create({
      name,
      description,
      image,
      parent: parent || null,
    });

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, parent, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(400).json({
          status: "error",
          message: "Category with this name already exists",
        });
      }
    }

    // Prevent setting self as parent
    if (parent && parent === id) {
      return res.status(400).json({
        status: "error",
        message: "Category cannot be its own parent",
      });
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parent !== undefined) category.parent = parent || null;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });

    if (productCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `Cannot delete category with ${productCount} products. Please reassign or delete products first.`,
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: id });

    if (subcategoryCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `Cannot delete category with ${subcategoryCount} subcategories. Please delete subcategories first.`,
      });
    }

    await category.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
