import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  usePendingWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
} from "../hooks/useAdminData";

const Withdrawals: React.FC = () => {
  const location = useLocation();

  // Determine status from route
  const routeStatus = location.pathname.includes("/withdrawals/pending")
    ? "pending"
    : location.pathname.includes("/withdrawals/approved")
    ? "approved"
    : location.pathname.includes("/withdrawals/rejected")
    ? "rejected"
    : "pending";

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: routeStatus,
  });

  // Sync filter status with route when route changes
  React.useEffect(() => {
    if (filters.status !== routeStatus) {
      setFilters((prev) => ({
        ...prev,
        status: routeStatus,
        page: 1,
      }));
    }
  }, [routeStatus, filters.status]);

  const {
    data: withdrawalsData,
    isLoading,
    error,
  } = usePendingWithdrawals(filters.page, filters.limit);
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();

  const withdrawals = withdrawalsData?.data?.withdrawals || [];
  const pagination = withdrawalsData?.data?.pagination;

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    if (confirm("Are you sure you want to approve this withdrawal?")) {
      await approveWithdrawal.mutateAsync(withdrawalId);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const reason = prompt(
      "Please provide a reason for rejecting this withdrawal:"
    );
    if (reason) {
      await rejectWithdrawal.mutateAsync({ withdrawalId, reason });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <DollarSign className="w-5 h-5" />
        <span>Failed to load withdrawals. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Withdrawal Management</h1>
          <p className="text-base-content/70">
            Review and process {filters.status} withdrawals
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Account Details</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="text-base-content/60">
                        No {filters.status} withdrawals
                      </div>
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal: unknown) => (
                    <tr key={withdrawal._id}>
                      <td>
                        <div>
                          <div className="font-medium">
                            {withdrawal.userId?.profile?.firstName}{" "}
                            {withdrawal.userId?.profile?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {withdrawal.userId?.email}
                          </div>
                        </div>
                      </td>
                      <td className="font-semibold">
                        ₦{withdrawal.amount.toLocaleString()}
                      </td>
                      <td>
                        <div className="badge badge-info">
                          {withdrawal.method}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {withdrawal.accountDetails?.accountNumber && (
                            <div>
                              {withdrawal.accountDetails.accountNumber} -{" "}
                              {withdrawal.accountDetails.bankName}
                            </div>
                          )}
                          {withdrawal.accountDetails?.phoneNumber && (
                            <div>{withdrawal.accountDetails.phoneNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="text-sm">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-ghost btn-sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </label>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                          >
                            <li>
                              <button>
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  handleApproveWithdrawal(withdrawal._id)
                                }
                                className="text-success"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  handleRejectWithdrawal(withdrawal._id)
                                }
                                className="text-error"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-base-content/60">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
              <div className="join">
                <button
                  className="btn join-item"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  «
                </button>
                <button className="btn join-item">
                  Page {pagination.page}
                </button>
                <button
                  className="btn join-item"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
