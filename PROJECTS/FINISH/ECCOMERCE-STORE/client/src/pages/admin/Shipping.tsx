import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

interface ShippingMethod {
  _id: string;
  name: string;
  description: string;
  zones: Array<{
    countries: string[];
    states: string[];
    baseRate: number;
    perKgRate: number;
  }>;
  estimatedDays: {
    min: number;
    max: number;
  };
  isActive: boolean;
  createdAt: string;
}

export default function AdminShipping() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<ShippingMethod | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    baseRate: "",
    perKgRate: "",
    minDays: "",
    maxDays: "",
    countries: "",
    isActive: true,
  });

  const { data: shippingData, isLoading } = useQuery({
    queryKey: ["admin-shipping"],
    queryFn: async () => {
      const response = await api.get("/admin/shipping");
      return response.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        description: data.description,
        zones: [
          {
            countries: data.countries.split(",").map((c: string) => c.trim()),
            states: [],
            baseRate: parseFloat(data.baseRate),
            perKgRate: parseFloat(data.perKgRate),
          },
        ],
        estimatedDays: {
          min: parseInt(data.minDays),
          max: parseInt(data.maxDays),
        },
        isActive: data.isActive,
      };

      if (selectedMethod) {
        const response = await api.put(`/admin/shipping/${selectedMethod._id}`, payload);
        return response.data;
      } else {
        const response = await api.post("/admin/shipping", payload);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(selectedMethod ? "Shipping method updated!" : "Shipping method created!");
      queryClient.invalidateQueries({ queryKey: ["admin-shipping"] });
      handleCloseModal();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save shipping method");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/shipping/${id}`);
    },
    onSuccess: () => {
      toast.success("Shipping method deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-shipping"] });
      setIsDeleteModalOpen(false);
      setMethodToDelete(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete shipping method");
    },
  });

  const handleAddMethod = () => {
    setSelectedMethod(null);
    setFormData({
      name: "",
      description: "",
      baseRate: "",
      perKgRate: "",
      minDays: "",
      maxDays: "",
      countries: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditMethod = (method: ShippingMethod) => {
    setSelectedMethod(method);
    setFormData({
      name: method.name,
      description: method.description,
      baseRate: method.zones[0]?.baseRate.toString() || "",
      perKgRate: method.zones[0]?.perKgRate.toString() || "",
      minDays: method.estimatedDays.min.toString(),
      maxDays: method.estimatedDays.max.toString(),
      countries: method.zones[0]?.countries.join(", ") || "",
      isActive: method.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMethod(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (method: ShippingMethod) => {
    setMethodToDelete(method);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (methodToDelete) {
      deleteMutation.mutate(methodToDelete._id);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setMethodToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shipping Methods</h1>
          <p className="text-base-content/60">Manage shipping zones and rates</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddMethod}>
          <Plus className="w-4 h-4 mr-2" />
          Add Shipping Method
        </button>
      </div>

      {/* Shipping Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48"></div>
          ))
        ) : shippingData?.methods?.length === 0 ? (
          <div className="col-span-full card bg-base-100 border">
            <div className="card-body text-center py-12">
              <Truck className="w-16 h-16 text-base-content/40 mx-auto mb-4" />
              <p className="text-base-content/60">No shipping methods yet</p>
              <button className="btn btn-primary mt-4" onClick={handleAddMethod}>
                Add First Method
              </button>
            </div>
          </div>
        ) : (
          shippingData?.methods?.map((method: ShippingMethod) => (
            <div key={method._id} className="card bg-base-100 border">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <h3 className="card-title text-lg">{method.name}</h3>
                  </div>
                  <span
                    className={`badge badge-sm ${
                      method.isActive ? "badge-success" : "badge-error"
                    }`}
                  >
                    {method.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-sm text-base-content/70 mb-4">
                  {method.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Base Rate:</span>
                    <span className="font-semibold">
                      ${method.zones[0]?.baseRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Per Kg:</span>
                    <span className="font-semibold">
                      ${method.zones[0]?.perKgRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Delivery:</span>
                    <span className="font-semibold">
                      {method.estimatedDays.min}-{method.estimatedDays.max} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Countries:</span>
                    <span className="font-semibold">
                      {method.zones[0]?.countries.length || 0}
                    </span>
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleEditMethod(method)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => handleDelete(method)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Shipping Method Form Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-2xl font-bold mb-4">
              {selectedMethod ? "Edit Shipping Method" : "Add Shipping Method"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Method Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Shipping"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    The display name for this shipping option (e.g., "Express Delivery", "Economy Shipping")
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this shipping method"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    A brief description customers will see (e.g., "Fast delivery within 2-3 business days")
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Base Rate ($) *</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered"
                    value={formData.baseRate}
                    onChange={(e) =>
                      setFormData({ ...formData, baseRate: e.target.value })
                    }
                    placeholder="5.00"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Fixed cost for any order
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Per Kg Rate ($) *</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered"
                    value={formData.perKgRate}
                    onChange={(e) =>
                      setFormData({ ...formData, perKgRate: e.target.value })
                    }
                    placeholder="2.00"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Additional cost per kilogram
                    </span>
                  </label>
                </div>
              </div>

              <div className="alert alert-info text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>
                  <strong>Shipping Cost Formula:</strong> Base Rate + (Total Weight × Per Kg Rate)
                  <br />
                  Example: $5.00 + (3kg × $2.00) = $11.00
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Min Days *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.minDays}
                    onChange={(e) =>
                      setFormData({ ...formData, minDays: e.target.value })
                    }
                    placeholder="2"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Minimum delivery days
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Days *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.maxDays}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDays: e.target.value })
                    }
                    placeholder="5"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Maximum delivery days
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Countries (comma-separated) *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.countries}
                  onChange={(e) =>
                    setFormData({ ...formData, countries: e.target.value })
                  }
                  placeholder="US, CA, GB, AU"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    List of country codes where this shipping method is available (e.g., US, CA, GB, AU, DE)
                  </span>
                </label>
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
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Only active shipping methods will be available to customers at checkout
                  </span>
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
                    : selectedMethod
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && methodToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Delete Shipping Method</h3>
            <div className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>This action cannot be undone!</span>
            </div>
            <p className="text-base-content/70 mb-4">
              Are you sure you want to delete the shipping method <strong>"{methodToDelete.name}"</strong>?
            </p>
            <p className="text-sm text-base-content/60 mb-4">
              This will remove the shipping option from your store. Any existing orders using this method will not be affected.
            </p>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancelDelete}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Method
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCancelDelete}></div>
        </div>
      )}
    </div>
  );
}
