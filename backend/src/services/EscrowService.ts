import mongoose from "mongoose";
import { EscrowAccount, IEscrowAccount } from "../models/EscrowAccount";
import { FinancialTransaction } from "../models/FinancialTransaction";
import { Wallet } from "../models/Wallet";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";

interface DepositResult {
  success: boolean;
  escrowAccount?: IEscrowAccount;
  error?: string;
}

interface ReserveResult {
  success: boolean;
  reservationId?: string;
  error?: string;
}

interface ReleaseResult {
  success: boolean;
  workerPayment?: number;
  platformCommission?: number;
  error?: string;
}

export class EscrowService {
  private readonly PLATFORM_COMMISSION_RATE = 0.15; // 15% commission

  /**
   * Deposit funds into sponsor's escrow account
   */
  async depositFunds(
    sponsorId: string,
    amount: number,
    paymentReference: string
  ): Promise<DepositResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate sponsor exists and has sponsor role
      const sponsor = await User.findById(sponsorId).session(session);
      if (!sponsor) {
        await session.abortTransaction();
        return { success: false, error: "Sponsor not found" };
      }

      if (!sponsor.roles.includes("sponsor")) {
        await session.abortTransaction();
        return { success: false, error: "User is not a sponsor" };
      }

      // Get or create escrow account
      let escrowAccount = await EscrowAccount.findOne({
        sponsorId,
      }).session(session);

      if (!escrowAccount) {
        const accounts = await EscrowAccount.create(
          [
            {
              sponsorId,
              balance: 0,
              reservedBalance: 0,
              totalDeposited: 0,
              totalWithdrawn: 0,
              status: "active",
            },
          ],
          { session }
        );
        escrowAccount = accounts[0];
      }

      // Validate escrow account is active
      if (escrowAccount.status !== "active") {
        await session.abortTransaction();
        return { success: false, error: "Escrow account is not active" };
      }

      // Update escrow balance
      escrowAccount.balance += amount;
      escrowAccount.totalDeposited += amount;
      await escrowAccount.save({ session });

