import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Store, Mail, Truck, Shield } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL or default to 'general'
  const tabFromUrl = searchParams.get('tab') as 'general' | 'notifications' | 'shipping' | 'security' | null;
  const activeTab = tabFromUrl && ['general', 'notifications', 'shipping', 'security'].includes(tabFromUrl) 
    ? tabFromUrl 
    : 'general';

  const setActiveTab = (tab: 'general' | 'notifications' | 'shipping' | 'security') => {
    setSearchParams({ tab });
  };

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const response = await api.get("/admin/settings");
      return response.data.data;
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (data: any) => {
      const response = await api.put("/admin/settings", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update settings");
    },
  });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      storeName: formData.get("storeName") as string,
      storeEmail: formData.get("storeEmail") as string,
      storePhone: formData.get("storePhone") as string,
      storeAddress: formData.get("storeAddress") as string,
      currency: formData.get("currency") as string,
      taxRate: parseFloat(formData.get("taxRate") as string),
    };
    updateSettingsMutation.mutate(data);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      orderConfirmationEmails: formData.get("orderConfirmationEmails") === "on",
      shippingNotifications: formData.get("shippingNotifications") === "on",
      lowStockAlerts: formData.get("lowStockAlerts") === "on",
      newOrderNotifications: formData.get("newOrderNotifications") === "on",
      marketingEmails: formData.get("marketingEmails") === "on",
    };
    updateSettingsMutation.mutate(data);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      sessionTimeout: parseInt(formData.get("sessionTimeout") as string),
      require2FAForAdmin: formData.get("require2FAForAdmin") === "on",
      enableActivityLogging: formData.get("enableActivityLogging") === "on",
      gdprCompliance: formData.get("gdprCompliance") === "on",
      dataRetentionPeriod: parseInt(formData.get("dataRetentionPeriod") as string),
    };
    updateSettingsMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-base-content/60">Configure your store settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === "general" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <Store className="w-4 h-4 mr-2" />
          General
        </button>
        <button
          className={`tab ${activeTab === "notifications" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          <Mail className="w-4 h-4 mr-2" />
          Notifications
        </button>
        <button
          className={`tab ${activeTab === "shipping" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("shipping")}
        >
          <Truck className="w-4 h-4 mr-2" />
          Shipping
        </button>
        <button
          className={`tab ${activeTab === "security" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Shield className="w-4 h-4 mr-2" />
          Security
        </button>
      </div>

      {isLoading ? (
        <div className="skeleton h-96"></div>
      ) : (
        <>
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h2 className="card-title mb-4">General Settings</h2>
                <form onSubmit={handleSaveGeneral} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Store Name</span>
                      </label>
                      <input
                        type="text"
                        name="storeName"
                        className="input input-bordered"
                        defaultValue={settings?.storeName || ""}
                        placeholder="My Store"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Store Email</span>
                      </label>
                      <input
                        type="email"
                        name="storeEmail"
                        className="input input-bordered"
                        defaultValue={settings?.storeEmail || ""}
                        placeholder="store@example.com"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Store Phone</span>
                      </label>
                      <input
                        type="tel"
                        name="storePhone"
                        className="input input-bordered"
                        defaultValue={settings?.storePhone || ""}
                        placeholder="+1 234 567 8900"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Currency</span>
                      </label>
                      <select
                        name="currency"
                        className="select select-bordered"
                        defaultValue={settings?.currency || "USD"}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="NGN">NGN - Nigerian Naira</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Store Address</span>
                    </label>
                    <textarea
                      name="storeAddress"
                      className="textarea textarea-bordered"
                      defaultValue={settings?.storeAddress || ""}
                      placeholder="123 Main St, City, Country"
                      rows={3}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Tax Rate (%)</span>
                    </label>
                    <input
                      type="number"
                      name="taxRate"
                      step="0.01"
                      className="input input-bordered"
                      defaultValue={settings?.taxRate || 0}
                      placeholder="0.00"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h2 className="card-title mb-4">Notification Preferences</h2>
                <p className="text-base-content/60 mb-6">
                  Configure email notifications for your store
                </p>
                <form onSubmit={handleSaveNotifications} className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Order Confirmation Emails</span>
                      <input
                        type="checkbox"
                        name="orderConfirmationEmails"
                        className="toggle toggle-primary"
                        defaultChecked={settings?.orderConfirmationEmails ?? true}
                      />
                    </label>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Send email to customers when they place an order
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Shipping Notifications</span>
                      <input
                        type="checkbox"
                        name="shippingNotifications"
                        className="toggle toggle-primary"
                        defaultChecked={settings?.shippingNotifications ?? true}
                      />
                    </label>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Notify customers when their order ships
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Low Stock Alerts</span>
                      <input
                        type="checkbox"
                        name="lowStockAlerts"
                        className="toggle toggle-primary"
                        defaultChecked={settings?.lowStockAlerts ?? true}
                      />
                    </label>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Get notified when product stock is low
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">New Order Notifications</span>
                      <input
                        type="checkbox"
                        name="newOrderNotifications"
                        className="toggle toggle-primary"
                        defaultChecked={settings?.newOrderNotifications ?? true}
                      />
                    </label>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Receive email when new orders are placed
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Marketing Emails</span>
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        className="toggle toggle-primary"
                        defaultChecked={settings?.marketingEmails ?? false}
                      />
                    </label>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Send promotional emails to customers
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Notification Settings
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Shipping Settings - Redirect to Shipping page */}
          {activeTab === "shipping" && (
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h2 className="card-title mb-4">Shipping Settings</h2>
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    Manage shipping methods in the{" "}
                    <Link to="/admin/shipping" className="link link-primary">
                      Shipping page
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Account Security */}
              <div className="card bg-base-100 border">
                <div className="card-body">
                  <h2 className="card-title mb-4">Account Security</h2>
                  <p className="text-base-content/60 mb-4">
                    Manage your admin account security settings
                  </p>
                  <div className="alert alert-info">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>
                      Visit your{" "}
                      <Link to="/account-settings?tab=security" className="link link-primary">
                        Account Settings
                      </Link>{" "}
                      to manage password, 2FA, and other security features
                    </span>
                  </div>
                </div>
              </div>

              {/* Session Management & Security */}
              <div className="card bg-base-100 border">
                <div className="card-body">
                  <h2 className="card-title mb-4">Security & Privacy Settings</h2>
                  <form onSubmit={handleSaveSecurity} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Session Timeout (minutes)</span>
                      </label>
                      <input
                        type="number"
                        name="sessionTimeout"
                        className="input input-bordered"
                        defaultValue={settings?.sessionTimeout || 30}
                        placeholder="30"
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          Automatically log out inactive users after this time
                        </span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Require 2FA for Admin Access</span>
                        <input
                          type="checkbox"
                          name="require2FAForAdmin"
                          className="toggle toggle-primary"
                          defaultChecked={settings?.require2FAForAdmin ?? false}
                        />
                      </label>
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          Force all admin users to enable two-factor authentication
                        </span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Enable Activity Logging</span>
                        <input
                          type="checkbox"
                          name="enableActivityLogging"
                          className="toggle toggle-primary"
                          defaultChecked={settings?.enableActivityLogging ?? true}
                        />
                      </label>
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          Track admin actions for security audits
                        </span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">GDPR Compliance Mode</span>
                        <input
                          type="checkbox"
                          name="gdprCompliance"
                          className="toggle toggle-primary"
                          defaultChecked={settings?.gdprCompliance ?? false}
                        />
                      </label>
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          Enable additional privacy features for EU customers
                        </span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Data Retention Period (days)</span>
                      </label>
                      <input
                        type="number"
                        name="dataRetentionPeriod"
                        className="input input-bordered"
                        defaultValue={settings?.dataRetentionPeriod || 365}
                        placeholder="365"
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          How long to keep customer data before automatic deletion
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Security Settings
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
