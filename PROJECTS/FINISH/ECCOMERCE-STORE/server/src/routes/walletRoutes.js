import express from 'express';
import {
  getWallet,
  addFunds,
  getTransactions,
  transferFunds,
  initializeWalletPayment,
  verifyWalletPayment,
  requestWithdrawal,
  getWithdrawals,
  cancelWithdrawal,
} from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWallet);
router.post('/initialize-payment', protect, initializeWalletPayment);
router.post('/verify-payment', protect, verifyWalletPayment);
router.post('/add-funds', protect, addFunds);
router.get('/transactions', protect, getTransactions);
router.post('/transfer', protect, transferFunds);
router.post('/withdraw', protect, requestWithdrawal);
router.get('/withdrawals', protect, getWithdrawals);
router.put('/withdrawals/:id/cancel', protect, cancelWithdrawal);

export default router;
