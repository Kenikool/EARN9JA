import mongoose from "mongoose";
import { Wallet, IWallet } from "../models/Wallet.js";
import { Transaction, ITransaction } from "../models/Transaction.js";
import { Escrow, IEscrow } from "../models/Escrow.js";
import { getSocketService } from "../config/socket.js";

class WalletService {
  /**
   * Create a new wallet for a user
   */
  async createWallet(userId: string): Promise<IWallet> {
    try {
      const wallet = await Wallet.create({
        userId,
        availableBalance: 0,
        pendingBalance: 0,
        escrowBalance: 0,
        lifetimeEarnings: 0,
        lifetimeSpending: 0,
        currency: "NGN",
      });

      console.log(`✅ Wallet created for user: ${userId}`);
      return wallet;
    } catch (error) {
      console.error("❌ Create wallet error:", error);
      throw new Error("Failed to create wallet");
    }
  }

  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: string): Promise<IWallet | null> {
    return await Wallet.findOne({ userId });
  }

  /**
   * Get transaction by reference ID (to prevent duplicate processing)
   */
  async getTransactionByReference(
    referenceId: string
  ): Promise<ITransaction | null> {
    return await Transaction.findOne({ referenceId });
  }

  /**
   * Credit wallet (add money)
   */
  async credit(
    userId: string,
    amount: number,
    type: ITransaction["type"],
    description: string,
    metadata: Record<string, any> = {},
    referenceId?: string,
    referenceType?: string
  ): Promise<{ wallet: IWallet; transaction: ITransaction }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get wallet
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore + amount;

      // Update wallet
      wallet.availableBalance = balanceAfter;
      wallet.lifetimeEarnings += amount;
      await wallet.save({ session });

      // Create transaction record
      const transaction = await Transaction.create(
        [
          {
            walletId: wallet._id,
            userId,
            type,
            amount,
            balanceBefore,
            balanceAfter,
            status: "completed",
            description,
            referenceId,
            referenceType,
            metadata,
            completedAt: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      console.log(`✅ Credited ${amount} to user ${userId}`);

      // Notify user about payment received (for certain types)
      if (
        [
          "task_earning",
          "referral_bonus",
          "daily_bonus",
          "admob_reward",
        ].includes(type)
      ) {
        try {
          const { NotificationHelpers } = await import(
            "./NotificationHelpers.js"
          );
          const sourceMap: Record<string, string> = {
            task_earning: "Task Completion",
            referral_bonus: "Referral Bonus",
            daily_bonus: "Daily Bonus",
            admob_reward: "Ad Reward",
          };
          await NotificationHelpers.notifyPaymentReceived(
            userId,
            amount,
            sourceMap[type] || description,
            transaction[0]._id.toString()
          );
        } catch (error) {
          console.log("Failed to send payment notification:", error);
        }
      }

      return { wallet, transaction: transaction[0] };
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Credit error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Debit wallet (remove money)
   */
  async debit(
    userId: string,
    amount: number,
    type: ITransaction["type"],
    description: string,
    metadata: Record<string, any> = {},
    referenceId?: string,
    referenceType?: string
  ): Promise<{ wallet: IWallet; transaction: ITransaction }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get wallet
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Check sufficient balance
      if (wallet.availableBalance < amount) {
        throw new Error("Insufficient balance");
      }

      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore - amount;

      // Update wallet
      wallet.availableBalance = balanceAfter;
      wallet.lifetimeSpending += amount;
      await wallet.save({ session });

      // Create transaction record
      const transaction = await Transaction.create(
        [
          {
            walletId: wallet._id,
            userId,
            type,
            amount: -amount, // Negative for debit
            balanceBefore,
            balanceAfter,
            status: "completed",
            description,
            referenceId,
            referenceType,
            metadata,
            completedAt: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      console.log(`✅ Debited ${amount} from user ${userId}`);

      return { wallet, transaction: transaction[0] };
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Debit error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Hold funds in escrow for a task
   */
  async holdEscrow(
    sponsorId: string,
    taskId: string,
    totalAmount: number,
    totalSlots: number,
    platformFeePercentage: number = 0.1 // 10% platform fee
  ): Promise<IEscrow> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId: sponsorId }).session(
        session
      );
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Check sufficient balance
      if (wallet.availableBalance < totalAmount) {
        throw new Error("Insufficient balance");
      }

      // Calculate platform fee
      const platformFee = totalAmount * platformFeePercentage;
      const amountPerSlot = (totalAmount - platformFee) / totalSlots;

      // Move funds from available to escrow
      wallet.availableBalance -= totalAmount;
      wallet.escrowBalance += totalAmount;
      await wallet.save({ session });

      // Create escrow record
      const escrow = await Escrow.create(
        [
          {
            sponsorId,
            taskId,
            amount: totalAmount,
            status: "held",
            totalSlots,
            releasedSlots: 0,
            amountPerSlot,
            platformFee,
          },
        ],
        { session }
      );

      // Create transaction record
      await Transaction.create(
        [
          {
            walletId: wallet._id,
            userId: sponsorId,
            type: "task_funding",
            amount: -totalAmount,
            balanceBefore: wallet.availableBalance + totalAmount,
            balanceAfter: wallet.availableBalance,
            status: "completed",
            description: `Funds held in escrow for task`,
            referenceId: taskId,
            referenceType: "Task",
            metadata: { totalSlots, platformFee },
            completedAt: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      console.log(`✅ Held ${totalAmount} in escrow for task ${taskId}`);

      return escrow[0];
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Hold escrow error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Release escrow funds to a worker
   */
  async releaseEscrow(
    taskId: string,
    workerId: string,
    submissionId: string
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get escrow
      const escrow = await Escrow.findOne({ taskId }).session(session);
      if (!escrow) {
        throw new Error("Escrow not found");
      }

      if (escrow.status === "released" || escrow.status === "refunded") {
        throw new Error("Escrow already processed");
      }

      // Get sponsor wallet
      const sponsorWallet = await Wallet.findOne({
        userId: escrow.sponsorId,
      }).session(session);
      if (!sponsorWallet) {
        throw new Error("Sponsor wallet not found");
      }

      // Release one slot
      const releaseAmount = escrow.amountPerSlot;
      escrow.releasedSlots += 1;

      // Update escrow status
      if (escrow.releasedSlots >= escrow.totalSlots) {
        escrow.status = "released";
        escrow.releasedAt = new Date();
      } else {
        escrow.status = "partially_released";
      }

      // Update sponsor wallet (remove from escrow)
      sponsorWallet.escrowBalance -= releaseAmount;
      await sponsorWallet.save({ session });
      await escrow.save({ session });

      // Credit worker
      await this.credit(
        workerId,
        releaseAmount,
        "task_earning",
        `Payment for completed task`,
        { taskId, submissionId },
        taskId,
        "Task"
      );

      await session.commitTransaction();
      console.log(
        `✅ Released ${releaseAmount} from escrow to worker ${workerId}`
      );
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Release escrow error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Refund escrow to sponsor
   */
  async refundEscrow(taskId: string, reason: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get escrow
      const escrow = await Escrow.findOne({ taskId }).session(session);
      if (!escrow) {
        throw new Error("Escrow not found");
      }

      if (escrow.status === "released" || escrow.status === "refunded") {
        throw new Error("Escrow already processed");
      }

      // Calculate remaining amount
      const releasedAmount = escrow.releasedSlots * escrow.amountPerSlot;
      const remainingAmount = escrow.amount - releasedAmount;

      if (remainingAmount <= 0) {
        throw new Error("No funds to refund");
      }

      // Get sponsor wallet
      const sponsorWallet = await Wallet.findOne({
        userId: escrow.sponsorId,
      }).session(session);
      if (!sponsorWallet) {
        throw new Error("Sponsor wallet not found");
      }

      // Refund to sponsor
      sponsorWallet.escrowBalance -= remainingAmount;
      sponsorWallet.availableBalance += remainingAmount;
      await sponsorWallet.save({ session });

      // Update escrow
      escrow.status = "refunded";
      escrow.refundedAt = new Date();
      await escrow.save({ session });

      // Create transaction record
      await Transaction.create(
        [
          {
            walletId: sponsorWallet._id,
            userId: escrow.sponsorId,
            type: "refund",
            amount: remainingAmount,
            balanceBefore: sponsorWallet.availableBalance - remainingAmount,
            balanceAfter: sponsorWallet.availableBalance,
            status: "completed",
            description: `Escrow refund: ${reason}`,
            referenceId: taskId,
            referenceType: "Task",
            metadata: { reason, releasedSlots: escrow.releasedSlots },
            completedAt: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      console.log(`✅ Refunded ${remainingAmount} to sponsor`);
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Refund escrow error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    type?: ITransaction["type"]
  ): Promise<{ transactions: any[]; total: number; pages: number }> {
    const query: any = { userId };
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<{
    availableBalance: number;
    pendingBalance: number;
    escrowBalance: number;
    lifetimeEarnings: number;
  }> {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return {
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      escrowBalance: wallet.escrowBalance,
      lifetimeEarnings: wallet.lifetimeEarnings,
    };
  }

  /**
   * Hold funds in escrow (for task creation)
   */
  async holdInEscrow(
    userId: string,
    amount: number,
    type: string,
    description: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.availableBalance < amount) {
        throw new Error("Insufficient balance");
      }

      const balanceBefore = wallet.availableBalance;

      // Move from available to escrow
      wallet.availableBalance -= amount;
      wallet.escrowBalance += amount;
      await wallet.save({ session });

      // Create transaction record
      await Transaction.create(
        [
          {
            walletId: wallet._id,
            userId,
            type: "task_funding",
            amount: -amount,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            status: "completed",
            description,
            completedAt: new Date(),
          },
        ],
        { session }
      );

      console.log(`✅ Held ${amount} in escrow for ${userId}`);
    } catch (error) {
      console.error("❌ Hold escrow error:", error);
      throw error;
    }
  }

  /**
   * Release escrow funds to worker (when task approved)
   */
  async releaseFromEscrow(
    sponsorId: string,
    amount: number,
    workerId: string,
    type: ITransaction["type"],
    description: string,
    referenceId: string,
    referenceType: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      // Get sponsor wallet
      const sponsorWallet = await Wallet.findOne({ userId: sponsorId }).session(
        session
      );
      if (!sponsorWallet) {
        throw new Error("Sponsor wallet not found");
      }

      // Get worker wallet
      const workerWallet = await Wallet.findOne({ userId: workerId }).session(
        session
      );
      if (!workerWallet) {
        throw new Error("Worker wallet not found");
      }

      // Release from sponsor's escrow
      sponsorWallet.escrowBalance -= amount;
      await sponsorWallet.save({ session });

      // Credit worker
      const workerBalanceBefore = workerWallet.availableBalance;
      workerWallet.availableBalance += amount;
      workerWallet.lifetimeEarnings += amount;
      await workerWallet.save({ session });

      // Create transaction for worker
      await Transaction.create(
        [
          {
            walletId: workerWallet._id,
            userId: workerId,
            type,
            amount,
            balanceBefore: workerBalanceBefore,
            balanceAfter: workerWallet.availableBalance,
            status: "completed",
            description,
            referenceId,
            referenceType,
            completedAt: new Date(),
          },
        ],
        { session }
      );

      console.log(`✅ Released ${amount} from escrow to ${workerId}`);

      // Emit real-time wallet update
      try {
        const socketService = getSocketService();
        socketService.emitWalletUpdate(workerId, workerWallet.toObject());
        socketService.emitPayment(workerId, {
          amount,
          type,
          description,
        });
      } catch (error) {
        console.log("Socket service not available");
      }
    } catch (error) {
      console.error("❌ Release escrow error:", error);
      throw error;
    }
  }

  /**
   * Refund escrow funds to sponsor (when task cancelled/expired)
   */
  async refundFromEscrow(
    sponsorId: string,
    amount: number,
    type: string,
    description: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      const wallet = await Wallet.findOne({ userId: sponsorId }).session(
        session
      );
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      const balanceBefore = wallet.availableBalance;

      // Move from escrow back to available
      wallet.escrowBalance -= amount;
      wallet.availableBalance += amount;
      await wallet.save({ session });

      // Create transaction record
      await Transaction.create(
        [
          {
            walletId: wallet._id,
            userId: sponsorId,
            type: "refund",
            amount,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            status: "completed",
            description,
            completedAt: new Date(),
          },
        ],
        { session }
      );

      console.log(`✅ Refunded ${amount} to ${sponsorId}`);
    } catch (error) {
      console.error("❌ Refund escrow error:", error);
      throw error;
    }
  }
}

export const walletService = new WalletService();
