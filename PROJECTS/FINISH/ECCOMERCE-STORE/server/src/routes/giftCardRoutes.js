import express from 'express';
import {
  purchaseGiftCard,
  validateGiftCard,
  applyGiftCard,
  getGiftCardBalance,
  getMyGiftCards,
} from '../controllers/giftCardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/purchase', protect, purchaseGiftCard);
router.post('/validate', validateGiftCard);
router.post('/apply', protect, applyGiftCard);
router.get('/balance/:code', getGiftCardBalance);
router.get('/my-cards', protect, getMyGiftCards);

export default router;
