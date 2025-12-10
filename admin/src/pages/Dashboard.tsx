import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/60">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Extract data from the backend response structure
  const stats = statsData?.data || {};

  const statCards = [
    {
      title: "Total Users",
      value: stats.users?.total || 0,
      icon: "👥",
      color: "primary",
      gradient: "from-primary to-primary/70",
      trend: "+12%",
      trendUp: true,
      description: "Registered users",
    },
    {
      title: "Active Tasks",
      value: stats.tasks?.active || 0,
      icon: "📋",
      color: "secondary",
      gradient: "from-secondary to-secondary/70",
      trend: "+8%",
      trendUp: true,
      description: "Currently running",
    },
    {
      title: "Pending Withdrawals",
      value: stats.financials?.pendingWithdrawals || 0,
      icon: "💰",
      color: "accent",
      gradient: "from-accent to-accent/70",
      trend: "-5%",
      trendUp: false,
      description: "Awaiting approval",
    },
    {
      title: "Platform Revenue",
      value: `₦${(stats.financials?.totalRevenue || 0).toLocaleString()}`,
      icon: "💵",
      color: "success",
      gradient: "from-success to-success/70",
      trend: "+23%",
      trendUp: true,
      description: "Total platform fees",
    },
  ];

  const quickActions = [
    { title: "View Users", icon: "👥", link: "/users", color: "primary" },
    { title: "Pending Tasks", icon: "📋", link: "/tasks", color: "secondary" },
    { title: "Withdrawals", icon: "💳", link: "/withdrawals", color: "accent" },
    { title: "Analytics", icon: "📊", link: "/analytics", color: "success" },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-base-content/70 text-lg">
            Welcome back! Here's your platform overview.
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export Report
          </button>
          <Link to="/settings" className="btn btn-primary">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className={`stats-card glass-card p-6 hover-lift scale-in bg-gradient-to-br ${stat.gradient} text-white relative overflow-hidden`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <div className="w-full h-full rounded-full bg-white/20 transform translate-x-8 -translate-y-8"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                <div
                  className={`badge ${
                    stat.trendUp ? "badge-success" : "badge-error"
                  } badge-sm`}
                >
                  {stat.trend}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold opacity-90">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-70">{stat.description}</p>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-xl hover-lift">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className={`btn btn-outline btn-${action.color} h-20 flex flex-col gap-2 hover-lift`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-medium">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Statistics */}
        <div className="card bg-base-100 shadow-xl hover-lift">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-xl">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Task Overview
              </h2>
              <Link to="/tasks" className="link link-primary text-sm">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.tasks?.total || 0}
                  </div>
                  <div className="text-sm text-base-content/70">
                    Total Tasks
                  </div>
                </div>
                <div className="text-primary text-2xl">📋</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-success">
                    {stats.tasks?.completed || 0}
                  </div>
                  <div className="text-sm text-base-content/70">
                    Completed Tasks
                  </div>
                </div>
                <div className="text-success text-2xl">✅</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-warning/10 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-warning">
                    {stats.tasks?.active || 0}
                  </div>
                  <div className="text-sm text-base-content/70">
                    Active Tasks
                  </div>
                </div>
                <div className="text-warning text-2xl">⚡</div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="card bg-base-100 shadow-xl hover-lift">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-xl">
                <svg
                  className="w-5 h-5"
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
                Financial Overview
              </h2>
              <Link to="/withdrawals" className="link link-primary text-sm">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-success">
                    ₦{(stats.financials?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-base-content/70">
                    Total Revenue
                  </div>
                </div>
                <div className="text-success text-2xl">💰</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-info/10 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-info">
                    ₦{(stats.financials?.totalPayouts || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-base-content/70">
                    Total Payouts
                  </div>
                </div>
                <div className="text-info text-2xl">💳</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-warning/10 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-warning">
                    ₦
                    {(
                      (stats.financials?.totalRevenue || 0) -
                      (stats.financials?.totalPayouts || 0)
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-base-content/70">
                    Net Revenue
                  </div>
                </div>
                <div className="text-warning text-2xl">📈</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card bg-base-100 shadow-xl hover-lift">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Platform Health
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat bg-success/10 rounded-lg">
              <div className="stat-figure text-success">
                <svg
                  className="w-8 h-8"
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
              </div>
              <div className="stat-title text-success">Users</div>
              <div className="stat-value text-success">
                {stats.users?.active || 0}
              </div>
              <div className="stat-desc text-success">Active users</div>
            </div>

            <div className="stat bg-primary/10 rounded-lg">
              <div className="stat-figure text-primary">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="stat-title text-primary">Tasks</div>
              <div className="stat-value text-primary">
                {stats.tasks?.active || 0}
              </div>
              <div className="stat-desc text-primary">Active tasks</div>
            </div>

            <div className="stat bg-secondary/10 rounded-lg">
              <div className="stat-figure text-secondary">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="stat-title text-secondary">Withdrawals</div>
              <div className="stat-value text-secondary">
                {stats.financials?.pendingWithdrawals || 0}
              </div>
              <div className="stat-desc text-secondary">Pending requests</div>
            </div>

            <div className="stat bg-accent/10 rounded-lg">
              <div className="stat-figure text-accent">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="stat-title text-accent">Revenue</div>
              <div className="stat-value text-accent">
                ₦{(stats.financials?.totalRevenue || 0).toLocaleString()}
              </div>
              <div className="stat-desc text-accent">Platform fees</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
