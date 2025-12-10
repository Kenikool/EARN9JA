import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  status: string;
  isKYCVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  walletId?: {
    availableBalance: number;
    lifetimeEarnings: number;
  };
}

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", page, search, statusFilter, roleFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (roleFilter !== "all") params.role = roleFilter;

      const { data } = await api.get("/admin/users", { params });
      return data;
    },
  });

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case "suspend":
          await api.post(`/admin/users/${userId}/suspend`, {
            reason: "Administrative action",
          });
          toast.success("User suspended successfully");
          break;
        case "ban":
          await api.post(`/admin/users/${userId}/ban`, {
            reason: "Administrative action",
          });
          toast.success("User banned successfully");
          break;
        case "reactivate":
          await api.post(`/admin/users/${userId}/reactivate`);
          toast.success("User reactivated successfully");
          break;
      }
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === data?.data?.users?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data?.data?.users?.map((user: User) => user._id) || []);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "badge-success";
      case "suspended":
        return "badge-warning";
      case "banned":
        return "badge-error";
      case "pending_verification":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Users Management
          </h1>
          <p className="text-base-content/70 text-lg">
            Manage and monitor all platform users
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
            Export Users
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
                  placeholder="Search users by name, email, or phone..."
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
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="pending_verification">
                  Pending Verification
                </option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="form-control">
              <select
                className="select select-bordered focus-ring"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="service_worker">Service Worker</option>
                <option value="sponsor">Sponsor</option>
                <option value="admin">Admin</option>
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
      {selectedUsers.length > 0 && (
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
              {selectedUsers.length} users selected
            </div>
            <div className="text-xs">Choose an action:</div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleUserAction(selectedUsers[0], "suspend")}
            >
              Suspend
            </button>
            <button
              className="btn btn-sm btn-error"
              onClick={() => handleUserAction(selectedUsers[0], "ban")}
            >
              Ban
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl hover-lift">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                <p className="text-base-content/60">Loading users...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-enhanced">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={
                          selectedUsers.length === data?.data?.users?.length &&
                          data?.data?.users?.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>KYC</th>
                    <th>Wallet Balance</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.users?.map((user: User) => (
                    <tr
                      key={user._id}
                      className="hover:bg-base-200/50 transition-colors"
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                              {user.profile?.avatar ? (
                                <img src={user.profile.avatar} alt="Avatar" />
                              ) : (
                                <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center font-bold">
                                  {user.profile?.firstName?.[0]}
                                  {user.profile?.lastName?.[0]}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">
                              {user.profile?.firstName} {user.profile?.lastName}
                            </div>
                            <div className="text-sm text-base-content/60">
                              ID: {user._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-base-content/60">
                            {user.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <span
                              key={role}
                              className={`badge badge-sm ${
                                role === "admin"
                                  ? "badge-error"
                                  : role === "sponsor"
                                  ? "badge-warning"
                                  : "badge-primary"
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="status-badge">
                          <span
                            className={`badge ${getStatusColor(
                              user.status
                            )} badge-sm`}
                          >
                            {user.status?.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {user.isKYCVerified ? (
                            <div className="badge badge-success badge-sm">
                              <svg
                                className="w-3 h-3 mr-1"
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
                              Verified
                            </div>
                          ) : (
                            <div className="badge badge-warning badge-sm">
                              Pending
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-success">
                          {formatCurrency(user.walletId?.availableBalance || 0)}
                        </div>
                        <div className="text-xs text-base-content/60">
                          Earned:{" "}
                          {formatCurrency(user.walletId?.lifetimeEarnings || 0)}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-base-content/60">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </div>
                      </td>
                      <td>
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
                                  handleUserAction(user._id, "view")
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
                            {user.status === "active" && (
                              <>
                                <li>
                                  <button
                                    onClick={() =>
                                      handleUserAction(user._id, "suspend")
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
                                    Suspend
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() =>
                                      handleUserAction(user._id, "ban")
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
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                                      />
                                    </svg>
                                    Ban
                                  </button>
                                </li>
                              </>
                            )}
                            {(user.status === "suspended" ||
                              user.status === "banned") && (
                              <li>
                                <button
                                  onClick={() =>
                                    handleUserAction(user._id, "reactivate")
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
                                  Reactivate
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-base-content/60">No users found</p>
                        <p className="text-sm text-base-content/40 mt-2">
                          Try adjusting your search or filter criteria
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data?.data?.users?.length > 0 && (
            <div className="p-4 border-t border-base-300">
              <div className="flex justify-between items-center">
                <div className="text-sm text-base-content/60">
                  Showing {(page - 1) * 20 + 1} to{" "}
                  {Math.min(page * 20, data.data.pagination.total)} of{" "}
                  {data.data.pagination.total} users
                </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
