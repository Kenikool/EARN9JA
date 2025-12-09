import express from 'express';
import {
  createSubscription,
  getSubscriptions,
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  updateSubscription,
  processSubscriptions,
  initializeSubscriptionPayment,
  verifySubscriptionPayment,
  getSubscriptionAnalytics,
} from '../controllers/subscriptionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Payment routes
router.post('/initialize-payment', protect, initializeSubscriptionPayment);
router.post('/verify-payment', protect, verifySubscriptionPayment);

// User routes
router.post('/', protect, createSubscription);
router.get('/', protect, getSubscriptions);
router.get('/:id', protect, getSubscription);
router.put('/:id/pause', protect, pauseSubscription);
router.put('/:id/resume', protect, resumeSubscription);
router.put('/:id/cancel', protect, cancelSubscription);
router.put('/:id', protect, updateSubscription);

// Admin routes
router.post('/process', protect, admin, processSubscriptions);
router.get('/analytics', protect, admin, getSubscriptionAnalytics);

export default router;
