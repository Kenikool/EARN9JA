import Wallet from '../models/Wallet.js';

// @desc    Get wallet
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
    }

    res.status(200).json({
      status: 'success',
      data: { wallet },
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch wallet',
    });
  }
};

// @desc    Initialize wallet payment
// @route   POST /api/wallet/initialize-payment
// @access  Private
export const initializeWalletPayment = async (req, res) => {
  try {
    const { amount, gateway, currency = 'USD' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount',
      });
    }

    if (!gateway) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment gateway is required',
      });
    }

    // Import payment factory
    const { initializePayment } = await import('../config/payments/paymentFactory.js');

    // Prepare payment data
    const paymentData = {
      amount,
      currency,
      email: req.user.email,
      name: req.user.name,
      reference: `WALLET-${req.user._id}-${Date.now()}`,
      redirectUrl: `${process.env.CLIENT_URL}/wallet?payment=success`,
      callbackUrl: `${process.env.CLIENT_URL}/wallet?payment=success`,
      metadata: {
        userId: req.user._id.toString(),
        type: 'wallet_topup',
        amount,
      },
      title: 'Wallet Top-up',
      description: `Add ${currency} ${amount} to wallet`,
    };

    // Initialize payment
    const result = await initializePayment(gateway, paymentData);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error || 'Payment initialization failed',
      });
    }

    // Normalize response - provide consistent field names
    const responseData = {
      gateway,
      reference: paymentData.reference,
      ...result,
    };

    // Add normalized paymentUrl field for easier frontend handling
    if (result.authorizationUrl) {
      responseData.paymentUrl = result.authorizationUrl;
    } else if (result.paymentLink) {
      responseData.paymentUrl = result.paymentLink;
    } else if (result.link) {
      responseData.paymentUrl = result.link;
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment initialized successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Initialize wallet payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize payment',
    });
  }
};

// @desc    Verify wallet payment and add funds
// @route   POST /api/wallet/verify-payment
// @access  Private
export const verifyWalletPayment = async (req, res) => {
  try {
    const { reference, gateway } = req.body;

    if (!reference || !gateway) {
      return res.status(400).json({
        status: 'error',
        message: 'Reference and gateway are required',
      });
    }

    console.log(`Verifying ${gateway} payment with reference: ${reference}`);

    // Import payment factory
    const { verifyPayment } = await import('../config/payments/paymentFactory.js');

    // Verify payment
    const result = await verifyPayment(gateway, reference);

    console.log('Payment verification result:', result);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error || 'Payment verification failed',
      });
    }

    // Check if this payment has already been processed
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
    }

    // Check if transaction already exists
    const existingTransaction = wallet.transactions.find(
      tx => tx.reference === reference
    );

    if (existingTransaction) {
      console.log('Payment already processed:', reference);
      return res.status(200).json({
        status: 'success',
        message: 'Payment already processed',
        data: { wallet },
      });
    }

    // Add funds to wallet
    await wallet.addFunds(result.amount, 'Wallet top-up via ' + gateway, reference);

    console.log(`Added ${result.amount} to wallet for user ${req.user._id}`);
    console.log(`New balance: ${wallet.balance}`);

    // Fetch fresh wallet data
    const updatedWallet = await Wallet.findOne({ user: req.user._id });

    res.status(200).json({
      status: 'success',
      message: 'Payment verified and funds added successfully',
      data: { wallet: updatedWallet },
    });
  } catch (error) {
    console.error('Verify wallet payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Add funds to wallet (Direct - for admin/testing)
// @route   POST /api/wallet/add-funds
// @access  Private
export const addFunds = async (req, res) => {
  try {
    const { amount, paymentReference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount',
      });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
    }

    await wallet.addFunds(amount, 'Funds added', paymentReference);

    res.status(200).json({
      status: 'success',
      message: 'Funds added successfully',
      data: { wallet },
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add funds',
    });
  }
};

