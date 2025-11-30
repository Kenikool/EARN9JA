import { Request, Response } from "express";
import crypto from "crypto";
import { walletService } from "../services/WalletService.js";
import { paystackService } from "../services/PaystackService.js";
import { flutterwaveService } from "../services/FlutterwaveService.js";

class WebhookController {
  /**
   * Handle Paystack webhook events
   * Automatically credits wallet when payment is successful
   */
  async handlePaystackWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Verify webhook signature
      const hash = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash !== req.headers["x-paystack-signature"]) {
        console.error("❌ Invalid Paystack webhook signature");
        res.status(400).json({ success: false, message: "Invalid signature" });
        return;
      }

      const event = req.body;
      console.log(`📥 Paystack webhook received: ${event.event}`);

      // Handle charge.success event
      if (event.event === "charge.success") {
        const { reference, amount, metadata, status } = event.data;

        if (status === "success" && metadata?.type === "wallet_topup") {
          const userId = metadata.userId;
          const amountInNaira = amount / 100; // Convert from kobo

          // Check if transaction already processed
          const existingTransaction =
            await walletService.getTransactionByReference(reference);

          if (existingTransaction) {
            console.log(`⚠️  Transaction already processed: ${reference}`);
            res
              .status(200)
              .json({ success: true, message: "Already processed" });
            return;
          }

          // Credit wallet
          const { wallet, transaction } = await walletService.credit(
            userId,
            amountInNaira,
            "task_funding",
            `Wallet top-up via Paystack`,
            { paymentMethod: "paystack", reference },
            reference,
            "Payment"
          );

          console.log(
            `✅ Wallet credited: ${userId} - ₦${amountInNaira} - ${reference}`
          );

          res.status(200).json({
            success: true,
            message: "Wallet credited successfully",
            data: {
              transactionId: transaction._id,
              amount: amountInNaira,
              newBalance: wallet.availableBalance,
            },
          });
          return;
        }
      }

      // Acknowledge other events
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("❌ Paystack webhook error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Webhook processing failed",
      });
    }
  }

  /**
   * Handle Flutterwave webhook events
   * Automatically credits wallet when payment is successful
   */
  async handleFlutterwaveWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Verify webhook signature
      const signature = req.headers["verif-hash"];
      const secretHash = process.env.FLUTTERWAVE_SECRET_HASH || "";

      if (!signature || signature !== secretHash) {
        console.error("❌ Invalid Flutterwave webhook signature");
        res.status(400).json({ success: false, message: "Invalid signature" });
        return;
      }

      const event = req.body;
      console.log(`📥 Flutterwave webhook received: ${event.event}`);

      // Handle successful charge
      if (event.event === "charge.completed") {
        const { tx_ref, amount, status, meta } = event.data;

        if (status === "successful" && meta?.type === "wallet_topup") {
          const userId = meta.userId;

          // Check if transaction already processed
          const existingTransaction =
            await walletService.getTransactionByReference(tx_ref);

          if (existingTransaction) {
            console.log(`⚠️  Transaction already processed: ${tx_ref}`);
            res
              .status(200)
              .json({ success: true, message: "Already processed" });
            return;
          }

          // Credit wallet
          const { wallet, transaction } = await walletService.credit(
            userId,
            amount,
            "task_funding",
            `Wallet top-up via Flutterwave`,
            { paymentMethod: "flutterwave", reference: tx_ref },
            tx_ref,
            "Payment"
          );

          console.log(`✅ Wallet credited: ${userId} - ₦${amount} - ${tx_ref}`);

          res.status(200).json({
            success: true,
            message: "Wallet credited successfully",
            data: {
              transactionId: transaction._id,
              amount,
              newBalance: wallet.availableBalance,
            },
          });
          return;
        }
      }

      // Acknowledge other events
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("❌ Flutterwave webhook error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Webhook processing failed",
      });
    }
  }
}

export const webhookController = new WebhookController();
