import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  className?: string;
  view?: "grid" | "list";
}

export default function ProductCard({
  product,
  className = "",
  view = "grid",
}: ProductCardProps) {
  const { addToCart, isAddingToCart, cart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist, isTogglingWishlist } = useWishlist();
  const navigate = useNavigate();

  // Check if product is already in cart
  const isInCart = cart?.items.some((item) => item.product._id === product._id);
  
  // Check if product is in wishlist
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (isInCart) {
      toast("Item already in cart. Redirecting...", { icon: "ℹ️" });
      navigate("/cart");
      return;
    }

    addToCart({ productId: product._id, quantity: 1 });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }
    toggleWishlist(product._id);
  };

  // List view
  if (view === "list") {
    return (
      <div className={`card card-side bg-base-100 shadow-lg ${className}`}>
        <Link to={`/product/${product.slug}`} className="w-48">
          <figure className="w-48 h-full">
            <img
              src={product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </figure>
        </Link>
        <div className="absolute top-2 left-2 z-10">
          {product.featured && (
            <div className="badge badge-primary">Featured</div>
          )}
          {product.stock === 0 && (
            <div className="badge badge-error">Out of Stock</div>
          )}
        </div>
        <div className="card-body">
          <h3 className="card-title">
            <Link
              to={`/product/${product.slug}`}
              className="hover:text-primary"
            >
              {product.name}
            </Link>
          </h3>
          <p className="text-base-content/70 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  style={{
                    color: i < Math.floor(product.averageRating) ? '#fbbf24' : '#d1d5db',
                    fill: i < Math.floor(product.averageRating) ? 'currentColor' : 'none'
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-base-content/60">
              ({product.totalReviews})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-base-content/60 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                className={`btn btn-ghost btn-sm ${inWishlist ? 'text-error' : ''}`}
                onClick={handleWishlist}
                disabled={isTogglingWishlist}
              >
                {isTogglingWishlist ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Heart
                    className="w-4 h-4"
                    style={{
                      color: inWishlist ? '#ef4444' : '#ec4899',
                      fill: inWishlist ? 'currentColor' : 'none'
                    }}
                  />
                )}
              </button>
              <button
                className={`btn btn-sm ${
                  isInCart ? "btn-success" : "btn-primary"
                }`}
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
              >
                {isAddingToCart ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : isInCart ? (
                  <>
                    <ShoppingCart className="w-4 h-4" style={{ color: '#22c55e' }} />
                    View Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" style={{ color: '#10b981' }} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-base-content/60">
            <span>In stock: {product.stock}</span>
            <span>{product.sold} sold</span>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={`card bg-base-100 shadow-lg hover:shadow-xl transition-shadow ${className}`}
    >
      <Link to={`/product/${product.slug}`}>
        <figure className="relative cursor-pointer">
          <img
            src={product.images[0] || "/placeholder-product.jpg"}
            alt={product.name}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <div className="badge badge-primary absolute top-2 left-2">
              Featured
            </div>
          )}
          {product.stock === 0 && (
            <div className="badge badge-error absolute top-2 left-2">
              Out of Stock
            </div>
          )}
        </figure>
      </Link>
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          className={`btn btn-circle btn-sm btn-ghost bg-base-100/80 hover:bg-base-100 ${inWishlist ? 'text-error' : ''}`}
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
        >
          {isTogglingWishlist ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Heart
              className="w-4 h-4"
              style={{
                color: inWishlist ? '#ef4444' : '#ec4899',
                fill: inWishlist ? 'currentColor' : 'none'
              }}
            />
          )}
        </button>
      </div>
      <div className="card-body p-4">
        <h3 className="card-title text-lg line-clamp-2">
          <Link to={`/product/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4"
                style={{
                  color: i < Math.floor(product.averageRating) ? '#fbbf24' : '#d1d5db',
                  fill: i < Math.floor(product.averageRating) ? 'currentColor' : 'none'
                }}
              />
            ))}
          </div>
          <span className="text-sm text-base-content/60">
            ({product.totalReviews})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-base-content/60 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`btn btn-sm ${isInCart ? "btn-success" : "btn-primary"}`}
            disabled={isAddingToCart || product.stock === 0}
          >
            {isAddingToCart ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : isInCart ? (
              <>
                <ShoppingCart className="w-4 h-4" style={{ color: '#22c55e' }} />
                View Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" style={{ color: '#10b981' }} />
                Add to Cart
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-base-content/60 mt-2">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" style={{ color: '#3b82f6' }} />
            {product.views}
          </span>
          <span>{product.sold} sold</span>
        </div>
      </div>
    </div>
  );
}
