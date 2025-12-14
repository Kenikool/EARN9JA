import React, { useState, useEffect } from "react";
import { Save, RotateCcw, AlertTriangle } from "lucide-react";
import platformSettingsService, {
  PlatformSettings,
} from "../services/platformSettingsService";

const PlatformSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await platformSettingsService.getSettings();
      setSettings(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await platformSettingsService.updateSettings(settings);
      setSuccess("Settings updated successfully");
      await loadSettings();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (settingKeys: string[]) => {
    setConfirmMessage(
      `Are you sure you want to reset ${settingKeys.length} setting(s) to default values?`
    );
    setConfirmAction(() => async () => {
      try {
        setSaving(true);
        await platformSettingsService.resetSettings(settingKeys);
        setSuccess("Settings reset to defaults");
        await loadSettings();
        setShowConfirm(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to reset settings");
      } finally {
        setSaving(false);
      }
    });
    setShowConfirm(true);
  };

  const handleMaintenanceModeToggle = () => {
    if (!settings) return;

    if (!settings.operational.maintenanceMode) {
      setConfirmMessage(
        "Enabling maintenance mode will prevent all non-admin users from accessing the platform. Continue?"
      );
      setConfirmAction(() => () => {
        setSettings({
          ...settings,
          operational: {
            ...settings.operational,
            maintenanceMode: true,
          },
        });
        setShowConfirm(false);
      });
      setShowConfirm(true);
    } else {
      setSettings({
        ...settings,
        operational: {
          ...settings.operational,
          maintenanceMode: false,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="alert alert-error">
        <AlertTriangle className="w-5 h-5" />
        <span>Failed to load settings</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-base-content/70">
            Configure platform-wide settings and operational controls
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={() =>
              handleReset([
                "financial.minimumWithdrawal",
                "financial.platformCommissionRate",
                "financial.referralBonusAmount",
                "financial.minimumTaskReward",
                "userLimits.maxActiveTasksPerUser",
                "userLimits.maxSubmissionsPerTask",
                "userLimits.dailySpinLimit",
                "operational.maintenanceMode",
                "operational.registrationEnabled",
                "operational.kycRequired",
                "taskManagement.approvalAutoTimeoutDays",
                "taskManagement.maxTaskDurationDays",
              ])
            }
            disabled={saving}
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Financial Settings */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Financial Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Minimum Withdrawal (₦)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.financial.minimumWithdrawal}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    financial: {
                      ...settings.financial,
                      minimumWithdrawal: Number(e.target.value),
                    },
                  })
                }
                min={100}
              />
              <label className="label">
                <span className="label-text-alt">Minimum: ₦100</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Platform Commission Rate (%)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.financial.platformCommissionRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    financial: {
                      ...settings.financial,
                      platformCommissionRate: Number(e.target.value),
                    },
                  })
                }
                min={0}
                max={50}
              />
              <label className="label">
                <span className="label-text-alt">Range: 0-50%</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Referral Bonus Amount (₦)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.financial.referralBonusAmount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    financial: {
                      ...settings.financial,
                      referralBonusAmount: Number(e.target.value),
                    },
                  })
                }
                min={0}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Minimum Task Reward (₦)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.financial.minimumTaskReward}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    financial: {
                      ...settings.financial,
                      minimumTaskReward: Number(e.target.value),
                    },
                  })
                }
                min={10}
              />
              <label className="label">
                <span className="label-text-alt">Minimum: ₦10</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* User Limits */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">User Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Max Active Tasks Per User</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.userLimits.maxActiveTasksPerUser}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    userLimits: {
                      ...settings.userLimits,
                      maxActiveTasksPerUser: Number(e.target.value),
                    },
                  })
                }
                min={1}
                max={100}
              />
              <label className="label">
                <span className="label-text-alt">Range: 1-100</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Max Submissions Per Task</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.userLimits.maxSubmissionsPerTask}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    userLimits: {
                      ...settings.userLimits,
                      maxSubmissionsPerTask: Number(e.target.value),
                    },
                  })
                }
                min={1}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Daily Spin Limit</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.userLimits.dailySpinLimit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    userLimits: {
                      ...settings.userLimits,
                      dailySpinLimit: Number(e.target.value),
                    },
                  })
                }
                min={0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operational Controls */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Operational Controls</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="toggle toggle-error"
                  checked={settings.operational.maintenanceMode}
                  onChange={handleMaintenanceModeToggle}
                />
                <div>
                  <span className="label-text font-semibold">
                    Maintenance Mode
                  </span>
                  <p className="text-sm text-base-content/70">
                    Prevent all non-admin users from accessing the platform
                  </p>
                </div>
              </label>
            </div>

            <div className="divider"></div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.operational.registrationEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      operational: {
                        ...settings.operational,
                        registrationEnabled: e.target.checked,
                      },
                    })
                  }
                />
                <div>
                  <span className="label-text font-semibold">
                    Allow New Registrations
                  </span>
                  <p className="text-sm text-base-content/70">
                    Enable or disable new user signups
                  </p>
                </div>
              </label>
            </div>

            <div className="divider"></div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.operational.kycRequired}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      operational: {
                        ...settings.operational,
                        kycRequired: e.target.checked,
                      },
                    })
                  }
                />
                <div>
                  <span className="label-text font-semibold">
                    Require KYC Verification
                  </span>
                  <p className="text-sm text-base-content/70">
                    Enforce KYC verification for withdrawals
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Task Management */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Task Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Approval Auto-Timeout (Days)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.taskManagement.approvalAutoTimeoutDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    taskManagement: {
                      ...settings.taskManagement,
                      approvalAutoTimeoutDays: Number(e.target.value),
                    },
                  })
                }
                min={1}
                max={30}
              />
              <label className="label">
                <span className="label-text-alt">Range: 1-30 days</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Max Task Duration (Days)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={settings.taskManagement.maxTaskDurationDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    taskManagement: {
                      ...settings.taskManagement,
                      maxTaskDurationDays: Number(e.target.value),
                    },
                  })
                }
                min={1}
                max={365}
              />
              <label className="label">
                <span className="label-text-alt">Range: 1-365 days</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Action</h3>
            <p className="py-4">{confirmMessage}</p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowConfirm(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => confirmAction && confirmAction()}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSettingsPage;
