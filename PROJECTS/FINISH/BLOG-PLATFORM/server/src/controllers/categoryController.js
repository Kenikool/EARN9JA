import Category from "../models/Category.js";
import Post from "../models/Post.js";
import { ensureUniqueSlug } from "../utils/slugify.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // Calculate actual post count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const postCount = await Post.countDocuments({ 
          category: category._id, 
          status: "published" 
        });
        return {
          ...category.toObject(),
          postCount
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get posts in this category
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ category: category._id, status: "published" })
      .populate("author", "name avatar")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ category: category._id, status: "published" });

    res.json({
      category,
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Generate slug
    const slug = await ensureUniqueSlug(name);

    const category = await Category.create({
      name,
      slug,
      description,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, description } = req.body;

    if (name && name !== category.name) {
      category.name = name;
      category.slug = await ensureUniqueSlug(name);
    }

    if (description !== undefined) {
      category.description = description;
    }

    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has posts
    const postsCount = await Post.countDocuments({ category: category._id });

    if (postsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${postsCount} posts. Please reassign or delete posts first.` 
      });
    }

    await category.deleteOne();

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get popular tags
// @route   GET /api/categories/tags/popular
// @access  Public
export const getPopularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const tags = await Post.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
    ]);

    res.json(tags);
  } catch (error) {
    console.error("Get popular tags error:", error);
    res.status(500).json({ message: error.message });
  }
};
