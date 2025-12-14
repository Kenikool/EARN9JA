import React from "react";
import { useLocation } from "react-router-dom";
import { Activity, AlertCircle, Server, Database, Lock } from "lucide-react";

const Platform: React.FC = () => {
  const location = useLocation();

  // Determine which view to show based on route
  const isStatusView = location.pathname.includes("/platform/status");
  const isSecurityView = location.pathname.includes("/platform/security");
  const isConfigView = location.pathname.includes("/platform/config");

  // Mock data - replace with actual API calls
  const systemStatus = {
    api: "operational",
    database: "operational",
    payment: "operational",
    notifications: "degraded",
  };

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600000);

  const securityLogs = [
    {
      id: 1,
      type: "login",
      user: "admin@earn9ja.com",
      action: "Successful login",
      timestamp: now.toISOString(),
      status: "success",
    },
    {
      id: 2,
      type: "failed_login",
      user: "unknown@example.com",
      action: "Failed login attempt",
      timestamp: oneHourAgo.toISOString(),
      status: "warning",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <div className="badge badge-success">Operational</div>;
      case "degraded":
        return <div className="badge badge-warning">Degraded</div>;
      case "down":
        return <div className="badge badge-error">Down</div>;
      default:
        return <div className="badge badge-ghost">{status}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isStatusView
              ? "System Status"
              : isSecurityView
              ? "Security Logs"
              : isConfigView
              ? "Configuration"
              : "Platform Management"}
          </h1>
          <p className="text-base-content/70">
            {isStatusView
              ? "Monitor system health and uptime"
              : isSecurityView
              ? "View security events and access logs"
              : isConfigView
              ? "Manage platform configuration"
              : "Manage platform settings and security"}
          </p>
        </div>
      </div>

      {/* System Status View */}
      {(isStatusView || (!isSecurityView && !isConfigView)) && (
        <>
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70">API Server</p>
                    <p className="text-lg font-bold mt-1">
                      {getStatusBadge(systemStatus.api)}
                    </p>
                  </div>
                  <div className="bg-success/20 p-3 rounded-lg">
                    <Server className="w-6 h-6 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70">Database</p>
                    <p className="text-lg font-bold mt-1">
                      {getStatusBadge(systemStatus.database)}
                    </p>
                  </div>
                  <div className="bg-success/20 p-3 rounded-lg">
                    <Database className="w-6 h-6 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70">
                      Payment Gateway
                    </p>
                    <p className="text-lg font-bold mt-1">
                      {getStatusBadge(systemStatus.payment)}
                    </p>
                  </div>
                  <div className="bg-success/20 p-3 rounded-lg">
                    <Activity className="w-6 h-6 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70">
                      Notifications
                    </p>
                    <p className="text-lg font-bold mt-1">
                      {getStatusBadge(systemStatus.notifications)}
                    </p>
                  </div>
                  <div className="bg-warning/20 p-3 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4">System Metrics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base-content/70">Uptime</span>
                  <span className="font-semibold text-success">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base-content/70">Response Time</span>
                  <span className="font-semibold">120ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base-content/70">
                    Active Connections
                  </span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base-content/70">Error Rate</span>
                  <span className="font-semibold text-success">0.01%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Security Logs View */}
      {isSecurityView && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Recent Security Events</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          {log.type.replace("_", " ")}
                        </div>
                      </td>
                      <td>{log.user}</td>
                      <td>{log.action}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        {log.status === "success" ? (
                          <div className="badge badge-success">Success</div>
                        ) : (
                          <div className="badge badge-warning">Warning</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Configuration View */}
      {isConfigView && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Platform Configuration</h2>
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Platform Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  defaultValue="Earn9ja"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Minimum Withdrawal Amount</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  defaultValue="1000"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Commission Rate (%)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  defaultValue="10"
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Maintenance Mode</span>
                  <input type="checkbox" className="toggle toggle-primary" />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Allow New Registrations</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                  />
                </label>
              </div>

              <button className="btn btn-primary">Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Platform;
