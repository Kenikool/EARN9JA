import React, { useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Eye } from "lucide-react";
import { usePlatformStats, useRevenueReport } from "../hooks/useAdminData";

const Analytics: React.FC = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dateRange, setDateRange] = useState({
    startDate: thirtyDaysAgo.toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: statsData, isLoading: statsLoading } = usePlatformStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport(
    dateRange.startDate,
    dateRange.endDate
  );

  const stats = statsData?.data;
  const revenue = Array.isArray(revenueData?.data) ? revenueData.data : [];

  const totalRevenue = revenue.reduce(
    (sum: number, item: { total?: number }) => sum + (item.total || 0),
    0
  );

  if (statsLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Platform performance and insights</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">&nbsp;</span>
              </label>
              <button className="btn btn-primary">Apply</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.users.total.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.users.active.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.tasks.total.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <h2 className="card-title mb-4">Revenue Over Time</h2>
          {revenue.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No revenue data for selected period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Revenue</th>
                    <th>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map(
                    (
                      item: {
                        _id: { year: number; month: number; day: number };
                        total: number;
                        count: number;
                      },
                      index: number
                    ) => (
                      <tr key={index}>
                        <td>
                          {item._id.year}-
                          {String(item._id.month).padStart(2, "0")}-
                          {String(item._id.day).padStart(2, "0")}
                        </td>
                        <td className="font-semibold">
                          ₦{item.total.toLocaleString()}
                        </td>
                        <td>{item.count}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <h2 className="card-title mb-4">Task Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Tasks</span>
                <span className="font-semibold">
                  {stats?.tasks.total.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Tasks</span>
                <span className="font-semibold text-green-600">
                  {stats?.tasks.active.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed Tasks</span>
                <span className="font-semibold text-blue-600">
                  {stats?.tasks.completed.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <h2 className="card-title mb-4">Financial Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-semibold text-green-600">
                  ₦{stats?.financials.totalRevenue.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Payouts</span>
                <span className="font-semibold text-red-600">
                  ₦{stats?.financials.totalPayouts.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Withdrawals</span>
                <span className="font-semibold text-yellow-600">
                  {stats?.financials.pendingWithdrawals || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