// @desc    Get transactions
// @route   GET /api/wallet/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(200).json({
        status: 'success',
        data: { transactions: [], pagination: { page, limit, total: 0, pages: 0 } },
      });
    }

    const transactions = wallet.transactions
      .sort((a, b) => b.date - a.date)
      .slice((page - 1) * limit, page * limit);

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total: wallet.transactions.length,
          pages: Math.ceil(wallet.transactions.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transactions',
    });
  }
};

// @desc    Request withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount',
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Minimum withdrawal amount is $10',
      });
    }

    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankName) {
      return res.status(400).json({
        status: 'error',
        message: 'Bank details are required',
      });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance',
      });
    }

    // Import Withdrawal model
    const Withdrawal = (await import('../models/Withdrawal.js')).default;

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      currency: wallet.currency,
      bankDetails,
      reference: `WD-${Date.now()}-${req.user._id.toString().slice(-6)}`,
      status: 'pending',
    });

    // Deduct from wallet (hold the funds)
    await wallet.deductFunds(
      amount,
      `Withdrawal request ${withdrawal.reference}`,
      withdrawal.reference
    );

    console.log(`Withdrawal request created: ${withdrawal.reference} for $${amount}`);

    res.status(201).json({
      status: 'success',
      message: 'Withdrawal request submitted successfully. Processing time: 1-3 business days',
      data: { withdrawal },
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to request withdrawal',
    });
  }
};

// @desc    Get withdrawal history
// @route   GET /api/wallet/withdrawals
// @access  Private
export const getWithdrawals = async (req, res) => {
  try {
    const Withdrawal = (await import('../models/Withdrawal.js')).default;
    
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      status: 'success',
      data: { withdrawals },
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch withdrawals',
    });
  }
};

// @desc    Cancel withdrawal (if still pending)
// @route   PUT /api/wallet/withdrawals/:id/cancel
// @access  Private
export const cancelWithdrawal = async (req, res) => {
  try {
    const Withdrawal = (await import('../models/Withdrawal.js')).default;
    
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({
        status: 'error',
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Cannot cancel withdrawal with status: ${withdrawal.status}`,
      });
    }

    // Refund to wallet
    const wallet = await Wallet.findOne({ user: req.user._id });
    await wallet.addFunds(
      withdrawal.amount,
      `Withdrawal cancelled ${withdrawal.reference}`,
      `${withdrawal.reference}-CANCEL`
    );

    withdrawal.status = 'cancelled';
    await withdrawal.save();

    res.status(200).json({
      status: 'success',
      message: 'Withdrawal cancelled and funds returned to wallet',
      data: { withdrawal },
    });
  } catch (error) {
    console.error('Cancel withdrawal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel withdrawal',
    });
  }
};

// @desc    Transfer funds
// @route   POST /api/wallet/transfer
// @access  Private
export const transferFunds = async (req, res) => {
  try {
    const { recipientEmail, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount',
      });
    }

    const User = (await import('../models/User.js')).default;
    const recipient = await User.findOne({ email: recipientEmail });

    if (!recipient) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipient not found',
      });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot transfer to yourself',
      });
    }

    let senderWallet = await Wallet.findOne({ user: req.user._id });
    if (!senderWallet) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance',
      });
    }

    let recipientWallet = await Wallet.findOne({ user: recipient._id });
    if (!recipientWallet) {
      recipientWallet = await Wallet.create({ user: recipient._id });
    }

    await senderWallet.deductFunds(amount, `Transfer to ${recipientEmail}`, `TRANSFER-${Date.now()}`);
    await recipientWallet.addFunds(amount, `Transfer from ${req.user.email}`, `TRANSFER-${Date.now()}`);

    res.status(200).json({
      status: 'success',
      message: 'Transfer successful',
      data: { wallet: senderWallet },
    });
  } catch (error) {
    console.error('Transfer funds error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to transfer funds',
    });
  }
};
