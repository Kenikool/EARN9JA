import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Zap, Clock, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface FlashSale {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  discountPercentage: number;
  quantity: number;
  soldCount: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function AdminFlashSales() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    discountPercentage: 10,
    quantity: 100,
    startTime: '',
    endTime: '',
    isActive: true,
  });

  // Fetch all flash sales
  const { data: flashSales, isLoading } = useQuery({
    queryKey: ['admin-flash-sales'],
    queryFn: async () => {
      const { data } = await api.get('/admin/flash-sales');
      return data.data.flashSales as FlashSale[];
    },
  });

  // Fetch products for dropdown
  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=100');
      return data.data.products;
    },
  });

  // Create flash sale mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await api.post('/admin/flash-sales', data);
    },
    onSuccess: () => {
      toast.success('Flash sale created successfully!');
      setShowModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sales'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create flash sale');
    },
  });

  // Update flash sale mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await api.put(`/admin/flash-sales/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Flash sale updated successfully!');
      setShowModal(false);
      setEditingSale(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sales'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update flash sale');
    },
  });

  // Delete flash sale mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/flash-sales/${id}`);
    },
    onSuccess: () => {
      toast.success('Flash sale deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sales'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete flash sale');
    },
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      discountPercentage: 10,
      quantity: 100,
      startTime: '',
      endTime: '',
      isActive: true,
    });
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    setFormData({
      productId: sale.product._id,
      discountPercentage: sale.discountPercentage,
      quantity: sale.quantity,
      startTime: new Date(sale.startTime).toISOString().slice(0, 16),
      endTime: new Date(sale.endTime).toISOString().slice(0, 16),
      isActive: sale.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSale) {
      updateMutation.mutate({ id: editingSale._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this flash sale?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Flash Sales Management</h1>
        <button
          onClick={() => {
            setEditingSale(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Flash Sale
        </button>
      </div>

      {/* Flash Sales List */}
      {isLoading ? (
        <div className="text-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : flashSales && flashSales.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales.map((sale) => (
            <div key={sale._id} className="card bg-base-100 shadow-xl">
              <figure className="h-48">
                <img
                  src={sale.product.images?.[0] || '/placeholder.png'}
                  alt={sale.product.name}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <h2 className="card-title text-lg">{sale.product.name}</h2>
                  <span className={`badge ${sale.isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {sale.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-warning" />
                    <span>{sale.discountPercentage}% OFF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span>{sale.soldCount} / {sale.quantity} sold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-info" />
                    <span>
                      {new Date(sale.startTime).toLocaleDateString()} - {new Date(sale.endTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="btn btn-sm btn-outline"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sale._id)}
                    className="btn btn-sm btn-error btn-outline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
          <p className="text-base-content/60">No flash sales yet</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Product</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                >
                  <option value="">Select a product</option>
                  {products?.map((product: unknown) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Discount %</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) })}
                    min="1"
                    max="99"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Quantity</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Start Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">End Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Active</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSale(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    editingSale ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
}
