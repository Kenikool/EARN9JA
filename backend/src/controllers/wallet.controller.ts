import { Request, Response } from "express";
import { walletService } from "../services/WalletService.js";
import { withdrawalService } from "../services/WithdrawalService.js";
import { paystackService } from "../services/PaystackService.js";
import { flutterwaveService } from "../services/FlutterwaveService.js";
import { User } from "../models/User.js";
import { PendingTopup } from "../models/PendingTopup.js";
import { cloudinaryService } from "../services/CloudinaryService.js";
import { Transaction } from "../models/Transaction.js";
import { Wallet } from "../models/Wallet.js";

class WalletController {
  /**
   * Get wallet balance
   */
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const balance = await walletService.getBalance(userId);

      res.status(200).json({
        success: true,
        balance,
      });
    } catch (error: any) {
      console.error("Get balance error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get balance",
      });
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as any;

      const result = await walletService.getTransactionHistory(
        userId,
        page,
        limit,
        type
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Get transactions error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get transactions",
      });
    }
  }

  /**
   * Request withdrawal - REAL IMPLEMENTATION with 2FA and Fraud Detection
   */
  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { amount, method, accountDetails, twoFactorToken } = req.body;

      // Get user for fraud detection
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Check if 2FA is enabled and verify token
      const { TwoFactorAuthService } = await import(
        "../services/TwoFactorAuthService.js"
      );
      const is2FAEnabled = await TwoFactorAuthService.isEnabled(userId);

      if (is2FAEnabled) {
        if (!twoFactorToken) {
          res.status(400).json({
            success: false,
            message: "2FA token required for withdrawal",
            requires2FA: true,
          });
          return;
        }

        const isValidToken = await TwoFactorAuthService.verifyToken(
          userId,
          twoFactorToken
        );

        if (!isValidToken) {
          res.status(400).json({
            success: false,
            message: "Invalid 2FA token",
          });
          return;
        }
      }

      // Fraud detection check (can be disabled for testing)
      const ENABLE_FRAUD_DETECTION =
        process.env.ENABLE_FRAUD_DETECTION !== "false";

      if (ENABLE_FRAUD_DETECTION) {
        const { FraudDetectionService } = await import(
          "../services/FraudDetectionService.js"
        );
        const deviceId = req.headers["x-device-id"] as string;
        const ipAddress =
          (req.headers["x-forwarded-for"] as string) || req.ip || "";

        const fraudCheck = await FraudDetectionService.checkWithdrawalFraud(
          userId,
          amount
        );

        if (fraudCheck.isFraudulent) {
          await FraudDetectionService.logFraudAttempt(
            userId,
            "withdrawal",
            fraudCheck
          );

          res.status(403).json({
            success: false,
            message:
              "Withdrawal request flagged for review. Please complete KYC verification and ensure your account meets all requirements.",
            reason: fraudCheck.reason,
            riskScore: fraudCheck.riskScore,
            flags: fraudCheck.flags,
            requirements: {
              kycVerified: user.kycVerified || false,
              accountAge: Math.floor(
                (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
              ),
              minimumAccountAge: 7,
            },
          });
          return;
        }
      }

      // Validate balance
      const balance = await walletService.getBalance(userId);
      if (balance.availableBalance < amount) {
        res.status(400).json({
          success: false,
          message: "Insufficient balance",
        });
        return;
      }

      // Minimum withdrawal amount
      if (amount < 1000) {
        res.status(400).json({
          success: false,
          message: "Minimum withdrawal amount is ₦1,000",
        });
        return;
      }

      // Create withdrawal request (debits wallet immediately)
      const withdrawal = await withdrawalService.createWithdrawalRequest(
        userId,
        amount,
        method,
        accountDetails
      );

      res.status(200).json({
        success: true,
        message:
          "Withdrawal request submitted successfully. Processing may take 1-3 business days.",
        data: {
          withdrawalId: withdrawal._id,
          amount: withdrawal.amount,
          netAmount: withdrawal.netAmount,
          method: withdrawal.method,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
        },
      });
    } catch (error: any) {
      console.error("Request withdrawal error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to request withdrawal",
      });
    }
  }

  /**
   * Get user's withdrawal history
   */
  async getWithdrawals(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const result = await withdrawalService.getUserWithdrawals(
        userId,
        page,
        limit,
        status
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Get withdrawals error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get withdrawals",
      });
    }
  }

  /**
   * Cancel withdrawal
   */
  async cancelWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { withdrawalId } = req.params;

      const withdrawal = await withdrawalService.cancelWithdrawal(
        withdrawalId,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Withdrawal cancelled successfully",
        data: withdrawal,
      });
    } catch (error: any) {
      console.error("Cancel withdrawal error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to cancel withdrawal",
      });
    }
  }

  /**
   * Top up wallet - REAL PAYSTACK INTEGRATION
   * Generates payment link for user to pay with real money
   * ONLY SPONSORS CAN TOP UP
   */
  async topUp(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Check if user is a sponsor
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      if (!user.roles.includes("sponsor")) {
        res.status(403).json({
          success: false,
          message:
            "Only sponsors can top up their wallet. Workers earn through completing tasks.",
        });
        return;
      }

      const { amount, paymentMethod } = req.body;

      if (amount < 500) {
        res.status(400).json({
          success: false,
          message: "Minimum top-up amount is ₦500",
        });
        return;
      }

      // Generate unique reference
      const reference = `TOPUP-${userId}-${Date.now()}`;

      // Initialize payment with Paystack, Flutterwave, or Bank Transfer
      let paymentData;

      if (paymentMethod === "bank_transfer") {
        // Create pending topup record
        const bankDetails = {
          bankName: process.env.BUSINESS_BANK_NAME || "Opay",
          accountNumber: process.env.BUSINESS_ACCOUNT_NUMBER || "9128176313",
          accountName:
            process.env.BUSINESS_ACCOUNT_NAME || "Prince Kenneth Luka",
        };

        const pendingTopup = await PendingTopup.create({
          userId,
          amount,
          reference,
          paymentMethod: "bank_transfer",
          bankDetails,
          status: "pending",
        });

        // Return business bank account details from environment variables
        res.status(200).json({
          success: true,
          message: "Bank transfer details generated",
          data: {
            topupId: pendingTopup._id,
            reference,
            amount,
            paymentMethod: "bank_transfer",
            bankDetails: {
              ...bankDetails,
              reference,
            },
            instructions: [
              "Transfer the exact amount to the account above",
              "Use the reference code as your transfer description or narration",
              "Upload your payment receipt for faster approval",
              "Your wallet will be credited within 10 minutes after admin approval",
            ],
          },
        });
      } else if (paymentMethod === "paystack" || paymentMethod === "card") {
        // Use Paystack
        paymentData = await paystackService.initializePayment(
          user.email,
          amount,
          reference,
          {
            userId,
            type: "wallet_topup",
            amount,
          }
        );

        res.status(200).json({
          success: true,
          message: "Payment link generated successfully",
          data: {
            paymentUrl: paymentData.data.authorization_url,
            reference: paymentData.data.reference,
            amount,
            paymentMethod: "paystack",
          },
        });
      } else if (paymentMethod === "flutterwave") {
        // Use Flutterwave
        paymentData = await flutterwaveService.initializePayment(
          user.email,
          amount,
          reference,
          user.email,
          {
            userId,
            type: "wallet_topup",
          }
        );

        res.status(200).json({
          success: true,
          message: "Payment link generated successfully",
          data: {
            paymentUrl: paymentData.data.link,
            reference,
            amount,
            paymentMethod: "flutterwave",
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message:
            "Invalid payment method. Supported methods: paystack, flutterwave, bank_transfer, card",
        });
      }
    } catch (error: any) {
      console.error("Top-up error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process top-up",
      });
    }
  }

  /**
   * Verify payment and credit wallet (called after payment)
   */
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { reference, paymentMethod } = req.body;

      let paymentData;

      if (paymentMethod === "paystack") {
        paymentData = await paystackService.verifyPayment(reference);

        if (paymentData.data.status === "success") {
          // Credit wallet
          const amount = paymentData.data.amount / 100; // Convert from kobo
          const userId = paymentData.data.metadata.userId;

          const { wallet, transaction } = await walletService.credit(
            userId,
            amount,
            "task_funding",
            `Wallet top-up via Paystack`,
            { paymentMethod: "paystack", reference },
            reference,
            "Payment"
          );

          res.status(200).json({
            success: true,
            message: "Payment verified and wallet credited",
            data: {
              transactionId: transaction._id,
              amount,
              newBalance: wallet.availableBalance,
            },
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Payment not successful",
          });
        }
      } else if (paymentMethod === "flutterwave") {
        const transactionId = req.body.transaction_id;
        paymentData = await flutterwaveService.verifyPayment(transactionId);

        if (paymentData.data.status === "successful") {
          const amount = paymentData.data.amount;
          const metadata = (paymentData.data as any).meta || {};
          const userId = metadata.userId;

          const { wallet, transaction } = await walletService.credit(
            userId,
            amount,
            "task_funding",
            `Wallet top-up via Flutterwave`,
            { paymentMethod: "flutterwave", reference },
            reference,
            "Payment"
          );

          res.status(200).json({
            success: true,
            message: "Payment verified and wallet credited",
            data: {
              transactionId: transaction._id,
              amount,
              newBalance: wallet.availableBalance,
            },
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Payment not successful",
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid payment method",
        });
      }
    } catch (error: any) {
      console.error("Verify payment error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to verify payment",
      });
    }
  }

  /**
   * Upload payment receipt for pending topup
   */
  async uploadReceipt(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { topupId } = req.params;
      const { receipt } = req.body;

      if (!receipt) {
        res.status(400).json({
          success: false,
          message: "No receipt image provided",
        });
        return;
      }

      // Find pending topup
      const pendingTopup = await PendingTopup.findOne({
        _id: topupId,
        userId,
        status: "pending",
      });

      if (!pendingTopup) {
        res.status(404).json({
          success: false,
          message: "Pending topup not found",
        });
        return;
      }

      // Upload to Cloudinary (it handles base64 directly)
      const receiptUrl = await cloudinaryService.uploadImage(
        receipt,
        "payment-receipts"
      );

      // Update pending topup with receipt URL
      pendingTopup.paymentReceipt = receiptUrl;

      // AUTO-APPROVE: Since there's no admin panel yet, auto-approve topups with receipts
      pendingTopup.status = "approved";
      await pendingTopup.save();

      // Credit the user's wallet
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
        return;
      }

      const previousBalance = wallet.availableBalance;
      wallet.availableBalance += pendingTopup.amount;
      wallet.lifetimeEarnings += pendingTopup.amount;
      await wallet.save();

      // Create transaction record
      await Transaction.create({
        userId,
        walletId: wallet._id,
        type: "topup",
        amount: pendingTopup.amount,
        balanceBefore: previousBalance,
        balanceAfter: wallet.availableBalance,
        status: "completed",
        description: `Wallet top-up via ${pendingTopup.paymentMethod} - ${pendingTopup.reference}`,
        metadata: {
          topupId: pendingTopup._id,
          paymentMethod: pendingTopup.paymentMethod,
          reference: pendingTopup.reference,
          receiptUrl,
        },
      });

      res.status(200).json({
        success: true,
        message:
          "Receipt uploaded and topup approved! Your wallet has been credited.",
        data: {
          receiptUrl,
          newBalance: wallet.availableBalance,
          amount: pendingTopup.amount,
        },
      });
    } catch (error: any) {
      console.error("Upload receipt error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload receipt",
      });
    }
  }

  /**
   * Get user's pending topups
   */
  async getPendingTopups(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const pendingTopups = await PendingTopup.find({ userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        data: pendingTopups,
      });
    } catch (error: any) {
      console.error("Get pending topups error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get pending topups",
      });
    }
  }

  /**
   * Check withdrawal eligibility
   */
  async checkWithdrawalEligibility(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Calculate account age
      const accountAge = Date.now() - user.createdAt.getTime();
      const daysSinceCreation = Math.floor(accountAge / (1000 * 60 * 60 * 24));
      const minimumAccountAge = 7;

      // Check requirements
      const requirements = {
        kycVerified: user.kycVerified || false,
        accountAge: daysSinceCreation,
        minimumAccountAge,
        accountAgeRequirementMet: daysSinceCreation >= minimumAccountAge,
      };

      const isEligible =
        requirements.kycVerified && requirements.accountAgeRequirementMet;

      const warnings: string[] = [];
      if (!requirements.kycVerified) {
        warnings.push(
          "KYC verification required. Please complete your KYC to enable withdrawals."
        );
      }
      if (!requirements.accountAgeRequirementMet) {
        const daysRemaining = minimumAccountAge - daysSinceCreation;
        warnings.push(
          `Account must be at least ${minimumAccountAge} days old. ${daysRemaining} day(s) remaining.`
        );
      }

      res.status(200).json({
        success: true,
        eligible: isEligible,
        requirements,
        warnings,
      });
    } catch (error: any) {
      console.error("Check withdrawal eligibility error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to check withdrawal eligibility",
      });
    }
  }

  /**
   * Get withdrawal methods
   */
  async getWithdrawalMethods(_req: Request, res: Response): Promise<void> {
    try {
      const methods = [
        {
          id: "bank_transfer",
          name: "Bank Transfer",
          description: "Direct transfer to your bank account",
          minAmount: 1000,
          maxAmount: 1000000,
          processingTime: "1-3 business days",
          fee: 0,
        },
        {
          id: "opay",
          name: "OPay",
          description: "Instant transfer to OPay wallet",
          minAmount: 500,
          maxAmount: 500000,
          processingTime: "Instant",
          fee: 0,
        },
        {
          id: "palmpay",
          name: "PalmPay",
          description: "Instant transfer to PalmPay wallet",
          minAmount: 500,
          maxAmount: 500000,
          processingTime: "Instant",
          fee: 0,
        },
      ];

      res.status(200).json({
        success: true,
        methods,
      });
    } catch (error: any) {
      console.error("Get withdrawal methods error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get withdrawal methods",
      });
    }
  }
}

export const walletController = new WalletController();
