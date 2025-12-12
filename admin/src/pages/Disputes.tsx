import React, { useState } from "react";
import { AlertTriangle, Eye, CheckCircle } from "lucide-react";
import { usePendingDisputes, useResolveDispute } from "../hooks/useAdminData";

const Disputes: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const {
    data: disputesData,
    isLoading,
    error,
  } = usePendingDisputes(filters.page, filters.limit);
  const resolveDispute = useResolveDispute();

  const disputes = disputesData?.data?.disputes || [];
  const pagination = disputesData?.data?.pagination;

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleResolveDispute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const resolution = {
      decision: formData.get("decision") as string,
      action: formData.get("action") as
        | "refund_worker"
        | "refund_sponsor"
        | "no_action"
        | "ban_user",
      notes: formData.get("notes") as string,
    };

    await resolveDispute.mutateAsync({
      disputeId: selectedDispute._id,
      resolution,
    });
    setShowResolveModal(false);
    setSelectedDispute(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertTriangle className="w-5 h-5" />
        <span>Failed to load disputes. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dispute Resolution
          </h1>
          <p className="text-gray-600">Review and resolve user disputes</p>
        </div>
      </div>

      {/* Disputes Grid */}
      <div className="grid grid-cols-1 gap-6">
        {disputes.length === 0 ? (
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No pending disputes</p>
            </div>
          </div>
        ) : (
          disputes.map((dispute: any) => (
            <div
              key={dispute._id}
              className="card bg-white shadow-sm border border-gray-200"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dispute.title || "Dispute"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {dispute.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="badge badge-warning">
                        {dispute.status}
                      </div>
                      <span className="text-sm text-gray-600">
                        Reported by: {dispute.reportedBy?.profile?.firstName}{" "}
                        {dispute.reportedBy?.profile?.lastName}
                      </span>
                      {dispute.taskId && (
                        <span className="text-sm text-gray-600">
                          Task: {dispute.taskId.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowResolveModal(true);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="join">
            <button
              className="btn join-item"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              «
            </button>
            <button className="btn join-item">Page {pagination.page}</button>
            <button
              className="btn join-item"
              disabled={pagination.page === pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedDispute && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Resolve Dispute</h3>
            <form onSubmit={handleResolveDispute} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Decision</span>
                </label>
                <input
                  type="text"
                  name="decision"
                  className="input input-bordered"
                  placeholder="Enter your decision"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Action</span>
                </label>
                <select
                  name="action"
                  className="select select-bordered"
                  required
                >
                  <option value="">Select action</option>
                  <option value="refund_worker">Refund Worker</option>
                  <option value="refund_sponsor">Refund Sponsor</option>
                  <option value="no_action">No Action</option>
                  <option value="ban_user">Ban User</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  name="notes"
                  className="textarea textarea-bordered"
                  placeholder="Add resolution notes"
                  rows={4}
                  required
                ></textarea>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowResolveModal(false);
                    setSelectedDispute(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resolveDispute.isPending}
                >
                  {resolveDispute.isPending
                    ? "Resolving..."
                    : "Resolve Dispute"}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowResolveModal(false);
              setSelectedDispute(null);
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Disputes;
