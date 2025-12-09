import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Tag } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    expiresAt: "",
    usageLimit: "",
    isActive: true,
  });

  const { data: couponsData, isLoading } = useQuery({
    queryKey: ["admin-coupons", searchTerm],
    queryFn: async () => {
      const response = await api.get(`/admin/coupons?search=${searchTerm}`);
      return response.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (selectedCoupon) {
        const response = await api.put(`/admin/coupons/${selectedCoupon._id}`, data);
        return response.data;
      } else {
        const response = await api.post("/admin/coupons", data);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(selectedCoupon ? "Coupon updated!" : "Coupon created!");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      handleCloseModal();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save coupon");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/coupons/${id}`);
    },
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: () => {
      toast.error("Failed to delete coupon");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.put(`/admin/coupons/${id}`, { isActive });
    },
    onSuccess: () => {
      toast.success("Coupon status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
  });

  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      expiresAt: "",
      usageLimit: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "",
      usageLimit: coupon.usageLimit.toString(),
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
  };

  const handleConfirmDelete = () => {
    if (couponToDelete) {
      deleteMutation.mutate(couponToDelete._id);
      setCouponToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setCouponToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-base-content/60">Manage discount coupons</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddCoupon}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="card bg-base-100 border mb-6">
        <div className="card-body">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search coupons..."
                className="input input-bordered flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-square">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="card bg-base-100 border">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Purchase</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <span className="loading loading-spinner loading-lg"></span>
                    </td>
                  </tr>
                ) : couponsData?.coupons?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  couponsData?.coupons?.map((coupon: Coupon) => (
                    <tr key={coupon._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary" />
                          <span className="font-mono font-bold">{coupon.code}</span>
                        </div>
                      </td>
                      <td>
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `$${coupon.discountValue}`}
                        {coupon.maxDiscount && (
                          <span className="text-xs text-base-content/60">
                            {" "}(max ${coupon.maxDiscount})
                          </span>
                        )}
                      </td>
                      <td>${coupon.minPurchase.toFixed(2)}</td>
                      <td>
                        <span className="text-sm">
                          {coupon.usedCount} / {coupon.usageLimit}
                        </span>
                        <div className="w-full bg-base-300 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-success toggle-sm"
                          checked={coupon.isActive}
                          onChange={(e) =>
                            toggleActiveMutation.mutate({
                              id: coupon._id,
                              isActive: e.target.checked,
                            })
                          }
                        />
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => handleDeleteClick(coupon)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Coupon Form Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-2xl font-bold mb-4">
              {selectedCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Coupon Code *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered uppercase"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Discount Type *</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Discount Value *</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Min Purchase *</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchase: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Discount</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Expires At *</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Usage Limit *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Active</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {saveMutation.isPending
                    ? "Saving..."
                    : selectedCoupon
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Delete Coupon</h3>
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to delete this coupon? This action cannot be undone.
              </p>
              <div className="bg-base-200 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Tag className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold font-mono text-lg">{couponToDelete.code}</p>
                    <p className="text-sm text-base-content/60">
                      {couponToDelete.discountType === "percentage"
                        ? `${couponToDelete.discountValue}% off`
                        : `$${couponToDelete.discountValue} off`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={handleCancelDelete}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Coupon
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
