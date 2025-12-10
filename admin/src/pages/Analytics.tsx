import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("users");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", timeRange, selectedMetric],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics", {
        params: { timeRange, metric: selectedMetric },
      });
      return data;
    },
  });

  const timeRanges = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" },
  ];

  const metrics = [
    { value: "users", label: "Users", icon: "👥", color: "primary" },
    { value: "tasks", label: "Tasks", icon: "📋", color: "secondary" },
    { value: "revenue", label: "Revenue", icon: "💰", color: "accent" },
    { value: "engagement", label: "Engagement", icon: "📈", color: "success" },
  ];

  const keyMetrics = [
    {
      title: "Total Users",
      value: "12,456",
      change: "+12.5%",
      trend: "up",
      icon: "👥",
      color: "primary",
    },
    {
      title: "Active Tasks",
      value: "1,234",
      change: "+8.2%",
      trend: "up",
      icon: "📋",
      color: "secondary",
    },
    {
      title: "Total Revenue",
      value: "₦2.4M",
      change: "+23.1%",
      trend: "up",
      icon: "💰",
      color: "accent",
    },
    {
      title: "Completion Rate",
      value: "87.3%",
      change: "+5.4%",
      trend: "up",
      icon: "✅",
      color: "success",
    },
  ];

  const recentReports = [
    { name: "User Growth Report", date: "2024-01-15", size: "2.4 MB" },
    { name: "Revenue Analysis", date: "2024-01-14", size: "1.8 MB" },
    { name: "Task Performance", date: "2024-01-13", size: "3.1 MB" },
    { name: "User Engagement", date: "2024-01-12", size: "1.5 MB" },
  ];

  const generateMockData = (days: number) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 1000) + 500,
    }));
  };

  const chartData = generateMockData(
    timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-base-content/70 text-lg">
            Comprehensive insights and performance metrics
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
            Export Report
          </button>
          <button className="btn btn-primary">
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
            Download Data
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="card bg-base-100 shadow-xl hover-lift">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  className={`btn btn-sm ${
                    timeRange === range.value ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setTimeRange(range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {metrics.map((metric) => (
                <button
                  key={metric.value}
                  className={`btn btn-sm btn-outline ${
                    selectedMetric === metric.value ? "btn-primary" : ""
                  }`}
                  onClick={() => setSelectedMetric(metric.value)}
                >
                  <span className="mr-2">{metric.icon}</span>
                  {metric.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div
            key={metric.title}
            className={`stats-card glass-card p-6 hover-lift bg-gradient-to-br from-${metric.color} to-${metric.color}/70 text-white scale-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{metric.icon}</div>
              <div
                className={`badge ${
                  metric.trend === "up" ? "badge-success" : "badge-error"
                } badge-sm`}
              >
                {metric.change}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium opacity-90">{metric.title}</h3>
              <p className="text-3xl font-bold">{metric.value}</p>
              <div className="flex items-center gap-1 text-sm opacity-70">
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                {metric.trend === "up" ? "Trending up" : "Trending down"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {metrics.find((m) => m.value === selectedMetric)?.label} Over
                Time
              </h2>
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
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48"
                >
                  <li>
                    <button>Download PNG</button>
                  </li>
                  <li>
                    <button>Download PDF</button>
                  </li>
                  <li>
                    <button>Export Data</button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-end justify-around p-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-around">
                {chartData.map((point, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-primary to-primary/60 rounded-t w-8 transition-all duration-1000 hover:from-secondary hover:to-secondary/60 cursor-pointer"
                    style={{
                      height: `${
                        (point.value /
                          Math.max(...chartData.map((p) => p.value))) *
                        200
                      }px`,
                      animationDelay: `${index * 0.05}s`,
                    }}
                    title={`${
                      point.value
                    } on ${point.date.toLocaleDateString()}`}
                  ></div>
                ))}
              </div>
              <div className="text-center z-10">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm text-base-content/70">
                  Interactive chart visualization
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Demographics */}
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              User Demographics
            </h2>

            {/* Pie Chart Placeholder */}
            <div className="h-64 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary via-secondary to-accent animate-spin-slow opacity-20"></div>
              </div>
              <div className="text-center z-10">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm text-base-content/70">
                  Demographics breakdown
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span className="text-sm">18-24 years (35%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-secondary rounded"></div>
                <span className="text-sm">25-34 years (42%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-accent rounded"></div>
                <span className="text-sm">35-44 years (18%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-success rounded"></div>
                <span className="text-sm">45+ years (5%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Tasks */}
        <div className="card bg-base-100 shadow-xl hover-lift">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Top Tasks
            </h3>
            <div className="space-y-3">
              {[
                { name: "Social Media Share", completions: 1234, rate: "95%" },
                { name: "App Review Task", completions: 987, rate: "89%" },
                { name: "Survey Completion", completions: 756, rate: "87%" },
                { name: "Video Watch", completions: 543, rate: "82%" },
                { name: "Referral Bonus", completions: 321, rate: "78%" },
              ].map((task, index) => (
                <div
                  key={task.name}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm">{task.name}</div>
                    <div className="text-xs text-base-content/60">
                      {task.completions} completions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="badge badge-success badge-sm">
                      {task.rate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card bg-base-100 shadow-xl hover-lift">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Recent Reports
            </h3>
            <div className="space-y-3">
              {recentReports.map((report, index) => (
                <div
                  key={report.name}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{report.name}</div>
                    <div className="text-xs text-base-content/60">
                      {report.date} • {report.size}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-base-content/40"
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card bg-base-100 shadow-xl hover-lift">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
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
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Uptime</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-success">
                    99.9%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-success">
                    120ms
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-success">
                    Healthy
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-warning">
                    0.02%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-success"
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
                <span className="text-sm font-medium text-success">
                  All Systems Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
