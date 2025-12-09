import express from 'express';
import {
  createReferralCode,
  applyReferralCode,
  getReferralStats,
  getLoyaltyPoints,
  redeemPoints,
  shareProduct,
  subscribeNewsletter,
  getFlashSales,
} from '../controllers/socialController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Referral routes
router.post('/referral/create', protect, createReferralCode);
router.post('/referral/apply', protect, applyReferralCode);
router.get('/referral/stats', protect, getReferralStats);

// Loyalty points routes
router.get('/loyalty/points', protect, getLoyaltyPoints);
router.post('/loyalty/redeem', protect, redeemPoints);

// Social sharing
router.post('/share', shareProduct);

// Newsletter
router.post('/newsletter/subscribe', subscribeNewsletter);

// Flash sales
router.get('/flash-sales', getFlashSales);

export default router;
