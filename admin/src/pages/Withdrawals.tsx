import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";

interface Withdrawal {
  _id: string;
  userId: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
    phoneNumber: string;
  };
  amount: number;
  method: "bank_transfer" | "opay" | "palmpay";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  createdAt: string;
  processedAt?: string;
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    phoneNumber?: string;
  };
  fee: number;
  netAmount: number;
}

export default function Withdrawals() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["withdrawals", page, search, statusFilter, methodFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (methodFilter !== "all") params.method = methodFilter;

      const { data } = await api.get("/admin/withdrawals/pending", { params });
      return data;
    },
  });

  const withdrawalMethods = [
    { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
    { value: "opay", label: "Opay", icon: "💳" },
    { value: "palmpay", label: "PalmPay", icon: "📱" },
  ];

  const handleWithdrawalAction = async (
    withdrawalId: string,
    action: string
  ) => {
    try {
      switch (action) {
        case "approve":
          await api.post(`/admin/withdrawals/${withdrawalId}/approve`);
          toast.success("Withdrawal approved successfully");
          break;
        case "reject":
          await api.post(`/admin/withdrawals/${withdrawalId}/reject`, {
            reason: "Administrative review",
          });
          toast.success("Withdrawal rejected");
          break;
        case "view":
          // Handle view action
          break;
      }
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "processing":
        return "badge-info";
      case "completed":
        return "badge-success";
      case "failed":
        return "badge-error";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "text-blue-600";
      case "opay":
        return "text-green-600";
      case "palmpay":
        return "text-purple-600";
      default:
        return "text-base-content";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleWithdrawalSelection = (withdrawalId: string) => {
    setSelectedWithdrawals((prev) =>
      prev.includes(withdrawalId)
        ? prev.filter((id) => id !== withdrawalId)
        : [...prev, withdrawalId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedWithdrawals.length === data?.data?.withdrawals?.length) {
      setSelectedWithdrawals([]);
    } else {
      setSelectedWithdrawals(
        data?.data?.withdrawals?.map(
          (withdrawal: Withdrawal) => withdrawal._id
        ) || []
      );
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Withdrawals Management
          </h1>
          <p className="text-base-content/70 text-lg">
            Process and manage user withdrawal requests
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline btn-primary">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card bg-base-100 shadow-xl hover-lift">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="form-control flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by user name, email, or reference..."
                  className="input input-bordered w-full pl-12 focus-ring"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="form-control">
              <select
                className="select select-bordered focus-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Method Filter */}
            <div className="form-control">
              <select
                className="select select-bordered focus-ring"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">All Methods</option>
                {withdrawalMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              className="btn btn-outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedWithdrawals.length > 0 && (
        <div className="alert alert-info">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <div className="font-bold">
              {selectedWithdrawals.length} withdrawals selected
            </div>
            <div className="text-xs">Choose an action:</div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-success"
              onClick={() =>
                handleWithdrawalAction(selectedWithdrawals[0], "approve")
              }
            >
              Approve All
            </button>
            <button
              className="btn btn-sm btn-error"
              onClick={() =>
                handleWithdrawalAction(selectedWithdrawals[0], "reject")
              }
            >
              Reject All
            </button>
          </div>
        </div>
      )}

      {/* Withdrawals List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
              <p className="text-base-content/60">Loading withdrawals...</p>
            </div>
          </div>
        ) : data?.data?.withdrawals?.length > 0 ? (
          data.data.withdrawals.map((withdrawal: Withdrawal) => (
            <div
              key={withdrawal._id}
              className="card bg-base-100 shadow-xl hover-lift"
            >
              <div className="card-body">
                {/* Withdrawal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">
                        {withdrawalMethods.find(
                          (m) => m.value === withdrawal.method
                        )?.icon || "💰"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-success">
                          {formatCurrency(withdrawal.amount)}
                        </h3>
                        <span
                          className={`badge ${getStatusColor(
                            withdrawal.status
                          )} badge-sm`}
                        >
                          {withdrawal.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-base-content/70 mb-3">
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-medium ${getMethodColor(
                              withdrawal.method
                            )}`}
                          >
                            {withdrawalMethods.find(
                              (m) => m.value === withdrawal.method
                            )?.label || withdrawal.method}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Requested:{" "}
                            {new Date(
                              withdrawal.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          {withdrawal.userId?.profile?.firstName}{" "}
                          {withdrawal.userId?.profile?.lastName}
                        </span>
                        <span className="text-base-content/60">
                          {" "}
                          • {withdrawal.userId?.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="dropdown dropdown-end">
                    <button
                      tabIndex={0}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <button
                          onClick={() =>
                            handleWithdrawalAction(withdrawal._id, "view")
                          }
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Details
                        </button>
                      </li>
                      {withdrawal.status === "pending" && (
                        <>
                          <li>
                            <button
                              onClick={() =>
                                handleWithdrawalAction(
                                  withdrawal._id,
                                  "approve"
                                )
                              }
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Approve
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() =>
                                handleWithdrawalAction(withdrawal._id, "reject")
                              }
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Reject
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-base-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Account Details</h4>
                    {withdrawal.method === "bank_transfer" ? (
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Bank:</span>{" "}
                          {withdrawal.accountDetails.bankName}
                        </div>
                        <div>
                          <span className="font-medium">Account:</span>{" "}
                          {withdrawal.accountDetails.accountNumber}
                        </div>
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {withdrawal.accountDetails.accountName}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Phone:</span>{" "}
                          {withdrawal.accountDetails.phoneNumber}
                        </div>
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {withdrawal.accountDetails.accountName}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-base-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Transaction Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span>{" "}
                        {formatCurrency(withdrawal.amount)}
                      </div>
                      <div>
                        <span className="font-medium">Fee:</span>{" "}
                        {formatCurrency(withdrawal.fee)}
                      </div>
                      <div>
                        <span className="font-medium">Net Amount:</span>{" "}
                        {formatCurrency(withdrawal.netAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300">
                  <div className="flex items-center gap-4 text-sm text-base-content/60">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        Created:{" "}
                        {new Date(withdrawal.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {withdrawal.processedAt && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          Processed:{" "}
                          {new Date(withdrawal.processedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">No withdrawals found</h3>
            <p className="text-base-content/60">
              No withdrawal requests match your current filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.data?.withdrawals?.length > 0 && (
        <div className="flex justify-center">
          <div className="join">
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              «
            </button>
            <button className="join-item btn btn-sm btn-active">
              Page {page}
            </button>
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.data.pagination.pages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
