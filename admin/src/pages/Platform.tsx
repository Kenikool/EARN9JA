import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Activity, Server, Database, Lock } from "lucide-react";
import { platformSettingsService } from "../services/platformSettingsService";
import {
  healthService,
  type HealthCheckData,
  type SystemMetrics,
} from "../services/healthService";

interface AuditLog {
  _id: string;
  settingKey: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedByName: string;
  timestamp: string;
  ipAddress?: string;
}

const Platform: React.FC = () => {
  const location = useLocation();
  const [securityLogs, setSecurityLogs] = useState<AuditLog[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Determine which view to show based on route
  const isStatusView = location.pathname.includes("/platform/status");
  const isSecurityView = location.pathname.includes("/platform/security");
  const isConfigView = location.pathname.includes("/platform/config");

  // Fetch health status when status view is active
  useEffect(() => {
    if (isStatusView) {
      fetchHealthStatus();
    }
  }, [isStatusView]);

  // Fetch security logs (audit logs) when security view is active
  useEffect(() => {
    if (isSecurityView) {
      fetchSecurityLogs();
    }
  }, [isSecurityView]);

  const fetchHealthStatus = async () => {
    try {
      setHealthLoading(true);
      setHealthError(null);
      const [healthResponse, metricsResponse] = await Promise.all([
        healthService.getHealthStatus(),
        healthService.getSystemMetrics(),
      ]);

      if (healthResponse.success) {
        setHealthData(healthResponse.data);
      }
      if (metricsResponse.success) {
        setMetrics(metricsResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch health status:", error);
      setHealthError(
        error instanceof Error ? error.message : "Failed to fetch health data"
      );
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      setLoading(true);
      const response = await platformSettingsService.getAuditLog({
        page: 1,
        limit: 50,
      });
      if (response.success && response.data) {
        setSecurityLogs(response.data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch security logs:", error);
    } finally {
      setLoading(false);
    }
  };

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
          {healthLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : healthError ? (
            <div className="alert alert-error">
              <span>{healthError}</span>
              <button onClick={fetchHealthStatus} className="btn btn-sm">
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Status Overview */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  {healthData && (
                    <div className="badge badge-lg">
                      Overall: {healthData.overall}
                    </div>
                  )}
                </div>
                <button
                  onClick={fetchHealthStatus}
                  className="btn btn-sm btn-ghost"
                >
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-base-content/70">
                          API Server
                        </p>
                        <p className="text-lg font-bold mt-1">
                          {getStatusBadge(healthData?.api.status || "down")}
                        </p>
                        {healthData?.api.message && (
                          <p className="text-xs text-base-content/60 mt-1">
                            {healthData.api.message}
                          </p>
                        )}
                      </div>
                      <div
                        className={`${
                          healthData?.api.status === "operational"
                            ? "bg-success/20"
                            : "bg-error/20"
                        } p-3 rounded-lg`}
                      >
                        <Server
                          className={`w-6 h-6 ${
                            healthData?.api.status === "operational"
                              ? "text-success"
                              : "text-error"
                          }`}
                        />
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
                          {getStatusBadge(
                            healthData?.database.status || "down"
                          )}
                        </p>
                        {healthData?.database.message && (
                          <p className="text-xs text-base-content/60 mt-1">
                            {healthData.database.message}
                          </p>
                        )}
                      </div>
                      <div
                        className={`${
                          healthData?.database.status === "operational"
                            ? "bg-success/20"
                            : "bg-error/20"
                        } p-3 rounded-lg`}
                      >
                        <Database
                          className={`w-6 h-6 ${
                            healthData?.database.status === "operational"
                              ? "text-success"
                              : "text-error"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-base-content/70">Firebase</p>
                        <p className="text-lg font-bold mt-1">
                          {getStatusBadge(
                            healthData?.firebase.status || "down"
                          )}
                        </p>
                        {healthData?.firebase.message && (
                          <p className="text-xs text-base-content/60 mt-1">
                            {healthData.firebase.message}
                          </p>
                        )}
                      </div>
                      <div
                        className={`${
                          healthData?.firebase.status === "operational"
                            ? "bg-success/20"
                            : "bg-error/20"
                        } p-3 rounded-lg`}
                      >
                        <Activity
                          className={`w-6 h-6 ${
                            healthData?.firebase.status === "operational"
                              ? "text-success"
                              : "text-error"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Metrics */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title mb-4">System Metrics</h2>
                  {metrics ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base-content/70">Uptime</span>
                        <span className="font-semibold text-success">
                          {Math.floor(metrics.uptime / 3600)}h{" "}
                          {Math.floor((metrics.uptime % 3600) / 60)}m
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base-content/70">
                          Memory Used
                        </span>
                        <span className="font-semibold">
                          {(metrics.memory.used / 1024 / 1024).toFixed(2)} MB /{" "}
                          {(metrics.memory.total / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base-content/70">
                          Node Version
                        </span>
                        <span className="font-semibold">
                          {metrics.nodeVersion}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base-content/70">Platform</span>
                        <span className="font-semibold">
                          {metrics.platform}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-base-content/70">
                      No metrics available
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Security Logs View */}
      {isSecurityView && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Settings Audit Log</h2>
              <button
                onClick={fetchSecurityLogs}
                className="btn btn-sm btn-ghost"
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : securityLogs.length === 0 ? (
                <div className="text-center py-8 text-base-content/70">
                  No audit logs found
                </div>
              ) : (
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Setting</th>
                      <th>Changed By</th>
                      <th>Old Value</th>
                      <th>New Value</th>
                      <th>Timestamp</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {log.settingKey}
                            </span>
                          </div>
                        </td>
                        <td>{log.changedByName}</td>
                        <td>
                          <code className="text-xs bg-base-200 px-2 py-1 rounded">
                            {JSON.stringify(log.oldValue)}
                          </code>
                        </td>
                        <td>
                          <code className="text-xs bg-base-200 px-2 py-1 rounded">
                            {JSON.stringify(log.newValue)}
                          </code>
                        </td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          <span className="text-xs text-base-content/70">
                            {log.ipAddress || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
