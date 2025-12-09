import Product from "../models/Product.js";
import Category from "../models/Category.js";
import FlashSale from "../models/FlashSale.js";

// @desc    Get all products with filters, search, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = "-createdAt",
      category,
      minPrice,
      maxPrice,
      rating,
      search,
      featured,
      vendor,
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter (support both ID and slug)
    if (category) {
      // Check if it's a valid MongoDB ObjectId
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        // It's a slug, find the category first
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    // Vendor filter
    if (vendor) {
      query.vendor = vendor;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Featured filter
    if (featured === "true") {
      query.featured = true;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    // Get active flash sales
    const now = new Date();
    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).select('product discountPercentage soldCount quantity');

    // Create a map of product IDs to flash sales
    const flashSaleMap = new Map();
    flashSales.forEach(sale => {
      if (sale.soldCount < sale.quantity) {
        flashSaleMap.set(sale.product.toString(), sale);
      }
    });

    // Add flash sale info to products
    const productsWithFlashSales = products.map(product => {
      const productObj = product.toObject();
      const flashSale = flashSaleMap.get(product._id.toString());
      
      if (flashSale) {
        const discountedPrice = product.price * (1 - flashSale.discountPercentage / 100);
        productObj.flashSale = {
          discountPercentage: flashSale.discountPercentage,
          discountedPrice,
          endTime: flashSale.endTime,
          remainingQuantity: flashSale.quantity - flashSale.soldCount,
        };
        productObj.price = discountedPrice; // Replace price with flash sale price
      }
      
      return productObj;
    });

    // Get total count
    const total = await Product.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        products: productsWithFlashSales,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true })
      .populate("category", "name slug")
      .populate("vendor", "businessName rating logo");

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.status(200).json({
      status: "success",
      data: { product },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ featured: true, isActive: true })
      .populate("category", "name slug")
      .populate("vendor", "businessName rating")
      .sort("-averageRating -sold")
      .limit(Number(limit));

    res.status(200).json({
      status: "success",
      data: { products },
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch featured products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // Validate that ID is provided and is a valid ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID provided",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    // Find products in same category, excluding current product
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: id },
      isActive: true,
    })
      .populate("category", "name slug")
      .populate("vendor", "businessName rating")
      .sort("-averageRating")
      .limit(Number(limit));

    res.status(200).json({
      status: "success",
      data: { products: relatedProducts },
    });
  } catch (error) {
    console.error("Get related products error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch related products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin/Vendor)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      images,
      category,
      brand,
      stock,
      sku,
      variants,
      specifications,
      tags,
      featured,
      weight,
    } = req.body;

    // Validation
    if (!name || !description || !price || !category || !images || images.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    // Set vendor if user is vendor
    const productData = {
      name,
      description,
      price,
      compareAtPrice,
      images,
      category,
      brand,
      stock,
      sku,
      variants,
      specifications,
      tags,
      featured: req.user.role === "admin" ? featured : false,
      weight,
    };

    if (req.user.role === "vendor") {
      // Find vendor profile
      const Vendor = (await import("../models/Vendor.js")).default;
      const vendor = await Vendor.findOne({ user: req.user._id });
      if (vendor) {
        productData.vendor = vendor._id;
      }
    }

    const product = await Product.create(productData);

    // Update category product count
    categoryExists.productCount += 1;
    await categoryExists.save();

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Vendor)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    // Check if vendor owns the product
    if (req.user.role === "vendor") {
      const Vendor = (await import("../models/Vendor.js")).default;
      const vendor = await Vendor.findOne({ user: req.user._id });
      
      if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
        return res.status(403).json({
          status: "error",
          message: "Not authorized to update this product",
        });
      }
    }

    // Update fields
    const allowedUpdates = [
      "name",
      "description",
      "price",
      "compareAtPrice",
      "images",
      "category",
      "brand",
      "stock",
      "sku",
      "variants",
      "specifications",
      "tags",
      "weight",
      "isActive",
    ];

    // Only admin can update featured status
    if (req.user.role === "admin") {
      allowedUpdates.push("featured");
    }

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Vendor)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    // Check if vendor owns the product
    if (req.user.role === "vendor") {
      const Vendor = (await import("../models/Vendor.js")).default;
      const vendor = await Vendor.findOne({ user: req.user._id });
      
      if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
        return res.status(403).json({
          status: "error",
          message: "Not authorized to delete this product",
        });
      }
    }

    // Update category product count
    const category = await Category.findById(product.category);
    if (category) {
      category.productCount = Math.max(0, category.productCount - 1);
      await category.save();
    }

    await product.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
