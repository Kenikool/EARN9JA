import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { Transaction } from "../models/Transaction.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { Dispute } from "../models/Dispute.js";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

interface SearchResults {
  query: string;
  results: SearchResult[];
  totalResults: number;
  resultsByType: {
    users: number;
    tasks: number;
    transactions: number;
    withdrawals: number;
    disputes: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
}

class SearchService {
  async search(
    query: string,
    type?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResults> {
    const searchRegex = new RegExp(query, "i");
    const skip = (page - 1) * limit;

    let results: SearchResult[] = [];
    const resultsByType = {
      users: 0,
      tasks: 0,
      transactions: 0,
      withdrawals: 0,
      disputes: 0,
    };

    // Search Users
    if (!type || type === "users") {
      const users = await User.find({
        $or: [
          { email: searchRegex },
          { phoneNumber: searchRegex },
          { "profile.firstName": searchRegex },
          { "profile.lastName": searchRegex },
          { referralCode: searchRegex },
        ],
      })
        .limit(type ? limit : 10)
        .lean();

      resultsByType.users = users.length;

      results.push(
        ...users.map((user) => ({
          type: "user",
          id: user._id.toString(),
          title: `${user.profile.firstName} ${user.profile.lastName}`,
          description: user.email,
          metadata: {
            phoneNumber: user.phoneNumber,
            roles: user.roles,
            status: user.status,
            isKYCVerified: user.isKYCVerified,
          },
          createdAt: user.createdAt,
        }))
      );
    }

    // Search Tasks
    if (!type || type === "tasks") {
      const tasks = await Task.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
        ],
      })
        .limit(type ? limit : 10)
        .lean();

      resultsByType.tasks = tasks.length;

      results.push(
        ...tasks.map((task) => ({
          type: "task",
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          metadata: {
            category: task.category,
            status: task.status,
            reward: task.reward,
            totalSlots: task.totalSlots,
          },
          createdAt: task.createdAt,
        }))
      );
    }

    // Search Transactions
    if (!type || type === "transactions") {
      const transactions = await Transaction.find({
        $or: [
          { transactionId: searchRegex },
          { description: searchRegex },
          { reference: searchRegex },
        ],
      })
        .populate("userId", "profile.firstName profile.lastName email")
        .limit(type ? limit : 10)
        .lean();

      resultsByType.transactions = transactions.length;

      results.push(
        ...transactions.map((txn: any) => ({
          type: "transaction",
          id: txn._id.toString(),
          title: `Transaction ${txn.transactionId}`,
          description: txn.description || txn.type,
          metadata: {
            type: txn.type,
            amount: txn.amount,
            status: txn.status,
            user: txn.userId
              ? `${txn.userId.profile?.firstName} ${txn.userId.profile?.lastName}`
              : "Unknown",
          },
          createdAt: txn.createdAt,
        }))
      );
    }

    // Search Withdrawals
    if (!type || type === "withdrawals") {
      const withdrawals = await Withdrawal.find({
        $or: [
          { reference: searchRegex },
          { "bankDetails.accountNumber": searchRegex },
        ],
      })
        .populate("userId", "profile.firstName profile.lastName email")
        .limit(type ? limit : 10)
        .lean();

      resultsByType.withdrawals = withdrawals.length;

      results.push(
        ...withdrawals.map((withdrawal: any) => ({
          type: "withdrawal",
          id: withdrawal._id.toString(),
          title: `Withdrawal ${withdrawal.reference}`,
          description: `₦${withdrawal.amount.toLocaleString()}`,
          metadata: {
            amount: withdrawal.amount,
            status: withdrawal.status,
            user: withdrawal.userId
              ? `${withdrawal.userId.profile?.firstName} ${withdrawal.userId.profile?.lastName}`
              : "Unknown",
            bankName: withdrawal.bankDetails?.bankName,
          },
          createdAt: withdrawal.createdAt,
        }))
      );
    }

    // Search Disputes
    if (!type || type === "disputes") {
      const disputes = await Dispute.find({
        $or: [{ reason: searchRegex }, { description: searchRegex }],
      })
        .populate("taskId", "title")
        .populate("serviceWorkerId", "profile.firstName profile.lastName")
        .populate("sponsorId", "profile.firstName profile.lastName")
        .limit(type ? limit : 10)
        .lean();

      resultsByType.disputes = disputes.length;

      results.push(
        ...disputes.map((dispute: any) => ({
          type: "dispute",
          id: dispute._id.toString(),
          title: `Dispute: ${dispute.reason}`,
          description: dispute.description || "No description",
          metadata: {
            status: dispute.status,
            task: dispute.taskId?.title,
            serviceWorker: dispute.serviceWorkerId
              ? `${dispute.serviceWorkerId.profile?.firstName} ${dispute.serviceWorkerId.profile?.lastName}`
              : "Unknown",
          },
          createdAt: dispute.createdAt,
        }))
      );
    }

    // Sort by relevance and date
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginate
    const totalResults = results.length;
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      query,
      results: paginatedResults,
      totalResults,
      resultsByType,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        itemsPerPage: limit,
      },
    };
  }
}

export default new SearchService();
