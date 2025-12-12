import React from "react";
import { Save } from "lucide-react";

const Settings: React.FC = () => {
  const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement settings save functionality
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage platform configuration</p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings}>
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body">
            <h2 className="card-title mb-4">Platform Configuration</h2>

            <div className="space-y-6">
              {/* Withdrawal Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Withdrawal Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Minimum Withdrawal Amount
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      placeholder="1000"
                      defaultValue="1000"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Withdrawal Fee (%)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      placeholder="2.5"
                      defaultValue="2.5"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Platform Fees */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Platform Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Platform Fee (%)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      placeholder="10"
                      defaultValue="10"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Feature Toggles</h3>
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked
                      />
                      <span className="label-text">
                        Enable User Registration
                      </span>
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked
                      />
                      <span className="label-text">Enable Task Creation</span>
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked
                      />
                      <span className="label-text">Enable Withdrawals</span>
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                      />
                      <span className="label-text">Maintenance Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button type="submit" className="btn btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* System Information */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body">
          <h2 className="card-title mb-4">System Information</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Platform Version</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Version</span>
              <span className="font-semibold">v1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Environment</span>
              <div className="badge badge-success">Production</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
