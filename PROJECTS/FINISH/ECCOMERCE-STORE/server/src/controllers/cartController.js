import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import FlashSale from "../models/FlashSale.js";
import User from "../models/User.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: {
          cart: {
            items: [],
            totalItems: 0,
            subtotal: 0,
          },
        },
      });
    }

    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.status(200).json({
      status: "success",
      data: {
        cart: {
          items: cart.items,
          totalItems,
          subtotal,
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant = "" } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be at least 1",
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Product not found or unavailable",
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        status: "error",
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Check for active flash sale
    const now = new Date();
    const flashSale = await FlashSale.findOne({
      product: productId,
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    });

    // Calculate price (apply flash sale discount if available)
    let itemPrice = product.price;
    if (flashSale && flashSale.soldCount < flashSale.quantity) {
      itemPrice = product.price * (1 - flashSale.discountPercentage / 100);
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId && item.variant === variant
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check stock for new quantity
      if (product.stock < newQuantity) {
        return res.status(400).json({
          status: "error",
          message: `Only ${product.stock} items available in stock`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = itemPrice;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        variant,
        price: itemPrice,
      });
    }

    await cart.save();

    // Remove item from wishlist if it exists
    try {
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { wishlist: { product: productId } } },
        { new: true }
      );
    } catch (wishlistError) {
      console.error("Error removing from wishlist:", wishlistError);
      // Don't fail the cart operation if wishlist removal fails
    }

    // Populate and return cart
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.status(200).json({
      status: "success",
      message: "Item added to cart",
      data: {
        cart: {
          items: cart.items,
          totalItems,
          subtotal,
        },
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add item to cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found in cart",
      });
    }

    // Check stock availability
    const product = await Product.findById(item.product);

    if (!product || !product.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Product not found or unavailable",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: "error",
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Check for active flash sale
    const now = new Date();
    const flashSale = await FlashSale.findOne({
      product: item.product,
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    });

    // Calculate price (apply flash sale discount if available)
    let itemPrice = product.price;
    if (flashSale && flashSale.soldCount < flashSale.quantity) {
      itemPrice = product.price * (1 - flashSale.discountPercentage / 100);
    }

    // Update quantity and price
    item.quantity = quantity;
    item.price = itemPrice;

    await cart.save();

    // Populate and return cart
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.status(200).json({
      status: "success",
      message: "Cart updated",
      data: {
        cart: {
          items: cart.items,
          totalItems,
          subtotal,
        },
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update cart item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    // Remove item using pull
    cart.items.pull(itemId);

    await cart.save();

    // Populate and return cart
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.status(200).json({
      status: "success",
      message: "Item removed from cart",
      data: {
        cart: {
          items: cart.items,
          totalItems,
          subtotal,
        },
      },
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to remove item from cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Cart cleared",
      data: {
        cart: {
          items: [],
          totalItems: 0,
          subtotal: 0,
        },
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to clear cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Sync guest cart with user cart
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res) => {
  try {
    const { guestCartItems } = req.body;

    if (!guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid cart items",
      });
    }

    // Find or create user cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    // Merge guest cart items with user cart
    for (const guestItem of guestCartItems) {
      const product = await Product.findById(guestItem.productId);

      if (!product || !product.isActive) {
        continue; // Skip unavailable products
      }

      // Check for active flash sale
      const now = new Date();
      const flashSale = await FlashSale.findOne({
        product: guestItem.productId,
        isActive: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
      });

      // Calculate price (apply flash sale discount if available)
      let itemPrice = product.price;
      if (flashSale && flashSale.soldCount < flashSale.quantity) {
        itemPrice = product.price * (1 - flashSale.discountPercentage / 100);
      }

      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === guestItem.productId &&
          item.variant === (guestItem.variant || "")
      );

      if (existingItemIndex > -1) {
        // Update quantity (don't exceed stock)
        const newQuantity = Math.min(
          cart.items[existingItemIndex].quantity + guestItem.quantity,
          product.stock
        );
        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].price = itemPrice;
      } else {
        // Add new item (don't exceed stock)
        const quantity = Math.min(guestItem.quantity, product.stock);
        cart.items.push({
          product: guestItem.productId,
          quantity,
          variant: guestItem.variant || "",
          price: itemPrice,
        });
      }
    }

    await cart.save();

    // Populate and return cart
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.status(200).json({
      status: "success",
      message: "Cart synced successfully",
      data: {
        cart: {
          items: cart.items,
          totalItems,
          subtotal,
        },
      },
    });
  } catch (error) {
    console.error("Sync cart error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to sync cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
