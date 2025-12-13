import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";
import {
  usePlatformStats,
  usePendingTasks,
  usePendingWithdrawals,
  usePendingDisputes,
} from "../hooks/useAdminData";

const Dashboard: React.FC = () => {
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = usePlatformStats();
  const { data: tasksData, isLoading: tasksLoading } = usePendingTasks(1, 5);
  const { data: withdrawalsData, isLoading: withdrawalsLoading } =
    usePendingWithdrawals(1, 5);
  const { data: disputesData } = usePendingDisputes(1, 5);

  const stats = statsData?.data;
  const pendingTasks = tasksData?.data?.tasks || [];
  const pendingWithdrawals = withdrawalsData?.data?.withdrawals || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="alert alert-error">
        <AlertTriangle className="w-5 h-5" />
        <span>Failed to load dashboard data. Please try again.</span>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.users.total?.toLocaleString() || "0",
      change: "+12.5%",
      changeType: "increase" as const,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Tasks",
      value: stats?.tasks.active?.toLocaleString() || "0",
      change: "+8.2%",
      changeType: "increase" as const,
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Total Revenue",
      value: `₦${stats?.financials.totalRevenue?.toLocaleString() || "0"}`,
      change: "+23.1%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "bg-yellow-500",
    },
    {
      title: "Completed Tasks",
      value: stats?.tasks.completed?.toLocaleString() || "0",
      change: "+15.3%",
      changeType: "increase" as const,
      icon: CheckCircle,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Earn9ja Admin!</h1>
        <p className="text-blue-100">
          Monitor and manage your platform from this dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="card bg-white shadow-sm border border-gray-200"
          >
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === "increase" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : null}
                    <span className="text-sm font-medium text-green-500">
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Pending Tasks</h2>
              <Link
                to="/dashboard/tasks/pending"
                className="btn btn-ghost btn-sm"
              >
                View All
                <Eye className="w-4 h-4 ml-1" />
              </Link>
            </div>
            {tasksLoading ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner"></div>
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task: any) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {task.category} • ₦{task.reward}
                      </p>
                    </div>
                    <div className="badge badge-warning badge-sm">Pending</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Pending Withdrawals</h2>
              <Link
                to="/dashboard/withdrawals/pending"
                className="btn btn-ghost btn-sm"
              >
                View All
                <Eye className="w-4 h-4 ml-1" />
              </Link>
            </div>
            {withdrawalsLoading ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner"></div>
              </div>
            ) : pendingWithdrawals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No pending withdrawals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWithdrawals.map((withdrawal: any) => (
                  <div
                    key={withdrawal._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {withdrawal.userId?.profile?.firstName}{" "}
                        {withdrawal.userId?.profile?.lastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        ₦{withdrawal.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="badge badge-warning badge-sm">Pending</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <h2 className="card-title mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/dashboard/users"
                className="btn btn-ghost justify-start h-auto p-4 text-left w-full"
              >
                <div className="bg-blue-500 p-2 rounded-lg mr-3">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">User Management</div>
                  <div className="text-xs text-gray-500">
                    Manage platform users
                  </div>
                </div>
              </Link>
              <Link
                to="/dashboard/tasks"
                className="btn btn-ghost justify-start h-auto p-4 text-left w-full"
              >
                <div className="bg-green-500 p-2 rounded-lg mr-3">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Task Approval</div>
                  <div className="text-xs text-gray-500">
                    Review pending tasks
                  </div>
                </div>
              </Link>
              <Link
                to="/dashboard/analytics"
                className="btn btn-ghost justify-start h-auto p-4 text-left w-full"
              >
                <div className="bg-purple-500 p-2 rounded-lg mr-3">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Analytics</div>
                  <div className="text-xs text-gray-500">
                    View platform analytics
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Summary */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <h2 className="card-title">Pending Approvals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Task Submissions</p>
                  <p className="text-xs text-gray-600">
                    {tasksData?.data?.pagination?.total || 0} tasks pending
                  </p>
                </div>
              </div>
              <div className="badge badge-warning">
                {tasksData?.data?.pagination?.total || 0}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Withdrawal Requests</p>
                  <p className="text-xs text-gray-600">
                    {withdrawalsData?.data?.pagination?.total || 0} requests
                  </p>
                </div>
              </div>
              <div className="badge badge-success">
                {withdrawalsData?.data?.pagination?.total || 0}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Disputes</p>
                  <p className="text-xs text-gray-600">
                    {disputesData?.data?.pagination?.total || 0} disputes
                  </p>
                </div>
              </div>
              <div className="badge badge-error">
                {disputesData?.data?.pagination?.total || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
