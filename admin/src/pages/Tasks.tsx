import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { useTasks, useApproveTask, useRejectTask } from "../hooks/useAdminData";

const Tasks: React.FC = () => {
  const location = useLocation();

  // Determine status from route
  const routeStatus = location.pathname.includes("/tasks/pending")
    ? "pending"
    : location.pathname.includes("/tasks/approved")
    ? "approved"
    : location.pathname.includes("/tasks/rejected")
    ? "rejected"
    : "";

  const [filters, setFilters] = useState({
    status: routeStatus,
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

  const {
    data: tasksData,
    isLoading,
    error,
  } = useTasks(filters.page, filters.limit, filters.status);
  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const tasks = tasksData?.data?.tasks || [];
  const pagination = tasksData?.data?.pagination;

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleApproveTask = async (taskId: string) => {
    if (confirm("Are you sure you want to approve this task?")) {
      await approveTask.mutateAsync(taskId);
    }
  };

  const handleRejectTask = async (taskId: string) => {
    const reason = prompt("Please provide a reason for rejecting this task:");
    if (reason) {
      await rejectTask.mutateAsync({ taskId, reason });
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
        <FileText className="w-5 h-5" />
        <span>Failed to load tasks. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            Task Management
          </h1>
          <p className="text-base-content/60">
            Review and approve {filters.status || "all"} tasks
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
                <option value="">All Tasks</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
                    status: "",
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

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-6">
        {tasks.length === 0 ? (
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
              <p className="text-base-content/60">
                No {filters.status || "available"} tasks
              </p>
            </div>
          </div>
        ) : (
          tasks.map(
            (task: {
              _id: string;
              title: string;
              description: string;
              category: string;
              reward: number;
              sponsorId?: {
                profile?: {
                  firstName?: string;
                  lastName?: string;
                };
              };
            }) => (
              <div
                key={task._id}
                className="card bg-base-100 shadow-sm border border-base-300"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-base-content">
                        {task.title}
                      </h3>
                      <p className="text-sm text-base-content/60 mt-1">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="badge badge-primary">
                          {task.category}
                        </div>
                        <span className="text-sm text-base-content/60">
                          Reward: ₦{task.reward.toLocaleString()}
                        </span>
                        <span className="text-sm text-base-content/60">
                          By: {task.sponsorId?.profile?.firstName}{" "}
                          {task.sponsorId?.profile?.lastName}
                        </span>
                      </div>
                    </div>
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
                            onClick={() => handleApproveTask(task._id)}
                            className="text-success"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve Task
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleRejectTask(task._id)}
                            className="text-error"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Task
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/60">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="join">
            <button
              className="btn join-item"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              «
            </button>
            <button className="btn join-item">Page {pagination.page}</button>
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
  );
};

export default Tasks;
