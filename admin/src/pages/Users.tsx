import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Users as UsersIcon,
  Search,
  MoreHorizontal,
  Ban,
  UserCheck,
  UserX,
  Eye,
} from "lucide-react";
import {
  useUsers,
  useSuspendUser,
  useBanUser,
  useReactivateUser,
} from "../hooks/useAdminData";

const UserManagement: React.FC = () => {
  const location = useLocation();

  // Determine status from route
  const routeStatus = location.pathname.includes("/users/active")
    ? "active"
    : location.pathname.includes("/users/suspended")
    ? "suspended"
    : "";

  const [filters, setFilters] = useState({
    search: "",
    status: routeStatus,
    role: "",
    page: 1,
    limit: 20,
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

  const { data: usersData, isLoading, error } = useUsers(filters);
  const suspendUser = useSuspendUser();
  const banUser = useBanUser();
  const reactivateUser = useReactivateUser();

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSuspendUser = async (userId: string) => {
    const reason = prompt("Please provide a reason for suspending this user:");
    if (reason) {
      await suspendUser.mutateAsync({ userId, reason });
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt("Please provide a reason for banning this user:");
    if (reason) {
      await banUser.mutateAsync({ userId, reason });
    }
  };

  const handleReactivateUser = async (userId: string) => {
    if (confirm("Are you sure you want to reactivate this user?")) {
      await reactivateUser.mutateAsync(userId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <div className="badge badge-success">Active</div>;
      case "suspended":
        return <div className="badge badge-warning">Suspended</div>;
      case "banned":
        return <div className="badge badge-error">Banned</div>;
      default:
        return <div className="badge badge-ghost">{status}</div>;
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("admin"))
      return <div className="badge badge-primary">Admin</div>;
    if (roles.includes("sponsor"))
      return <div className="badge badge-info">Sponsor</div>;
    if (roles.includes("worker"))
      return <div className="badge badge-success">Worker</div>;
    return <div className="badge badge-ghost">User</div>;
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
        <UsersIcon className="w-5 h-5" />
        <span>Failed to load users. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            User Management
          </h1>
          <p className="text-base-content/60">
            Manage platform users and their permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input input-bordered pl-10 w-full"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="sponsor">Sponsor</option>
                <option value="worker">Worker</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">&nbsp;</span>
              </label>
              <button
                className="btn btn-outline"
                onClick={() =>
                  setFilters({
                    search: "",
                    status: "",
                    role: "",
                    page: 1,
                    limit: 20,
                  })
                }
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>KYC</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="text-base-content/60">No users found</div>
                    </td>
                  </tr>
                ) : (
                  users.map(
                    (user: {
                      _id: string;
                      profile?: { firstName?: string; lastName?: string };
                      email: string;
                      phoneNumber: string;
                      status: string;
                      roles: string[];
                      isKYCVerified: boolean;
                      walletId?: { availableBalance?: number };
                    }) => (
                      <tr key={user._id}>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-8">
                                <span className="text-xs">
                                  {user.profile?.firstName?.[0]}
                                  {user.profile?.lastName?.[0]}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.profile?.firstName}{" "}
                                {user.profile?.lastName}
                              </div>
                              <div className="text-sm text-base-content/60">
                                ID: {user._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>{getRoleBadge(user.roles)}</td>
                        <td>
                          {user.isKYCVerified ? (
                            <div className="badge badge-success badge-sm">
                              Verified
                            </div>
                          ) : (
                            <div className="badge badge-warning badge-sm">
                              Pending
                            </div>
                          )}
                        </td>
                        <td>
                          ₦
                          {user.walletId?.availableBalance?.toLocaleString() ||
                            "0"}
                        </td>
                        <td>
                          <div className="dropdown dropdown-end">
                            <label
                              tabIndex={0}
                              className="btn btn-ghost btn-sm"
                            >
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
                              {user.status === "active" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleSuspendUser(user._id)
                                      }
                                    >
                                      <UserX className="w-4 h-4" />
                                      Suspend User
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => handleBanUser(user._id)}
                                    >
                                      <Ban className="w-4 h-4" />
                                      Ban User
                                    </button>
                                  </li>
                                </>
                              )}
                              {(user.status === "suspended" ||
                                user.status === "banned") && (
                                <li>
                                  <button
                                    onClick={() =>
                                      handleReactivateUser(user._id)
                                    }
                                  >
                                    <UserCheck className="w-4 h-4" />
                                    Reactivate User
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )
                  )
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

export default UserManagement;
