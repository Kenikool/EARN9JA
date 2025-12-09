import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import api from "../../services/api";
import SEO from "../../components/SEO";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function VendorProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-products"],
    queryFn: async () => {
      const response = await api.get("/vendor/products");
      return response.data.data.products;
    },
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  return (
    <>
      <SEO title="My Products - Vendor" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-base-content/60">
              Manage your product listings
            </p>
          </div>
          <Link to="/vendor/products/new" className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Link>
        </div>

        {data && data.length > 0 ? (
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((product: { _id: string; name: string; images?: string[]; sku?: string; category?: { name: string }; price: number; stock: number; isActive: boolean }) => (
                      <tr key={product._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded">
                                <img
                                  src={product.images?.[0] || "/placeholder.jpg"}
                                  alt={product.name}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-base-content/60">
                                SKU: {product.sku || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{product.category?.name || "N/A"}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            product.stock === 0 ? "badge-error" :
                            product.stock < 10 ? "badge-warning" :
                            "badge-success"
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            product.isActive ? "badge-success" : "badge-ghost"
                          }`}>
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Link
                              to={`/vendor/products/${product._id}/edit`}
                              className="btn btn-sm btn-ghost"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button className="btn btn-sm btn-ghost text-error">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-base-content/60 mb-4">
                Start by adding your first product
              </p>
              <Link to="/vendor/products/new" className="btn btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
