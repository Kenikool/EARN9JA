import FlashSale from '../models/FlashSale.js';
import Product from '../models/Product.js';

// @desc    Get all flash sales (admin)
// @route   GET /api/admin/flash-sales
// @access  Private/Admin
export const getFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find()
      .populate('product', 'name price images')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        flashSales,
      },
    });
  } catch (error) {
    console.error('Get flash sales error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch flash sales',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Create flash sale
// @route   POST /api/admin/flash-sales
// @access  Private/Admin
export const createFlashSale = async (req, res) => {
  try {
    const { productId, discountPercentage, quantity, startTime, endTime, isActive } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    // Check if product already has an active flash sale
    const existingFlashSale = await FlashSale.findOne({
      product: productId,
      isActive: true,
      endTime: { $gt: new Date() },
    });

    if (existingFlashSale) {
      return res.status(400).json({
        status: 'error',
        message: 'Product already has an active flash sale',
      });
    }

    const flashSale = await FlashSale.create({
      product: productId,
      discountPercentage,
      quantity,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isActive,
    });

    await flashSale.populate('product', 'name price images');

    res.status(201).json({
      status: 'success',
      data: {
        flashSale,
      },
    });
  } catch (error) {
    console.error('Create flash sale error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create flash sale',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update flash sale
// @route   PUT /api/admin/flash-sales/:id
// @access  Private/Admin
export const updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, discountPercentage, quantity, startTime, endTime, isActive } = req.body;

    const flashSale = await FlashSale.findById(id);

    if (!flashSale) {
      return res.status(404).json({
        status: 'error',
        message: 'Flash sale not found',
      });
    }

    // If changing product, validate it exists
    if (productId && productId !== flashSale.product.toString()) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      // Check if new product already has an active flash sale
      const existingFlashSale = await FlashSale.findOne({
        product: productId,
        isActive: true,
        endTime: { $gt: new Date() },
        _id: { $ne: id },
      });

      if (existingFlashSale) {
        return res.status(400).json({
          status: 'error',
          message: 'Product already has an active flash sale',
        });
      }
    }

    // Update fields
    if (productId) flashSale.product = productId;
    if (discountPercentage !== undefined) flashSale.discountPercentage = discountPercentage;
    if (quantity !== undefined) flashSale.quantity = quantity;
    if (startTime) flashSale.startTime = new Date(startTime);
    if (endTime) flashSale.endTime = new Date(endTime);
    if (isActive !== undefined) flashSale.isActive = isActive;

    await flashSale.save();
    await flashSale.populate('product', 'name price images');

    res.status(200).json({
      status: 'success',
      data: {
        flashSale,
      },
    });
  } catch (error) {
    console.error('Update flash sale error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update flash sale',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete flash sale
// @route   DELETE /api/admin/flash-sales/:id
// @access  Private/Admin
export const deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findById(id);

    if (!flashSale) {
      return res.status(404).json({
        status: 'error',
        message: 'Flash sale not found',
      });
    }

    await FlashSale.deleteOne({ _id: id });

    res.status(200).json({
      status: 'success',
      message: 'Flash sale deleted successfully',
    });
  } catch (error) {
    console.error('Delete flash sale error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete flash sale',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
