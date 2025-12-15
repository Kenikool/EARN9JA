import { Request, Response } from "express";
import { escrowService } from "../services/EscrowService.js";
import { walletService } from "../services/WalletService.js";

class EscrowController {
  /**
   * Transfer funds from wallet to escrow
   * POST /api/sponsors/deposit
   */
  async initiateDeposit(req: Request, res: Response): Promise<void> {
    try {
      const sponsorId = req.user?._id.toString();
      if (!sponsorId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      // Verify user is a sponsor
      if (!req.user?.roles.includes("sponsor")) {
        res.status(403).json({
          success: false,
          error: "Only sponsors can deposit to escrow",
        });
        return;
      }

      const { amount } = req.body;

      // Validate input
      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: "Invalid amount",
        });
        return;
      }

      if (amount < 500) {
        res.status(400).json({
          success: false,
          error: "Minimum deposit amount is ₦500",
        });
        return;
      }

      // Check wallet balance
      const walletBalance = await walletService.getBalance(sponsorId);
      if (!walletBalance || walletBalance.availableBalance < amount) {
        res.status(400).json({
          success: false,
          error: "Insufficient wallet balance",
        });
        return;
      }

      // Deduct from wallet
      try {
        await walletService.debit(
          sponsorId,
          amount,
          "escrow_transfer",
          "Transfer to escrow account",
          { transferType: "wallet_to_escrow" }
        );
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: error.message || "Failed to deduct from wallet",
        });
        return;
      }

      // Add to escrow
      const paymentReference = `WALLET_TRANSFER_${Date.now()}`;
      const result = await escrowService.depositFunds(
        sponsorId,
        amount,
        paymentReference
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            balance: result.escrowAccount?.balance,
            availableBalance:
              (result.escrowAccount?.balance || 0) -
              (result.escrowAccount?.reservedBalance || 0),
            totalDeposited: result.escrowAccount?.totalDeposited,
          },
          message: `Successfully transferred ₦${amount} to escrow`,
        });
      } else {
        // Refund wallet if escrow deposit failed
        await walletService.credit(
          sponsorId,
          amount,
          "escrow_transfer_refund",
          "Refund from failed escrow transfer",
          { transferType: "escrow_refund" }
        );

        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in initiateDeposit controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Initiate external payment deposit (Paystack/Flutterwave)
   * POST /api/sponsors/deposit-external
   */
  async initiateExternalDeposit(req: Request, res: Response): Promise<void> {
    try {
      const sponsorId = req.user?._id.toString();
      if (!sponsorId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      // Verify user is a sponsor
      if (!req.user?.roles.includes("sponsor")) {
        res.status(403).json({
          success: false,
          error: "Only sponsors can deposit to escrow",
        });
        return;
      }

      const { amount, paymentMethod, paymentReference } = req.body;

      // Validate input
      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: "Invalid amount",
        });
        return;
      }

      if (
        !paymentMethod ||
        !["paystack", "flutterwave"].includes(paymentMethod)
      ) {
        res.status(400).json({
          success: false,
          error: "Invalid payment method",
        });
        return;
      }

      if (!paymentReference) {
        res.status(400).json({
          success: false,
          error: "Payment reference is required",
        });
        return;
      }

      // Process deposit
      const result = await escrowService.depositFunds(
        sponsorId,
        amount,
        paymentReference
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            balance: result.escrowAccount?.balance,
            totalDeposited: result.escrowAccount?.totalDeposited,
          },
          message: `Successfully deposited ₦${amount} to escrow`,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in initiateExternalDeposit controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get escrow balance
   * GET /api/sponsors/escrow-balance
   */
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const sponsorId = req.user?._id.toString();
      if (!sponsorId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      // Verify user is a sponsor
      if (!req.user?.roles.includes("sponsor")) {
        res.status(403).json({
          success: false,
          error: "Only sponsors can view escrow balance",
        });
        return;
      }

      const result = await escrowService.getBalance(sponsorId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            balance: result.balance,
            availableBalance: result.availableBalance,
            reservedBalance: result.reservedBalance,
            totalDeposited: result.totalDeposited,
            totalWithdrawn: result.totalWithdrawn,
            status: result.status,
          },
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in getBalance controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Handle payment webhook confirmation
   * POST /api/webhooks/escrow-payment
   */
  async handlePaymentWebhook(req: Request, res: Response): Promise<void> {
    try {
      // This will be called by Paystack/Flutterwave webhook
      const { event, data } = req.body;

      // Verify webhook signature (implement based on payment provider)
      // For now, we'll assume the webhook is verified

      if (event === "charge.success") {
        const { reference, amount, metadata } = data;
        const sponsorId = metadata?.sponsorId;

        if (!sponsorId) {
          res.status(400).json({
            success: false,
            error: "Sponsor ID not found in metadata",
          });
          return;
        }

        // Convert amount from kobo to naira (Paystack sends in kobo)
        const amountInNaira = amount / 100;

        // Process the deposit
        const result = await escrowService.depositFunds(
          sponsorId,
          amountInNaira,
          reference
        );

        if (result.success) {
          res.status(200).json({
            success: true,
            message: "Payment processed successfully",
          });
        } else {
          res.status(400).json({
            success: false,
            error: result.error,
          });
        }
      } else {
        res.status(200).json({
          success: true,
          message: "Event received",
        });
      }
    } catch (error) {
      console.error("Error in handlePaymentWebhook controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

export const escrowController = new EscrowController();
