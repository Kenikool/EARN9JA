import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { TrendingUp, DollarSign, CreditCard, Download } from "lucide-react";
import { useRevenueReport } from "../hooks/useAdminData";

const Revenue: React.FC = () => {
  const location = useLocation();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dateRange, setDateRange] = useState({
    startDate: thirtyDaysAgo.toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: revenueData, isLoading } = useRevenueReport(
    dateRange.startDate,
    dateRange.endDate
  );

  const revenue = Array.isArray(revenueData?.data) ? revenueData.data : [];
  const totalRevenue = revenue.reduce(
    (sum: number, item: { total?: number }) => sum + (item.total || 0),
    0
  );

  // Determine which view to show based on route
  const isPaymentsView = location.pathname.includes("/revenue/payments");
  const isCommissionView = location.pathname.includes("/revenue/commission");

  if (isLoading) {
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
          <h1 className="text-2xl font-bold">
            {isPaymentsView
              ? "Payment History"
              : isCommissionView
              ? "Commission Report"
              : "Revenue Report"}
          </h1>
          <p className="text-base-content/70">
            {isPaymentsView
              ? "Track all payment transactions"
              : isCommissionView
              ? "Platform commission breakdown"
              : "Platform revenue analytics"}
          </p>
        </div>
        <button className="btn btn-primary">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="card bg-base-100 shadow-sm">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₦{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-success/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold">
                  {revenue.reduce(
                    (sum: number, item: { count?: number }) =>
                      sum + (item.count || 0),
                    0
                  )}
                </p>
              </div>
              <div className="bg-info/20 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-info" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Avg Transaction</p>
                <p className="text-2xl font-bold">
                  ₦
                  {revenue.length > 0
                    ? Math.round(
                        totalRevenue /
                          revenue.reduce(
                            (sum: number, item: { count?: number }) =>
                              sum + (item.count || 0),
                            0
                          )
                      ).toLocaleString()
                    : 0}
                </p>
              </div>
              <div className="bg-warning/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-4">
            {isPaymentsView
              ? "Payment Transactions"
              : isCommissionView
              ? "Commission Breakdown"
              : "Revenue Details"}
          </h2>
          {revenue.length === 0 ? (
            <div className="text-center py-12 text-base-content/50">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
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
                    <th>Avg Amount</th>
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
                        <td className="font-semibold text-success">
                          ₦{item.total.toLocaleString()}
                        </td>
                        <td>{item.count}</td>
                        <td>
                          ₦
                          {Math.round(item.total / item.count).toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Revenue;
