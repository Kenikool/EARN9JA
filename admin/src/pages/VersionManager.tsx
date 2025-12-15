import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Apple,
  Download,
  TrendingUp,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";
import versionService from "../services/versionService";
import type {
  AppVersion,
  VersionConfig,
  VersionAnalytics,
} from "../services/versionService";

const VersionManager: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<"android" | "ios">(
    "android"
  );
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [analytics, setAnalytics] = useState<VersionAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<VersionConfig>({
    platform: "android",
    latestVersion: "",
    minVersion: "",
    downloadUrl: "",
    releaseNotes: [""],
    updateRequired: false,
  });

  useEffect(() => {
    loadVersions();
    loadAnalytics();
  }, [activePlatform]);

  useEffect(() => {
    setFormData({ ...formData, platform: activePlatform });
  }, [activePlatform]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const response = await versionService.getAllVersions(activePlatform);
      setVersions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load versions");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await versionService.getVersionAnalytics({
        platform: activePlatform,
      });
      setAnalytics(response.data);
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validateVersion(formData.latestVersion)) {
      setError(
        "Invalid latest version format. Use semantic versioning (e.g., 1.2.3)"
      );
      return;
    }

    if (!validateVersion(formData.minVersion)) {
      setError(
        "Invalid minimum version format. Use semantic versioning (e.g., 1.2.3)"
      );
      return;
    }

    if (compareVersions(formData.minVersion, formData.latestVersion) > 0) {
      setError("Minimum version cannot be greater than latest version");
      return;
    }

    if (formData.releaseNotes.filter((note) => note.trim()).length === 0) {
      setError("At least one release note is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await versionService.updateVersionConfig(formData);
      setSuccess("Version configuration updated successfully!");
      await loadVersions();
      await loadAnalytics();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update version");
    } finally {
      setLoading(false);
    }
  };

  const validateVersion = (version: string): boolean => {
    return /^\d+\.\d+\.\d+$/.test(version);
  };

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] < parts2[i]) return -1;
      if (parts1[i] > parts2[i]) return 1;
    }
    return 0;
  };

  const resetForm = () => {
    setFormData({
      platform: activePlatform,
      latestVersion: "",
      minVersion: "",
      downloadUrl: "",
      releaseNotes: [""],
      updateRequired: false,
    });
  };

  const addReleaseNote = () => {
    if (formData.releaseNotes.length < 10) {
      setFormData({
        ...formData,
        releaseNotes: [...formData.releaseNotes, ""],
      });
    }
  };

  const removeReleaseNote = (index: number) => {
    const newNotes = formData.releaseNotes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      releaseNotes: newNotes.length > 0 ? newNotes : [""],
    });
  };

  const updateReleaseNote = (index: number, value: string) => {
    const newNotes = [...formData.releaseNotes];
    newNotes[index] = value;
    setFormData({ ...formData, releaseNotes: newNotes });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">App Version Manager</h1>
        <p className="text-base-content/70">
          Manage app versions and force updates
        </p>
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

      {/* Platform Tabs */}
      <div className="tabs tabs-boxed bg-base-100">
        <button
          className={`tab ${activePlatform === "android" ? "tab-active" : ""}`}
          onClick={() => setActivePlatform("android")}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Android
        </button>
        <button
          className={`tab ${activePlatform === "ios" ? "tab-active" : ""}`}
          onClick={() => setActivePlatform("ios")}
        >
          <Apple className="w-4 h-4 mr-2" />
          iOS
        </button>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">
                {analytics.totalUsers}
              </div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">On Latest Version</div>
              <div className="stat-value text-success">
                {analytics.usersOnLatest}
              </div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Adoption Rate</div>
              <div className="stat-value text-info">
                {analytics.adoptionRate.toFixed(1)}%
              </div>
              <div className="stat-figure text-info">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Versions</div>
              <div className="stat-value">
                {analytics.versionDistribution.length}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version Configuration Form */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">
              Configure {activePlatform === "android" ? "Android" : "iOS"}{" "}
              Version
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Latest Version</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="1.2.3"
                    value={formData.latestVersion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latestVersion: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Format: major.minor.patch
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Minimum Version</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="1.0.0"
                    value={formData.minVersion}
                    onChange={(e) =>
                      setFormData({ ...formData, minVersion: e.target.value })
                    }
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Users below this must update
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Download URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  placeholder={
                    activePlatform === "android"
                      ? "https://example.com/app.apk"
                      : "https://apps.apple.com/..."
                  }
                  value={formData.downloadUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, downloadUrl: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Release Notes</span>
                  <span className="label-text-alt">
                    {formData.releaseNotes.length}/10
                  </span>
                </label>
                <div className="space-y-2">
                  {formData.releaseNotes.map((note, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1"
                        placeholder={`Release note ${index + 1}`}
                        value={note}
                        onChange={(e) =>
                          updateReleaseNote(index, e.target.value)
                        }
                      />
                      {formData.releaseNotes.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-error btn-sm btn-square"
                          onClick={() => removeReleaseNote(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.releaseNotes.length < 10 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={addReleaseNote}
                    >
                      <Plus className="w-4 h-4" />
                      Add Note
                    </button>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-error"
                    checked={formData.updateRequired}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        updateRequired: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <span className="label-text font-semibold">
                      Force Update (Mandatory)
                    </span>
                    <p className="text-sm text-base-content/70">
                      Users below minimum version must update
                    </p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Publish Version
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Version History & Analytics */}
        <div className="space-y-6">
          {/* Version Distribution */}
          {analytics && analytics.versionDistribution.length > 0 && (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Version Distribution</h3>
                <div className="space-y-2">
                  {analytics.versionDistribution.map((dist) => (
                    <div key={dist.version}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>v{dist.version}</span>
                        <span>
                          {dist.count} users ({dist.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary"
                        value={dist.percentage}
                        max="100"
                      ></progress>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Version History */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Version History</h3>
              {loading ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-4 text-base-content/70">
                  No versions published yet
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.slice(0, 5).map((version) => (
                    <div
                      key={version._id}
                      className={`p-4 rounded-lg border ${
                        version.isActive
                          ? "border-primary bg-primary/5"
                          : "border-base-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">
                            v{version.latestVersion}
                            {version.isActive && (
                              <span className="badge badge-primary badge-sm ml-2">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-base-content/70">
                            Min: v{version.minVersion}
                          </div>
                        </div>
                        <div className="text-sm text-base-content/70">
                          {new Date(version.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        {version.releaseNotes.slice(0, 3).map((note, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span>•</span>
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                      {version.updateRequired && (
                        <div className="badge badge-error badge-sm mt-2">
                          Mandatory Update
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionManager;
