import React, { useState } from "react";
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  usePendingTasks,
  useApproveTask,
  useRejectTask,
} from "../hooks/useAdminData";

const Tasks: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });

  const {
    data: tasksData,
    isLoading,
    error,
  } = usePendingTasks(filters.page, filters.limit);
  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const tasks = tasksData?.data?.tasks || [];
  const pagination = tasksData?.data?.pagination;

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
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
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Review and approve pending tasks</p>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-6">
        {tasks.length === 0 ? (
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No pending tasks</p>
            </div>
          </div>
        ) : (
          tasks.map((task: any) => (
            <div
              key={task._id}
              className="card bg-white shadow-sm border border-gray-200"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="badge badge-primary">{task.category}</div>
                      <span className="text-sm text-gray-600">
                        Reward: ₦{task.reward.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">
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
                          className="text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve Task
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleRejectTask(task._id)}
                          className="text-red-600"
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
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
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
