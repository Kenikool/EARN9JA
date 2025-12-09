import Product from "../models/Product.js";
import { sendLowStockAlert } from "../controllers/notificationController.js";

// Low stock threshold
const LOW_STOCK_THRESHOLD = 10;

// @desc    Check all products for low stock
export const checkLowStock = async () => {
  try {
    // Find products with stock below threshold and not already alerted
    const lowStockProducts = await Product.find({
      stock: { $lte: LOW_STOCK_THRESHOLD, $gt: 0 },
      isActive: true,
    }).populate('category');

    console.log(`Found ${lowStockProducts.length} products with low stock`);

    // Send alerts for each low stock product
    for (const product of lowStockProducts) {
      try {
        await sendLowStockAlert(product, product.stock);
        
        // Mark product as alerted (you can add a field to track this)
        // product.lowStockAlerted = true;
        // await product.save();
      } catch (error) {
        console.error(`Failed to send alert for product ${product._id}:`, error);
      }
    }

    return {
      success: true,
      count: lowStockProducts.length,
      products: lowStockProducts.map(p => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
      })),
    };
  } catch (error) {
    console.error('Check low stock error:', error);
    throw error;
  }
};

// @desc    Check single product stock after order
export const checkProductStock = async (productId) => {
  try {
    const product = await Product.findById(productId).populate('category');
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if stock is low
    if (product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0) {
      await sendLowStockAlert(product, product.stock);
      console.log(`Low stock alert sent for product: ${product.name}`);
    }

    // Auto-disable product if out of stock
    if (product.stock === 0 && product.isActive) {
      product.isActive = false;
      await product.save();
      console.log(`Product ${product.name} auto-disabled due to zero stock`);
    }

    return { success: true };
  } catch (error) {
    console.error('Check product stock error:', error);
    throw error;
  }
};

// @desc    Schedule periodic stock checks (run every hour)
export const scheduleStockChecks = () => {
  // Check stock every hour
  setInterval(async () => {
    console.log('Running scheduled stock check...');
    try {
      await checkLowStock();
    } catch (error) {
      console.error('Scheduled stock check failed:', error);
    }
  }, 60 * 60 * 1000); // 1 hour

  console.log('Stock monitoring scheduled - checks every hour');
};

// @desc    Get low stock products (for admin dashboard)
export const getLowStockProducts = async () => {
  try {
    const products = await Product.find({
      stock: { $lte: LOW_STOCK_THRESHOLD },
      isActive: true,
    })
      .populate('category')
      .select('name stock sku category images')
      .sort({ stock: 1 })
      .limit(20);

    return products;
  } catch (error) {
    console.error('Get low stock products error:', error);
    throw error;
  }
};
