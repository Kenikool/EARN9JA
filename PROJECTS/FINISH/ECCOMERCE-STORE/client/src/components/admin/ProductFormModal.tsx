import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../services/api";
import type { Product } from "../../types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
}: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "",
    brand: "",
    stock: "",
    sku: "",
    images: [] as string[],
    isActive: true,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data.data;
    },
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        compareAtPrice: product.compareAtPrice?.toString() || "",
        category: typeof product.category === 'object' ? product.category._id : product.category || "",
        brand: product.brand || "",
        stock: product.stock?.toString() || "",
        sku: product.sku || "",
        images: product.images || [],
        isActive: product.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        compareAtPrice: "",
        category: "",
        brand: "",
        stock: "",
        sku: "",
        images: [],
        isActive: true,
      });
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (product) {
        const response = await api.put(`/products/${product._id}`, data);
        return response.data;
      } else {
        const response = await api.post("/products", data);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(product ? "Product updated!" : "Product created!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleImageAdd = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">
            {product ? "Edit Product" : "Add New Product"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Product Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description *</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          {/* Price & Compare Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Price *</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Compare At Price</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered"
                value={formData.compareAtPrice}
                onChange={(e) =>
                  setFormData({ ...formData, compareAtPrice: e.target.value })
                }
              />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Category *</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                {categoriesData?.categories?.map((cat: { _id: string; name: string }) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Brand</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          {/* Stock & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Stock *</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">SKU</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          {/* Images */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Product Images</span>
            </label>
            <div className="space-y-2">
              {formData.images.map((img, index) => (
                <div key={index} className="flex items-center gap-2">
                  <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    value={img}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="btn btn-error btn-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleImageAdd}
                className="btn btn-outline btn-sm"
              >
                Add Image URL
              </button>
            </div>
          </div>

          {/* Active Status */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Active Product</span>
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

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={saveMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending
                ? "Saving..."
                : product
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
