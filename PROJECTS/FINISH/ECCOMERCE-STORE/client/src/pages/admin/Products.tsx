import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import ProductFormModal from "../../components/admin/ProductFormModal";
import type { Product } from "../../types";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products", searchTerm],
    queryFn: async () => {
      const response = await api.get(`/products?search=${searchTerm}`);
      return response.data.data;
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete._id);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setProductToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-base-content/60">Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2 icon-navbar" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card bg-base-100 border mb-6">
        <div className="card-body">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search products..."
                className="input input-bordered flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-square">
                <Search className="w-5 h-5 icon-navbar" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card bg-base-100 border">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
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
                ) : productsData?.products?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      No products found
                    </td>
                  </tr>
                ) : (
                  productsData?.products?.map((product: Product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="avatar">
                          <div className="w-12 h-12 rounded">
                            <img
                              src={product.images?.[0] || "/placeholder.jpg"}
                              alt={product.name}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-base-content/60">
                          {product.slug}
                        </div>
                      </td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            product.stock > 10
                              ? "badge-success"
                              : product.stock > 0
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        {typeof product.category === 'object' && product.category?.name 
                          ? product.category.name 
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            product.isActive ? "badge-success" : "badge-error"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-xs">
                            <Eye className="w-4 h-4 icon-interactive" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4 icon-interactive" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="w-4 h-4 icon-interactive-error" />
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

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Delete Product</h3>
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="bg-base-200 p-4 rounded-lg flex items-center gap-4">
                <img
                  src={productToDelete.images?.[0] || "/placeholder.jpg"}
                  alt={productToDelete.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{productToDelete.name}</p>
                  <p className="text-sm text-base-content/60">
                    ${productToDelete.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={handleCancelDelete}
                disabled={deleteProductMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleConfirmDelete}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 icon-navbar" />
                    Delete Product
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
