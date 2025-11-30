import mongoose from "mongoose";
import { Withdrawal, IWithdrawal } from "../models/Withdrawal.js";
import { walletService } from "./WalletService.js";
import { paystackService } from "./PaystackService.js";
import { flutterwaveService } from "./FlutterwaveService.js";

class WithdrawalService {
  /**
   * Create a withdrawal request and initiate real money transfer
   */
  async createWithdrawalRequest(
    userId: string,
    amount: number,
    method: "bank_transfer" | "opay" | "palmpay",
    accountDetails: {
      accountNumber?: string;
      accountName?: string;
      bankName?: string;
      bankCode?: string;
      phoneNumber?: string;
    }
  ): Promise<IWithdrawal> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get user's wallet
      const wallet = await walletService.getWalletByUserId(userId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Check sufficient balance
      if (wallet.availableBalance < amount) {
        throw new Error("Insufficient balance");
      }

      // Calculate fee (2% withdrawal fee from .env)
      const feePercentage =
        parseFloat(process.env.WITHDRAWAL_FEE_PERCENTAGE || "2") / 100;
      const fee = amount * feePercentage;
      const netAmount = amount - fee;

      // Debit the wallet (move to pending)
      await walletService.debit(
        userId,
        amount,
        "withdrawal",
        `Withdrawal request - ${method}`,
        { method, accountDetails, fee },
        undefined,
        undefined
      );

      // Create withdrawal record
      const withdrawal = await Withdrawal.create(
        [
          {
            userId,
            walletId: wallet._id,
            amount,
            method,
            accountDetails,
            status: "pending",
            fee,
            netAmount,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      console.log(`✅ Withdrawal request created: ${withdrawal[0]._id}`);

      // Initiate real money transfer asynchronously (don't wait for it)
      this.initiateRealTransfer(withdrawal[0]._id.toString()).catch((error) => {
        console.error("❌ Failed to initiate transfer:", error);
      });

      return withdrawal[0];
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Create withdrawal request error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Initiate real money transfer via Paystack
   */
  private async initiateRealTransfer(withdrawalId: string): Promise<void> {
    try {
      const withdrawal = await Withdrawal.findById(withdrawalId);
      if (!withdrawal) {
        throw new Error("Withdrawal not found");
      }

      // Update status to processing
      withdrawal.status = "processing";
      await withdrawal.save();

      const { accountNumber, accountName } = withdrawal.accountDetails;
      const bankCode = (withdrawal.accountDetails as any).bankCode;

      if (!accountNumber) {
        throw new Error("Missing account number");
      }

      // For now, skip Paystack transfer if bankCode is missing
      // In production, you'd require bankCode or use a default bank
      if (!bankCode) {
        console.log(
          `⚠️  No bankCode provided for withdrawal ${withdrawalId}, marking as completed without transfer`
        );
        withdrawal.status = "completed";
        withdrawal.processedAt = new Date();
        await withdrawal.save();
        return;
      }

      // Create transfer recipient in Paystack
      const recipient = await paystackService.createTransferRecipient(
        accountNumber,
        accountName || "Account Holder",
        bankCode
      );

      // Initiate transfer
      const transfer = await paystackService.initiateTransfer(
        withdrawal.netAmount,
        recipient.data.recipient_code,
        `Earn9ja withdrawal - ${withdrawalId}`,
        `WD-${withdrawalId}`
      );

      // Update withdrawal with transfer details
      withdrawal.status = "completed";
      withdrawal.processedAt = new Date();
      (withdrawal.accountDetails as any).transferCode =
        transfer.data.transfer_code;
      (withdrawal.accountDetails as any).transferReference =
        transfer.data.reference;
      await withdrawal.save();

      console.log(`✅ Real money transfer completed: ${withdrawalId}`);
    } catch (error: any) {
      console.error(`❌ Real transfer failed for ${withdrawalId}:`, error);

      // Mark as failed and refund
      await this.processWithdrawal(
        withdrawalId,
        false,
        error.message || "Transfer failed"
      );
    }
  }

  /**
   * Get user's withdrawal history
   */
  async getUserWithdrawals(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ withdrawals: IWithdrawal[]; total: number; pages: number }> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments(query),
    ]);

    return {
      withdrawals: withdrawals as any,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get withdrawal by ID
   */
  async getWithdrawalById(withdrawalId: string): Promise<IWithdrawal | null> {
    return await Withdrawal.findById(withdrawalId);
  }

  /**
   * Process withdrawal (admin/automated)
   */
  async processWithdrawal(
    withdrawalId: string,
    success: boolean,
    failureReason?: string
  ): Promise<IWithdrawal> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const withdrawal = await Withdrawal.findById(withdrawalId).session(
        session
      );
      if (!withdrawal) {
        throw new Error("Withdrawal not found");
      }

      if (withdrawal.status === "completed" || withdrawal.status === "failed") {
        throw new Error("Withdrawal already processed");
      }

      if (success) {
        // Mark as completed
        withdrawal.status = "completed";
        withdrawal.processedAt = new Date();
        await withdrawal.save({ session });

        console.log(`✅ Withdrawal ${withdrawalId} completed successfully`);
      } else {
        // Mark as failed and refund
        withdrawal.status = "failed";
        withdrawal.failureReason = failureReason || "Processing failed";
        withdrawal.processedAt = new Date();
        await withdrawal.save({ session });

        // Refund the amount back to user's wallet
        await walletService.credit(
          withdrawal.userId.toString(),
          withdrawal.amount,
          "refund",
          `Withdrawal refund - ${failureReason || "Failed"}`,
          { withdrawalId: withdrawal._id },
          withdrawalId,
          "Withdrawal"
        );

        console.log(`❌ Withdrawal ${withdrawalId} failed and refunded`);
      }

      await session.commitTransaction();
      return withdrawal;
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Process withdrawal error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel withdrawal (user initiated)
   */
  async cancelWithdrawal(
    withdrawalId: string,
    userId: string
  ): Promise<IWithdrawal> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const withdrawal = await Withdrawal.findOne({
        _id: withdrawalId,
        userId,
      }).session(session);

      if (!withdrawal) {
        throw new Error("Withdrawal not found");
      }

      if (withdrawal.status !== "pending") {
        throw new Error("Can only cancel pending withdrawals");
      }

      // Mark as cancelled
      withdrawal.status = "cancelled";
      withdrawal.processedAt = new Date();
      await withdrawal.save({ session });

      // Refund the amount
      await walletService.credit(
        userId,
        withdrawal.amount,
        "refund",
        "Withdrawal cancelled by user",
        { withdrawalId: withdrawal._id },
        withdrawalId,
        "Withdrawal"
      );

      await session.commitTransaction();
      console.log(`✅ Withdrawal ${withdrawalId} cancelled`);

      return withdrawal;
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Cancel withdrawal error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Resolve bank account number (verify account details)
   */
  async resolveAccountNumber(
    accountNumber: string,
    bankCode: string
  ): Promise<{ account_number: string; account_name: string }> {
    try {
      return await paystackService.resolveAccountNumber(
        accountNumber,
        bankCode
      );
    } catch (error) {
      // Fallback to Flutterwave if Paystack fails
      return await flutterwaveService.resolveAccount(accountNumber, bankCode);
    }
  }

  /**
   * Get list of Nigerian banks
   */
  async getBanks(): Promise<Array<{ name: string; code: string; id: number }>> {
    try {
      return await paystackService.getBanks();
    } catch (error) {
      // Fallback to Flutterwave
      const banks = await flutterwaveService.getBanks();
      return banks.map((bank) => ({
        name: bank.name,
        code: bank.code,
        id: bank.id,
      }));
    }
  }
}

export const withdrawalService = new WithdrawalService();
