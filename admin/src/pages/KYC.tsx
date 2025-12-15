import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";
import {
  useKYCRequests,
  useApproveKYC,
  useRejectKYC,
} from "../hooks/useAdminData";

const KYC: React.FC = () => {
  const location = useLocation();

  // Determine status from route
  const routeStatus = location.pathname.includes("/kyc/pending")
    ? "pending"
    : location.pathname.includes("/kyc/approved")
    ? "approved"
    : location.pathname.includes("/kyc/rejected")
    ? "rejected"
    : "pending";

  const [filters, setFilters] = useState({
    status: routeStatus,
    search: "",
    page: 1,
    limit: 20,
  });

  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Sync filter status with route when route changes
  React.useEffect(() => {
    if (filters.status !== routeStatus) {
      setFilters((prev) => ({
        ...prev,
        status: routeStatus,
        page: 1,
      }));
    }
  }, [routeStatus, filters.status]);

  const { data: kycData, isLoading, error } = useKYCRequests(filters);
  const approveKYC = useApproveKYC();
  const rejectKYC = useRejectKYC();

  const kycRequests = kycData?.data?.requests || [];
  const pagination = kycData?.data?.pagination;

  const handleApprove = async (kycId: string) => {
    if (confirm("Are you sure you want to approve this KYC request?")) {
      await approveKYC.mutateAsync(kycId);
    }
  };

  const handleReject = async (kycId: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    await rejectKYC.mutateAsync({ kycId, reason: rejectReason });
    setRejectReason("");
    setShowDetailsModal(false);
  };

  const viewDetails = (kyc: any) => {
    setSelectedKYC(kyc);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <div className="badge badge-success">Approved</div>;
      case "rejected":
        return <div className="badge badge-error">Rejected</div>;
      case "pending":
        return <div className="badge badge-warning">Pending</div>;
      default:
        return <div className="badge">Unknown</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7" />
            KYC Verification
          </h1>
          <p className="text-base-content/70">
            Review and manage user identity verification requests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="form-control flex-1">
              <div className="input-group">
                <span>
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="input input-bordered w-full"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value, page: 1 })
                  }
                />
              </div>
            </div>
            <div className="form-control">
              <select
                className="select select-bordered"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value, page: 1 })
                }
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Requests Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>Failed to load KYC requests</span>
            </div>
          ) : kycRequests.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No KYC requests found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Document Type</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycRequests.map((kyc: any) => (
                      <tr key={kyc._id}>
                        <td>
                          <div>
                            <div className="font-semibold">
                              {kyc.user?.profile?.firstName}{" "}
                              {kyc.user?.profile?.lastName}
                            </div>
                            <div className="text-sm text-base-content/60">
                              {kyc.user?.email}
                            </div>
                          </div>
                        </td>
                        <td>{kyc.documentType || "N/A"}</td>
                        <td>
                          {new Date(kyc.submittedAt).toLocaleDateString()}
                        </td>
                        <td>{getStatusBadge(kyc.status)}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => viewDetails(kyc)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {kyc.status === "pending" && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleApprove(kyc._id)}
                                  disabled={approveKYC.isPending}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  className="btn btn-error btn-sm"
                                  onClick={() => viewDetails(kyc)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="join">
                    <button
                      className="join-item btn"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        setFilters({ ...filters, page: pagination.page - 1 })
                      }
                    >
                      «
                    </button>
                    <button className="join-item btn">
                      Page {pagination.page} of {pagination.pages}
                    </button>
                    <button
                      className="join-item btn"
                      disabled={pagination.page === pagination.pages}
                      onClick={() =>
                        setFilters({ ...filters, page: pagination.page + 1 })
                      }
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedKYC && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">KYC Request Details</h3>

            <div className="space-y-4">
              {/* User Info */}
              <div>
                <h4 className="font-semibold mb-2">User Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-base-content/60">Name:</span>
                    <span className="ml-2">
                      {selectedKYC.user?.profile?.firstName}{" "}
                      {selectedKYC.user?.profile?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/60">Email:</span>
                    <span className="ml-2">{selectedKYC.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-base-content/60">Phone:</span>
                    <span className="ml-2">
                      {selectedKYC.user?.phoneNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/60">Status:</span>
                    <span className="ml-2">
                      {getStatusBadge(selectedKYC.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div>
                <h4 className="font-semibold mb-2">Document Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-base-content/60">Type:</span>
                    <span className="ml-2">
                      {selectedKYC.documentType || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/60">Number:</span>
                    <span className="ml-2">
                      {selectedKYC.documentNumber || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/60">Submitted:</span>
                    <span className="ml-2">
                      {new Date(selectedKYC.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Images */}
              {selectedKYC.documentImages &&
                selectedKYC.documentImages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Document Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedKYC.documentImages.map(
                        (img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Document ${idx + 1}`}
                            className="w-full h-48 object-cover rounded border"
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Rejection Reason Input */}
              {selectedKYC.status === "pending" && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Rejection Reason (if rejecting)
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    placeholder="Enter reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Rejection Reason Display */}
              {selectedKYC.status === "rejected" &&
                selectedKYC.rejectionReason && (
                  <div className="alert alert-error">
                    <div>
                      <div className="font-semibold">Rejection Reason:</div>
                      <div>{selectedKYC.rejectionReason}</div>
                    </div>
                  </div>
                )}
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowDetailsModal(false);
                  setRejectReason("");
                }}
              >
                Close
              </button>
              {selectedKYC.status === "pending" && (
                <>
                  <button
                    className="btn btn-error"
                    onClick={() => handleReject(selectedKYC._id)}
                    disabled={rejectKYC.isPending || !rejectReason.trim()}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleApprove(selectedKYC._id);
                      setShowDetailsModal(false);
                    }}
                    disabled={approveKYC.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC;
