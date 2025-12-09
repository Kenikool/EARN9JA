import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Global admin search
export const globalSearch = async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required',
      });
    }

    const searchQuery = q.trim();
    const searchLimit = parseInt(limit);
    const results = {};

    // Search products
    if (type === 'all' || type === 'products') {
      const products = await Product.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { sku: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .select('name price image sku countInStock')
        .limit(searchLimit);

      results.products = products;
    }

    // Search orders
    if (type === 'all' || type === 'orders') {
      const orders = await Order.find({
        $or: [
          { orderNumber: { $regex: searchQuery, $options: 'i' } },
          { 'shippingAddress.fullName': { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .populate('user', 'name email')
        .select('orderNumber totalPrice orderStatus createdAt user')
        .limit(searchLimit)
        .sort('-createdAt');

      results.orders = orders;
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .select('name email role createdAt isEmailVerified')
        .limit(searchLimit);

      results.users = users;
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    res.status(200).json({
      status: 'success',
      data: {
        query: searchQuery,
        totalResults,
        results,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
