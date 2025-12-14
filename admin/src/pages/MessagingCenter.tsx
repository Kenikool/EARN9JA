import React, { useState, useEffect } from "react";
import {
  Send,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import messagingService, {
  BulkMessage,
  MessageTemplate,
  BulkMessageInput,
} from "../services/messagingService";

const MessagingCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "compose" | "scheduled" | "history"
  >("compose");
  const [messages, setMessages] = useState<BulkMessage[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<BulkMessageInput>({
    title: "",
    body: "",
    type: "in_app",
    targetAudience: {
      type: "all",
    },
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);

  useEffect(() => {
    loadTemplates();
    if (activeTab !== "compose") {
      loadMessages();
    }
  }, [activeTab]);

  const loadTemplates = async () => {
    try {
      const response = await messagingService.getTemplates();
      setTemplates(response.data);
    } catch (err: any) {
      console.error("Failed to load templates:", err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const status = activeTab === "scheduled" ? "scheduled" : undefined;
      const response = await messagingService.getMessages(1, 20, status);
      setMessages(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t._id === templateId);
    if (template) {
      setFormData({
        ...formData,
        title: template.title,
        body: template.body,
      });
      setSelectedTemplate(templateId);
    }
  };

  const handleSendNow = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await messagingService.createMessage(formData);
      await messagingService.sendMessage(response.data.messageId);

      setSuccess("Message sent successfully!");
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledTime) {
      setError("Please select a scheduled time");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const messageData = {
        ...formData,
        scheduledFor: scheduledTime,
      };

      const response = await messagingService.createMessage(messageData);
      setSuccess("Message scheduled successfully!");
      resetForm();
      setScheduledTime("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to schedule message");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScheduled = async (messageId: string) => {
    try {
      await messagingService.cancelMessage(messageId);
      setSuccess("Scheduled message cancelled");
      loadMessages();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel message");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      body: "",
      type: "in_app",
      targetAudience: {
        type: "all",
      },
    });
    setSelectedTemplate("");
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; icon: any }> = {
      draft: { class: "badge-ghost", icon: MessageSquare },
      scheduled: { class: "badge-info", icon: Clock },
      sending: { class: "badge-warning", icon: Loader },
      sent: { class: "badge-success", icon: CheckCircle },
      cancelled: { class: "badge-error", icon: XCircle },
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <div className={`badge ${badge.class} gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Messaging Center</h1>
        <p className="text-base-content/70">
          Send bulk messages and push notifications to users
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100">
        <button
          className={`tab ${activeTab === "compose" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("compose")}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Compose
        </button>
        <button
          className={`tab ${activeTab === "scheduled" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("scheduled")}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Scheduled
        </button>
        <button
          className={`tab ${activeTab === "history" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <Clock className="w-4 h-4 mr-2" />
          History
        </button>
      </div>

      {/* Compose Tab */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selector */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg">Use Template (Optional)</h3>
                <select
                  className="select select-bordered w-full"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                >
                  <option value="">Select a template...</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message Form */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body space-y-4">
                <h3 className="card-title text-lg">Message Content</h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Enter message title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Message Body</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-32"
                    placeholder="Enter your message..."
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({ ...formData, body: e.target.value })
                    }
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      {formData.body.length} characters
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Message Type</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "in_app" | "push" | "both",
                      })
                    }
                  >
                    <option value="in_app">In-App Notification</option>
                    <option value="push">Push Notification</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body space-y-4">
                <h3 className="card-title text-lg">Schedule (Optional)</h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Scheduled Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleSendNow}
                    disabled={loading || !formData.title || !formData.body}
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Now
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline flex-1"
                    onClick={handleSchedule}
                    disabled={
                      loading ||
                      !formData.title ||
                      !formData.body ||
                      !scheduledTime
                    }
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Target Audience */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body space-y-4">
                <h3 className="card-title text-lg">Target Audience</h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Audience Type</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={formData.targetAudience.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: {
                          ...formData.targetAudience,
                          type: e.target.value as "all" | "filtered",
                        },
                      })
                    }
                  >
                    <option value="all">All Users</option>
                    <option value="filtered">Filtered Users</option>
                  </select>
                </div>

                {formData.targetAudience.type === "filtered" && (
                  <>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">User Status</span>
                      </label>
                      <select
                        className="select select-bordered select-sm"
                        multiple
                        onChange={(e) => {
                          const selected = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          );
                          setFormData({
                            ...formData,
                            targetAudience: {
                              ...formData.targetAudience,
                              filters: {
                                ...formData.targetAudience.filters,
                                status: selected,
                              },
                            },
                          });
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">User Roles</span>
                      </label>
                      <select
                        className="select select-bordered select-sm"
                        multiple
                        onChange={(e) => {
                          const selected = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          );
                          setFormData({
                            ...formData,
                            targetAudience: {
                              ...formData.targetAudience,
                              filters: {
                                ...formData.targetAudience.filters,
                                roles: selected,
                              },
                            },
                          });
                        }}
                      >
                        <option value="service_worker">Workers</option>
                        <option value="sponsor">Sponsors</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">KYC Verified Only</span>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              targetAudience: {
                                ...formData.targetAudience,
                                filters: {
                                  ...formData.targetAudience.filters,
                                  kycVerified: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                      </label>
                    </div>
                  </>
                )}

                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Estimated Recipients</div>
                    <div className="stat-value text-primary">
                      {estimatedRecipients}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === "scheduled" && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title">Scheduled Messages</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-base-content/70">
                No scheduled messages
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Scheduled For</th>
                      <th>Recipients</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message) => (
                      <tr key={message._id}>
                        <td>{message.title}</td>
                        <td>
                          <div className="badge badge-sm">{message.type}</div>
                        </td>
                        <td>
                          {message.scheduledFor
                            ? new Date(message.scheduledFor).toLocaleString()
                            : "-"}
                        </td>
                        <td>{message.delivery.totalRecipients}</td>
                        <td>{getStatusBadge(message.status)}</td>
                        <td>
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleCancelScheduled(message._id)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title">Message History</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-base-content/70">
                No message history
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Sent At</th>
                      <th>Recipients</th>
                      <th>Delivered</th>
                      <th>Failed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message) => (
                      <tr key={message._id}>
                        <td>{message.title}</td>
                        <td>
                          <div className="badge badge-sm">{message.type}</div>
                        </td>
                        <td>
                          {message.sentAt
                            ? new Date(message.sentAt).toLocaleString()
                            : "-"}
                        </td>
                        <td>{message.delivery.totalRecipients}</td>
                        <td>
                          <div className="badge badge-success badge-sm">
                            {message.delivery.delivered}
                          </div>
                        </td>
                        <td>
                          <div className="badge badge-error badge-sm">
                            {message.delivery.failed}
                          </div>
                        </td>
                        <td>{getStatusBadge(message.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCenter;
