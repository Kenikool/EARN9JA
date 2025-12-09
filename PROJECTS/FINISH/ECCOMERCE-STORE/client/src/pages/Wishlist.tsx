import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Plus,
  Search,
  Grid,
  List,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";
import api from "../services/api";
import type { Product } from "../types";

interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

export default function Wishlist() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "price">(
    "newest"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Fetch cart to check if items are in cart
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response.data.data.cart;
    },
  });

  // Fetch wishlist items
  const {
    data: wishlistData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await api.get("/user/wishlist");
      return response.data.data as {
        items: WishlistItem[];
      };
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/user/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await api.post("/cart", { productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Add all to cart mutation
  const addAllToCartMutation = useMutation({
    mutationFn: async (items: WishlistItem[]) => {
      const promises = items.map((item) =>
        api.post("/cart", { productId: item.product._id, quantity: 1 })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Filter and sort wishlist items
  const filteredAndSortedItems = useMemo(() => {
    if (!wishlistData?.items) return [];

    const filtered = wishlistData.items.filter(
      (item) =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case "newest":
        return filtered.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
      case "oldest":
        return filtered.sort(
          (a, b) =>
            new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        );
      case "name":
        return filtered.sort((a, b) =>
          a.product.name.localeCompare(b.product.name)
        );
      case "price":
        return filtered.sort((a, b) => b.product.price - a.product.price);
      default:
        return filtered;
    }
  }, [wishlistData?.items, searchTerm, sortBy]);

  const handleAddToCart = (product: Product) => {
    // Check if already in cart
    const isInCart = cartData?.items?.some(
      (item: { product: { _id: string } }) => item.product._id === product._id
    );
    
    if (isInCart) {
      navigate("/cart");
      return;
    }

    setAddingProductId(product._id);
    addToCartMutation.mutate(
      { productId: product._id, quantity: 1 },
      {
        onSettled: () => {
          setAddingProductId(null);
        },
      }
    );
  };

  const isProductInCart = (productId: string) => {
    return cartData?.items?.some(
      (item: { product: { _id: string } }) => item.product._id === productId
    ) || false;
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const handleAddAllToCart = () => {
    if (filteredAndSortedItems.length > 0) {
      addAllToCartMutation.mutate(filteredAndSortedItems);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-base-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-base-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Error loading wishlist. Please try again.</span>
        </div>
      </div>
    );
  }

  const items = filteredAndSortedItems;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="w-10 h-10" style={{ color: '#ef4444' }} />
              My Wishlist
            </h1>
            <p className="text-xl text-base-content/70">
              {items.length > 0
                ? `${items.length} item${items.length !== 1 ? "s" : ""} saved`
                : "No items saved yet"}
            </p>
          </div>

          {items.length > 0 && (
            <div className="mt-4 lg:mt-0 flex gap-2">
              <button
                onClick={handleAddAllToCart}
                className="btn btn-primary"
                disabled={addAllToCartMutation.isPending}
              >
                <ShoppingCart className="w-4 h-4 mr-2" style={{ color: '#ffffff' }} />
                Add All to Cart
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Heart className="w-24 h-24 mx-auto mb-6" style={{ color: '#9ca3af' }} />
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-base-content/60 mb-8 max-w-md mx-auto">
              Start browsing our products and save your favorites for later!
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="btn btn-primary btn-lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" style={{ color: '#ffffff' }} />
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6b7280' }} />
                  <input
                    type="text"
                    placeholder="Search your wishlist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "newest" | "oldest" | "name" | "price"
                    )
                  }
                  className="select select-bordered"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="price">Price High-Low</option>
                </select>

                <div className="btn-group">
                  <button
                    className={`btn ${viewMode === "grid" ? "btn-active" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" style={{ color: viewMode === "grid" ? '#ffffff' : '#3b82f6' }} />
                  </button>
                  <button
                    className={`btn ${viewMode === "list" ? "btn-active" : ""}`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" style={{ color: viewMode === "list" ? '#ffffff' : '#3b82f6' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`card bg-base-100 border hover:shadow-lg transition-shadow ${
                    viewMode === "list" ? "flex-row" : ""
                  }`}
                >
                  <figure
                    className={`relative overflow-hidden ${
                      viewMode === "list" ? "w-32 shrink-0" : ""
                    }`}
                  >
                    <img
                      src={
                        item.product.images?.[0] || "/placeholder-product.jpg"
                      }
                      alt={item.product.name}
                      className={`object-cover cursor-pointer hover:scale-105 transition-transform ${
                        viewMode === "list" ? "w-full h-32" : "w-full h-48"
                      }`}
                      onClick={() =>
                        navigate(
                          `/product/${item.product.slug || item.product._id}`
                        )
                      }
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product._id)}
                      className="absolute top-2 right-2 btn btn-circle btn-error btn-sm"
                      disabled={removeFromWishlistMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#ffffff' }} />
                    </button>
                  </figure>

                  <div className="card-body p-4 flex-1">
                    <h3
                      className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                      onClick={() =>
                        navigate(
                          `/product/${item.product.slug || item.product._id}`
                        )
                      }
                    >
                      {item.product.name}
                    </h3>

                    {item.product.description && viewMode === "list" && (
                      <p className="text-xs text-base-content/60 mb-2 line-clamp-2">
                        {item.product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          ${item.product.price.toFixed(2)}
                        </span>
                        {item.product.compareAtPrice &&
                          item.product.compareAtPrice > item.product.price && (
                            <span className="text-sm text-base-content/50 line-through">
                              ${item.product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                      </div>

                      {item.product.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs" style={{ color: '#fbbf24' }}>★</span>
                          <span className="text-xs">
                            {item.product.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className={`btn btn-sm flex-1 ${
                          isProductInCart(item.product._id)
                            ? "btn-success"
                            : "btn-primary"
                        }`}
                        disabled={addingProductId === item.product._id}
                      >
                        {addingProductId === item.product._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : isProductInCart(item.product._id) ? (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-1" style={{ color: '#ffffff' }} />
                            In Cart
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" style={{ color: '#ffffff' }} />
                            Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/product/${item.product.slug || item.product._id}`
                          )
                        }
                        className="btn btn-outline btn-sm"
                      >
                        <Eye className="w-3 h-3 mr-1" style={{ color: '#3b82f6' }} />
                        View
                      </button>
                    </div>

                    <div className="text-xs text-base-content/50 mt-2">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
