import GiftCard from '../models/GiftCard.js';

// @desc    Purchase gift card
// @route   POST /api/gift-cards/purchase
// @access  Private
export const purchaseGiftCard = async (req, res) => {
  try {
    const { amount, recipientEmail, message, expiryMonths = 12 } = req.body;

    if (!amount || amount < 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Minimum gift card amount is $5',
      });
    }

    const code = GiftCard.generateCode();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + expiryMonths);

    const giftCard = await GiftCard.create({
      code,
      amount,
      balance: amount,
      purchasedBy: req.user._id,
      recipientEmail,
      message,
      expiresAt,
    });

    // TODO: Send email to recipient with gift card code

    res.status(201).json({
      status: 'success',
      message: 'Gift card purchased successfully',
      data: { giftCard },
    });
  } catch (error) {
    console.error('Purchase gift card error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to purchase gift card',
    });
  }
};

// @desc    Validate gift card
// @route   POST /api/gift-cards/validate
// @access  Public
export const validateGiftCard = async (req, res) => {
  try {
    const { code } = req.body;

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!giftCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid gift card code',
      });
    }

    if (!giftCard.isValid()) {
      return res.status(400).json({
        status: 'error',
        message: 'Gift card is expired or already used',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        code: giftCard.code,
        balance: giftCard.balance,
        expiresAt: giftCard.expiresAt,
      },
    });
  } catch (error) {
    console.error('Validate gift card error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate gift card',
    });
  }
};

// @desc    Apply gift card to order
// @route   POST /api/gift-cards/apply
// @access  Private
export const applyGiftCard = async (req, res) => {
  try {
    const { code, amount, orderId } = req.body;

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!giftCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid gift card code',
      });
    }

    if (!giftCard.isValid()) {
      return res.status(400).json({
        status: 'error',
        message: 'Gift card is expired or already used',
      });
    }

    if (amount > giftCard.balance) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient gift card balance',
      });
    }

    giftCard.balance -= amount;
    giftCard.usedBy.push({
      user: req.user._id,
      amount,
      orderId,
    });

    if (giftCard.balance === 0) {
      giftCard.status = 'used';
    }

    await giftCard.save();

    res.status(200).json({
      status: 'success',
      message: 'Gift card applied successfully',
      data: {
        appliedAmount: amount,
        remainingBalance: giftCard.balance,
      },
    });
  } catch (error) {
    console.error('Apply gift card error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to apply gift card',
    });
  }
};

// @desc    Get gift card balance
// @route   GET /api/gift-cards/balance/:code
// @access  Public
export const getGiftCardBalance = async (req, res) => {
  try {
    const { code } = req.params;

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!giftCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid gift card code',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        balance: giftCard.balance,
        status: giftCard.status,
        expiresAt: giftCard.expiresAt,
      },
    });
  } catch (error) {
    console.error('Get gift card balance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get gift card balance',
    });
  }
};

// @desc    Get my gift cards
// @route   GET /api/gift-cards/my-cards
// @access  Private
export const getMyGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.find({ purchasedBy: req.user._id })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { giftCards },
    });
  } catch (error) {
    console.error('Get my gift cards error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch gift cards',
    });
  }
};
