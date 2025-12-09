import Product from '../models/Product.js';

/**
 * Compare multiple products
 * @param {Array} productIds - Array of product IDs to compare
 * @returns {Object} Comparison data
 */
export const compareProducts = async (productIds) => {
  try {
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category', 'name');

    if (products.length < 2) {
      throw new Error('At least 2 products required for comparison');
    }

    // Extract all unique specification keys
    const allSpecKeys = new Set();
    products.forEach(product => {
      if (product.specifications) {
        product.specifications.forEach(spec => {
          allSpecKeys.add(spec.key);
        });
      }
    });

    // Build comparison table
    const comparison = {
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        rating: p.averageRating,
        reviews: p.totalReviews,
        stock: p.stock,
        category: p.category?.name,
      })),
      specifications: Array.from(allSpecKeys).map(key => {
        const row = { key, values: [] };
        products.forEach(product => {
          const spec = product.specifications?.find(s => s.key === key);
          row.values.push(spec ? spec.value : 'N/A');
        });
        return row;
      }),
      priceComparison: {
        lowest: Math.min(...products.map(p => p.price)),
        highest: Math.max(...products.map(p => p.price)),
        average: products.reduce((sum, p) => sum + p.price, 0) / products.length,
      },
      ratingComparison: {
        highest: Math.max(...products.map(p => p.averageRating || 0)),
        lowest: Math.min(...products.map(p => p.averageRating || 0)),
      },
    };

    return comparison;
  } catch (error) {
    throw error;
  }
};

/**
 * Get comparison endpoint
 */
export const getComparison = async (req, res) => {
  try {
    const { productIds } = req.query;

    if (!productIds) {
      return res.status(400).json({
        status: 'error',
        message: 'Product IDs are required',
      });
    }

    const ids = productIds.split(',');
    
    if (ids.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'At least 2 products required for comparison',
      });
    }

    if (ids.length > 4) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 4 products can be compared',
      });
    }

    const comparison = await compareProducts(ids);

    res.status(200).json({
      status: 'success',
      data: { comparison },
    });
  } catch (error) {
    console.error('Get comparison error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to compare products',
    });
  }
};
