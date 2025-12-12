import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";

interface StatsCard {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RecentActivity {
  id: string;
  type: "user" | "task" | "withdrawal" | "dispute";
  title: string;
  description: string;
  time: string;
  status: "pending" | "completed" | "rejected";
}

const Dashboard: React.FC = () => {
  const [stats] = useState<StatsCard[]>([
    {
      title: "Total Users",
      value: "12,345",
      change: "+12.5%",
      changeType: "increase",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Tasks",
      value: "1,234",
      change: "+8.2%",
      changeType: "increase",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Total Revenue",
      value: "₦45,678",
      change: "+23.1%",
      changeType: "increase",
      icon: DollarSign,
      color: "bg-yellow-500",
    },
    {
      title: "Conversion Rate",
      value: "4.7%",
      change: "-2.1%",
      changeType: "decrease",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "user",
      title: "New user registration",
      description: "John Doe registered successfully",
      time: "2 minutes ago",
      status: "completed",
    },
    {
      id: "2",
      type: "task",
      title: "Task submitted",
      description: "Social media engagement task pending review",
      time: "5 minutes ago",
      status: "pending",
    },
    {
      id: "3",
      type: "withdrawal",
      title: "Withdrawal request",
      description: "Jane Smith requested ₦5,000 withdrawal",
      time: "10 minutes ago",
      status: "pending",
    },
    {
      id: "4",
      type: "dispute",
      title: "Dispute resolved",
      description: "Task completion dispute was resolved",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: "5",
      type: "task",
      title: "Task approved",
      description: "Survey task approved and published",
      time: "2 hours ago",
      status: "completed",
    },
  ]);

  const [quickActions] = useState([
    {
      title: "Create Task",
      description: "Add new task to platform",
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      title: "User Management",
      description: "Manage platform users",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Review Withdrawals",
      description: "Process pending withdrawals",
      icon: DollarSign,
      color: "bg-yellow-500",
    },
    {
      title: "View Analytics",
      description: "Check platform statistics",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="w-4 h-4" />;
      case "task":
        return <FileText className="w-4 h-4" />;
      case "withdrawal":
        return <DollarSign className="w-4 h-4" />;
      case "dispute":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <div className="badge badge-success badge-sm">Completed</div>;
      case "pending":
        return <div className="badge badge-warning badge-sm">Pending</div>;
      case "rejected":
        return <div className="badge badge-error badge-sm">Rejected</div>;
      default:
        return <div className="badge badge-ghost badge-sm">Unknown</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-blue-100">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "increase"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
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
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">Recent Activities</h2>
                <Link
                  to="/dashboard/activities"
                  className="btn btn-ghost btn-sm"
                >
                  View All
                  <Eye className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body">
              <h2 className="card-title mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="btn btn-ghost justify-start h-auto p-4 text-left"
                  >
                    <div className={`${action.color} p-2 rounded-lg mr-3`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-gray-500">
                        {action.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <h2 className="card-title">Pending Approvals</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Task Submissions</p>
                    <p className="text-xs text-gray-600">
                      12 tasks pending review
                    </p>
                  </div>
                </div>
                <div className="badge badge-warning">12</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">User Verifications</p>
                    <p className="text-xs text-gray-600">
                      5 users awaiting approval
                    </p>
                  </div>
                </div>
                <div className="badge badge-info">5</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Withdrawal Requests</p>
                    <p className="text-xs text-gray-600">
                      3 requests to process
                    </p>
                  </div>
                </div>
                <div className="badge badge-success">3</div>
              </div>
            </div>
            <div className="card-actions justify-end mt-4">
              <Link
                to="/dashboard/approvals"
                className="btn btn-primary btn-sm"
              >
                View All Pending
              </Link>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <h2 className="card-title">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Server Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Gateway</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-yellow-600">Maintenance</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Service</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>
            <div className="card-actions justify-end mt-4">
              <Link
                to="/dashboard/platform/status"
                className="btn btn-outline btn-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
