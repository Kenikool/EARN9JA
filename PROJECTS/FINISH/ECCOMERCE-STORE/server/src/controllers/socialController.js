import Referral from '../models/Referral.js';
import LoyaltyPoints from '../models/LoyaltyPoints.js';
import User from '../models/User.js';
import FlashSale from '../models/FlashSale.js';
import crypto from 'crypto';

// Generate unique referral code
const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Create referral code
export const createReferralCode = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has a referral code
    let referral = await Referral.findOne({ referrer: userId, referred: null });

    if (!referral) {
      // Generate unique code
      let code;
      let isUnique = false;
      
      while (!isUnique) {
        code = generateReferralCode();
        const existing = await Referral.findOne({ code });
        if (!existing) isUnique = true;
      }

      referral = await Referral.create({
        referrer: userId,
        code,
      });
    }

    res.status(200).json({
      status: 'success',
      data: { referral },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Apply referral code during signup
export const applyReferralCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    // Find referral by code
    const referral = await Referral.findOne({ code, referred: null });

    if (!referral) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid referral code',
      });
    }

    // Can't refer yourself
    if (referral.referrer.toString() === userId.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot use your own referral code',
      });
    }

    // Update referral
    referral.referred = userId;
    referral.status = 'completed';
    referral.reward = 100; // 100 points reward
    await referral.save();

    // Award points to referrer
    let referrerPoints = await LoyaltyPoints.findOne({ user: referral.referrer });
    if (!referrerPoints) {
      referrerPoints = await LoyaltyPoints.create({ user: referral.referrer });
    }
    referrerPoints.addPoints(100, 'Referral reward');
    await referrerPoints.save();

    // Award points to referred user
    let referredPoints = await LoyaltyPoints.findOne({ user: userId });
    if (!referredPoints) {
      referredPoints = await LoyaltyPoints.create({ user: userId });
    }
    referredPoints.addPoints(50, 'Sign up bonus');
    await referredPoints.save();

    res.status(200).json({
      status: 'success',
      message: 'Referral code applied successfully',
      data: { pointsEarned: 50 },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get referral statistics
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const referrals = await Referral.find({ referrer: userId })
      .populate('referred', 'name email')
      .sort('-createdAt');

    const stats = {
      totalReferrals: referrals.filter(r => r.status === 'completed').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalRewards: referrals.reduce((sum, r) => sum + r.reward, 0),
      referrals,
    };

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get loyalty points
export const getLoyaltyPoints = async (req, res) => {
  try {
    const userId = req.user._id;

    let loyaltyPoints = await LoyaltyPoints.findOne({ user: userId });

    if (!loyaltyPoints) {
      loyaltyPoints = await LoyaltyPoints.create({ user: userId });
    }

    res.status(200).json({
      status: 'success',
      data: { loyaltyPoints },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Redeem loyalty points
export const redeemPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid points amount',
      });
    }

    let loyaltyPoints = await LoyaltyPoints.findOne({ user: userId });

    if (!loyaltyPoints) {
      return res.status(404).json({
        status: 'error',
        message: 'Loyalty points account not found',
      });
    }

    if (loyaltyPoints.points < points) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient points',
      });
    }

    loyaltyPoints.redeemPoints(points, reason || 'Points redeemed');
    await loyaltyPoints.save();

    res.status(200).json({
      status: 'success',
      message: 'Points redeemed successfully',
      data: { loyaltyPoints },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Share product (track social shares)
export const shareProduct = async (req, res) => {
  try {
    const { productId, platform } = req.body;
    const userId = req.user?._id;

    // Award points for sharing
    if (userId) {
      let loyaltyPoints = await LoyaltyPoints.findOne({ user: userId });
      if (!loyaltyPoints) {
        loyaltyPoints = await LoyaltyPoints.create({ user: userId });
      }
      loyaltyPoints.addPoints(5, `Shared product on ${platform}`);
      await loyaltyPoints.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Product shared successfully',
      data: { pointsEarned: userId ? 5 : 0 },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Subscribe to newsletter
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    // Check if user exists and award points
    const user = await User.findOne({ email });
    if (user) {
      let loyaltyPoints = await LoyaltyPoints.findOne({ user: user._id });
      if (!loyaltyPoints) {
        loyaltyPoints = await LoyaltyPoints.create({ user: user._id });
      }
      loyaltyPoints.addPoints(10, 'Newsletter subscription');
      await loyaltyPoints.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully subscribed to newsletter',
      data: { pointsEarned: user ? 10 : 0 },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get active flash sales
export const getFlashSales = async (req, res) => {
  try {
    const now = new Date();

    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .populate('product')
      .sort('endTime');

    // Filter to only include sales with available quantity
    const activeFlashSales = flashSales.filter(
      sale => sale.soldCount < sale.quantity
    );

    res.status(200).json({
      status: 'success',
      data: { flashSales: activeFlashSales },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
