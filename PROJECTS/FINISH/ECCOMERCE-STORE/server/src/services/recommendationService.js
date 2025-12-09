import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

/**
 * Collaborative Filtering: Users who bought X also bought Y
 * Simple algorithm based on order history
 */
export const getCollaborativeRecommendations = async (userId, limit = 10) => {
  try {
    // Get user's purchased products
    const userOrders = await Order.find({ user: userId, isPaid: true });
    const userProductIds = [];
    
    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (!userProductIds.includes(item.product.toString())) {
          userProductIds.push(item.product.toString());
        }
      });
    });

    if (userProductIds.length === 0) {
      return [];
    }

    // Find other users who bought the same products
    const similarOrders = await Order.find({
      user: { $ne: userId },
      isPaid: true,
      "items.product": { $in: userProductIds },
    }).populate("items.product");

    // Count product frequency
    const productFrequency = {};
    
    similarOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!userProductIds.includes(productId)) {
          productFrequency[productId] = (productFrequency[productId] || 0) + 1;
        }
      });
    });

    // Sort by frequency and get top products
    const recommendedIds = Object.entries(productFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const recommendations = await Product.find({
      _id: { $in: recommendedIds },
      isActive: true,
    }).populate("category");

    return recommendations;
  } catch (error) {
    console.error("Collaborative filtering error:", error);
    return [];
  }
};

/**
 * Content-Based Filtering: Similar products based on category, price, tags
 */
export const getContentBasedRecommendations = async (productId, limit = 10) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return [];

    // Find similar products based on:
    // 1. Same category
    // 2. Similar price range (±30%)
    // 3. Similar tags
    const priceMin = product.price * 0.7;
    const priceMax = product.price * 1.3;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      price: { $gte: priceMin, $lte: priceMax },
      isActive: true,
    })
      .populate("category")
      .limit(limit);

    // Calculate similarity scores
    const scoredProducts = similarProducts.map(p => {
      let score = 0;
      
      // Category match (high weight)
      if (p.category?._id.toString() === product.category?.toString()) {
        score += 50;
      }
      
      // Price similarity
      const priceDiff = Math.abs(p.price - product.price);
      const priceScore = Math.max(0, 30 - (priceDiff / product.price) * 30);
      score += priceScore;
      
      // Tag similarity
      const commonTags = p.tags?.filter(tag => product.tags?.includes(tag)) || [];
      score += commonTags.length * 5;
      
      // Brand match
      if (p.brand && p.brand === product.brand) {
        score += 20;
      }

      return { product: p, score };
    });

    // Sort by score and return products
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
  } catch (error) {
    console.error("Content-based filtering error:", error);
    return [];
  }
};

/**
 * Trending Products Algorithm
 * Based on: recent views, purchases, and rating
 */
export const getTrendingProducts = async (limit = 10, days = 7) => {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get recent orders
    const recentOrders = await Order.find({
      createdAt: { $gte: dateThreshold },
      isPaid: true,
    });

    // Calculate trending score for each product
    const productScores = {};

    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        if (!productScores[productId]) {
          productScores[productId] = {
            purchases: 0,
            revenue: 0,
          };
        }
        productScores[productId].purchases += item.quantity;
        productScores[productId].revenue += item.price * item.quantity;
      });
    });

    // Get products with scores
    const productIds = Object.keys(productScores);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).populate("category");

    // Calculate final trending score
    const scoredProducts = products.map(product => {
      const stats = productScores[product._id.toString()];
      
      // Trending score formula:
      // (purchases * 10) + (revenue * 0.1) + (rating * 5) + (views * 0.01)
      const score =
        (stats.purchases * 10) +
        (stats.revenue * 0.1) +
        (product.averageRating * 5) +
        (product.views * 0.01);

      return { product, score };
    });

    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  } catch (error) {
    console.error("Trending products error:", error);
    return [];
  }
};

/**
 * Personalized Recommendations
 * Combines collaborative and content-based filtering
 */
export const getPersonalizedRecommendations = async (userId, limit = 10) => {
  try {
    // Get both types of recommendations
    const collaborative = await getCollaborativeRecommendations(userId, limit);
    const trending = await getTrendingProducts(limit);

    // Merge and deduplicate
    const seen = new Set();
    const combined = [];

    // Prioritize collaborative (60%)
    const collaborativeCount = Math.ceil(limit * 0.6);
    for (const product of collaborative) {
      if (combined.length >= collaborativeCount) break;
      if (!seen.has(product._id.toString())) {
        seen.add(product._id.toString());
        combined.push(product);
      }
    }

    // Fill remaining with trending (40%)
    for (const product of trending) {
      if (combined.length >= limit) break;
      if (!seen.has(product._id.toString())) {
        seen.add(product._id.toString());
        combined.push(product);
      }
    }

    return combined;
  } catch (error) {
    console.error("Personalized recommendations error:", error);
    return [];
  }
};

/**
 * Smart Search with autocomplete
 * Simple fuzzy matching and relevance scoring
 */
export const smartSearch = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchRegex = new RegExp(query.split("").join(".*"), "i");
    
    const products = await Product.find({
      $or: [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $in: [new RegExp(query, "i")] } },
        { brand: { $regex: new RegExp(query, "i") } },
      ],
      isActive: true,
    })
      .populate("category")
      .limit(limit * 2); // Get more for scoring

    // Score results by relevance
    const scoredResults = products.map(product => {
      let score = 0;
      const lowerQuery = query.toLowerCase();
      const lowerName = product.name.toLowerCase();
      const lowerDesc = (product.description || "").toLowerCase();

      // Exact match in name (highest score)
      if (lowerName === lowerQuery) {
        score += 100;
      } else if (lowerName.startsWith(lowerQuery)) {
        score += 80;
      } else if (lowerName.includes(lowerQuery)) {
        score += 50;
      }

      // Match in description
      if (lowerDesc.includes(lowerQuery)) {
        score += 20;
      }

      // Tag match
      if (product.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        score += 30;
      }

      // Brand match
      if (product.brand?.toLowerCase().includes(lowerQuery)) {
        score += 40;
      }

      // Boost by popularity
      score += (product.sold || 0) * 0.1;
      score += (product.averageRating || 0) * 5;

      return { product, score };
    });

    return scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  } catch (error) {
    console.error("Smart search error:", error);
    return [];
  }
};

/**
 * Track user behavior (views, clicks, purchases)
 */
export const trackUserBehavior = async (userId, productId, action) => {
  try {
    // Update product views
    if (action === "view") {
      await Product.findByIdAndUpdate(productId, {
        $inc: { views: 1 },
      });
    }

    // Store in user's recently viewed (if user is logged in)
    if (userId && action === "view") {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { recentlyViewed: productId },
      });

      // Keep only last 20 viewed products
      const user = await User.findById(userId);
      if (user.recentlyViewed && user.recentlyViewed.length > 20) {
        user.recentlyViewed = user.recentlyViewed.slice(-20);
        await user.save();
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Track behavior error:", error);
    return { success: false };
  }
};

/**
 * Get recently viewed products for a user
 */
export const getRecentlyViewed = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId).populate({
      path: "recentlyViewed",
      options: { limit },
    });

    return user?.recentlyViewed || [];
  } catch (error) {
    console.error("Get recently viewed error:", error);
    return [];
  }
};
