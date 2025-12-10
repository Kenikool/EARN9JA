import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";

interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  taskType: string;
  reward: number;
  totalSlots: number;
  availableSlots: number;
  completedSlots: number;
  estimatedTime: number;
  status: "draft" | "active" | "paused" | "completed" | "expired" | "cancelled";
  expiresAt: string;
  createdAt: string;
  sponsorId: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
}

export default function Tasks() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tasks", page, search, statusFilter, categoryFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;

      const { data } = await api.get("/admin/tasks/pending", { params });
      return data;
    },
  });

  const categories = [
    "social_media",
    "music",
    "survey",
    "review",
    "game",
    "ads",
  ];

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      switch (action) {
        case "approve":
          await api.post(`/admin/tasks/${taskId}/approve`);
          toast.success("Task approved successfully");
          break;
        case "reject":
          await api.post(`/admin/tasks/${taskId}/reject`, {
            reason: "Administrative review",
          });
          toast.success("Task rejected");
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
      case "active":
        return "badge-success";
      case "paused":
        return "badge-warning";
      case "completed":
        return "badge-info";
      case "draft":
        return "badge-neutral";
      case "expired":
        return "badge-error";
      case "cancelled":
        return "badge-error";
      case "pending_approval":
        return "badge-warning";
      default:
        return "badge-neutral";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "social_media":
        return "text-blue-600";
      case "music":
        return "text-green-600";
      case "survey":
        return "text-purple-600";
      case "review":
        return "text-orange-600";
      case "game":
        return "text-red-600";
      case "ads":
        return "text-indigo-600";
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

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Tasks Management
          </h1>
          <p className="text-base-content/70 text-lg">
            Review and manage task submissions
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
            Export Tasks
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
                  placeholder="Search tasks by title or description..."
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
                <option value="pending_approval">Pending Approval</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="form-control">
              <select
                className="select select-bordered focus-ring"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
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

      {/* Tasks List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
              <p className="text-base-content/60">Loading tasks...</p>
            </div>
          </div>
        ) : data?.data?.tasks?.length > 0 ? (
          data.data.tasks.map((task: Task) => (
            <div
              key={task._id}
              className="card bg-base-100 shadow-xl hover-lift"
            >
              <div className="card-body">
                {/* Task Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">
                        {task.metadata?.icon || "📋"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{task.title}</h3>
                        <span
                          className={`badge ${getStatusColor(
                            task.status
                          )} badge-sm`}
                        >
                          {task.status?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-base-content/70 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-medium ${getCategoryColor(
                              task.category
                            )}`}
                          >
                            {task.category
                              ?.replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <span>•</span>
                          <span>{task.platform}</span>
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{task.estimatedTime} min</span>
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
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          <span className="font-bold text-success">
                            {formatCurrency(task.reward)}
                          </span>
                        </div>
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
                          onClick={() => handleTaskAction(task._id, "view")}
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
                      {task.status === "pending_approval" && (
                        <>
                          <li>
                            <button
                              onClick={() =>
                                handleTaskAction(task._id, "approve")
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
                                handleTaskAction(task._id, "reject")
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

                {/* Task Progress */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">Total Slots</div>
                    <div className="stat-value text-lg">{task.totalSlots}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">Completed</div>
                    <div className="stat-value text-lg text-success">
                      {task.completedSlots}
                    </div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">Available</div>
                    <div className="stat-value text-lg text-primary">
                      {task.availableSlots}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {task.totalSlots > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-base-content/60 mb-1">
                      <span>Progress</span>
                      <span>
                        {calculateProgress(
                          task.completedSlots,
                          task.totalSlots
                        )}
                        %
                      </span>
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={task.completedSlots}
                      max={task.totalSlots}
                    ></progress>
                  </div>
                )}

                {/* Task Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300">
                  <div className="flex items-center gap-4 text-sm text-base-content/60">
                    <div className="flex items-center gap-1">
                      <span>By:</span>
                      <span className="font-medium">
                        {task.sponsorId?.profile?.firstName}{" "}
                        {task.sponsorId?.profile?.lastName}
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
                        Created: {new Date(task.createdAt).toLocaleDateString()}
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Expires: {new Date(task.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">No tasks found</h3>
            <p className="text-base-content/60">
              No tasks match your current filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.data?.tasks?.length > 0 && (
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