      // Log financial transaction
      await FinancialTransaction.create(
        [
          {
            type: "escrow_deposit",
            amount,
            userId: sponsorId,
            escrowAccountId: escrowAccount._id,
            description: `Escrow deposit of ₦${amount}`,
            metadata: {
              paymentReference,
              newBalance: escrowAccount.balance,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Notify sponsor about topup confirmation
      try {
        const { NotificationHelpers } = await import(
          "./NotificationHelpers.js"
        );
        await NotificationHelpers.notifyTopupConfirmed(
          sponsorId,
          amount,
          escrowAccount.balance
        );
      } catch (error) {
        console.log("Failed to send topup notification:", error);
      }

      return {
        success: true,
        escrowAccount,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Error depositing escrow funds:", error);
      return {
        success: false,
        error: "Failed to deposit funds. Please try again.",
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Reserve funds for a task
   */
  async reserveFunds(
    sponsorId: string,
    amount: number,
    taskId: string
  ): Promise<ReserveResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const escrowAccount = await EscrowAccount.findOne({
        sponsorId,
      }).session(session);

      if (!escrowAccount) {
        await session.abortTransaction();
        return { success: false, error: "Escrow account not found" };
      }

      if (escrowAccount.status !== "active") {
        await session.abortTransaction();
        return { success: false, error: "Escrow account is not active" };
      }

      // Check if sufficient balance available
      const availableBalance =
        escrowAccount.balance - escrowAccount.reservedBalance;
      if (availableBalance < amount) {
        await session.abortTransaction();
        return {
          success: false,
          error: `Insufficient escrow balance. Available: ₦${availableBalance}, Required: ₦${amount}`,
        };
      }

      // Reserve the funds
      escrowAccount.reservedBalance += amount;
      await escrowAccount.save({ session });

      // Log the reservation
      await FinancialTransaction.create(
        [
          {
            type: "escrow_deposit",
            amount,
            userId: sponsorId,
            taskId,
            escrowAccountId: escrowAccount._id,
            description: `Reserved ₦${amount} for task`,
            metadata: {
              action: "reserve",
              reservedBalance: escrowAccount.reservedBalance,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Check if balance is low after reservation
      const newAvailableBalance =
        escrowAccount.balance - escrowAccount.reservedBalance;
      if (newAvailableBalance < 5000) {
        try {
          await this.checkLowBalance(sponsorId, 5000);
        } catch (error) {
          console.log("Failed to check low balance:", error);
        }
      }

      return {
        success: true,
        reservationId: taskId,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Error reserving escrow funds:", error);
      return {
        success: false,
        error: "Failed to reserve funds. Please try again.",
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Release funds when task is completed
   * Pays worker and takes platform commission
   */
  async releaseFunds(
    taskId: string,
    sponsorId: string,
    workerId: string,
    taskAmount: number
  ): Promise<ReleaseResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get escrow account
      const escrowAccount = await EscrowAccount.findOne({
        sponsorId,
      }).session(session);

      if (!escrowAccount) {
        await session.abortTransaction();
        return { success: false, error: "Escrow account not found" };
      }

      // Calculate commission and worker payment
      const platformCommission = taskAmount * this.PLATFORM_COMMISSION_RATE;
      const workerPayment = taskAmount - platformCommission;

      // Validate sufficient reserved balance
      if (escrowAccount.reservedBalance < taskAmount) {
        await session.abortTransaction();
        return {
          success: false,
          error: "Insufficient reserved balance for task",
        };
      }

      // Update escrow account
      escrowAccount.balance -= taskAmount;
      escrowAccount.reservedBalance -= taskAmount;
      escrowAccount.totalWithdrawn += taskAmount;
      await escrowAccount.save({ session });

      // Get or create worker wallet
      let workerWallet = await Wallet.findOne({ userId: workerId }).session(
        session
      );

      if (!workerWallet) {
        const wallets = await Wallet.create(
          [
            {
              userId: workerId,
              availableBalance: 0,
              pendingBalance: 0,
              escrowBalance: 0,
              lifetimeEarnings: 0,
              lifetimeSpending: 0,
              currency: "NGN",
            },
          ],
          { session }
        );
        workerWallet = wallets[0];
      }

      // Pay worker
      const workerBalanceBefore = workerWallet.availableBalance;
      workerWallet.availableBalance += workerPayment;
      workerWallet.lifetimeEarnings += workerPayment;
      const workerBalanceAfter = workerWallet.availableBalance;
      await workerWallet.save({ session });

      // Create worker transaction
      await Transaction.create(
        [
          {
            walletId: workerWallet._id,
            userId: workerId,
            type: "task_payment",
            amount: workerPayment,
            balanceBefore: workerBalanceBefore,
            balanceAfter: workerBalanceAfter,
            status: "completed",
            description: `Task payment (₦${taskAmount} - ${
              this.PLATFORM_COMMISSION_RATE * 100
            }% commission)`,
            referenceId: taskId,
            referenceType: "Task",
            metadata: {
              taskAmount,
              platformCommission,
              commissionRate: this.PLATFORM_COMMISSION_RATE,
            },
            completedAt: new Date(),
          },
        ],
        { session }
      );

      // Log financial transactions
      await FinancialTransaction.create(
        [
          {
            type: "escrow_release",
            amount: taskAmount,
            userId: sponsorId,
            taskId,
            escrowAccountId: escrowAccount._id,
            description: `Released ₦${taskAmount} for completed task`,
            metadata: {
              workerPayment,
              platformCommission,
              workerId,
            },
          },
          {
            type: "task_payment",
            amount: workerPayment,
            userId: workerId,
            taskId,
            description: `Task payment to worker`,
            metadata: {
              taskAmount,
              platformCommission,
              sponsorId,
            },
          },
          {
            type: "task_commission",
            amount: platformCommission,
            taskId,
            description: `Platform commission (${
              this.PLATFORM_COMMISSION_RATE * 100
            }%)`,
            metadata: {
              taskAmount,
              workerPayment,
              sponsorId,
              workerId,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
        workerPayment,
        platformCommission,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Error releasing escrow funds:", error);
      return {
        success: false,
        error: "Failed to release funds. Please try again.",
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Refund reserved funds when task is cancelled
   */
  async refundFunds(
    taskId: string,
    sponsorId: string,
    taskAmount: number
  ): Promise<ReleaseResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const escrowAccount = await EscrowAccount.findOne({
        sponsorId,
      }).session(session);

      if (!escrowAccount) {
        await session.abortTransaction();
        return { success: false, error: "Escrow account not found" };
      }

      // Validate sufficient reserved balance
      if (escrowAccount.reservedBalance < taskAmount) {
        await session.abortTransaction();
        return {
          success: false,
          error: "Insufficient reserved balance for refund",
        };
      }

      // Release the reservation (funds go back to available balance)
      escrowAccount.reservedBalance -= taskAmount;
      await escrowAccount.save({ session });

      // Log the refund
      await FinancialTransaction.create(
        [
          {
            type: "escrow_deposit",
            amount: taskAmount,
            userId: sponsorId,
            taskId,
            escrowAccountId: escrowAccount._id,
            description: `Refunded ₦${taskAmount} from cancelled task`,
            metadata: {
              action: "refund",
              reservedBalance: escrowAccount.reservedBalance,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Error refunding escrow funds:", error);
      return {
        success: false,
        error: "Failed to refund funds. Please try again.",
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Check and notify about low escrow balance
   */
  async checkLowBalance(sponsorId: string, threshold: number = 5000) {
    try {
      const balanceResult = await this.getBalance(sponsorId);

      if (
        balanceResult.success &&
        balanceResult.availableBalance !== undefined
      ) {
        if (balanceResult.availableBalance < threshold) {
          const { NotificationHelpers } = await import(
            "./NotificationHelpers.js"
          );
          await NotificationHelpers.notifyLowEscrowBalance(
            sponsorId,
            balanceResult.availableBalance,
            threshold
          );
        }
      }
    } catch (error) {
      console.log("Failed to check low balance:", error);
    }
  }

  /**
   * Get escrow account balance
   */
  async getBalance(sponsorId: string) {
    try {
      let escrowAccount = await EscrowAccount.findOne({ sponsorId });

      // Auto-create escrow account if it doesn't exist
      if (!escrowAccount) {
        escrowAccount = await EscrowAccount.create({
          sponsorId,
          balance: 0,
          reservedBalance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          status: "active",
        });
        console.log(`✅ Auto-created escrow account for sponsor: ${sponsorId}`);
      }

      const availableBalance =
        escrowAccount.balance - escrowAccount.reservedBalance;

      return {
        success: true,
        balance: escrowAccount.balance,
        availableBalance,
        reservedBalance: escrowAccount.reservedBalance,
        totalDeposited: escrowAccount.totalDeposited,
        totalWithdrawn: escrowAccount.totalWithdrawn,
        status: escrowAccount.status,
      };
    } catch (error) {
      console.error("Error getting escrow balance:", error);
      return {
        success: false,
        error: "Failed to get balance. Please try again.",
      };
    }
  }
}

export const escrowService = new EscrowService();
