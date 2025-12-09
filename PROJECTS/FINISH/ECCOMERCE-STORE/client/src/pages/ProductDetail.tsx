import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Eye,
} from "lucide-react";
import SocialShare from "../components/SocialShare";
import { useCartStore } from "../stores/cartStore";
import { useWishlist } from "../hooks/useWishlist";
import SEO from "../components/SEO";
import ProductSchema from "../components/ProductSchema";
import SimilarProducts from "../components/SimilarProducts";
import api from "../services/api";
import type { Product, Review } from "../types";

// Image Gallery Component
function ImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-base-200 rounded-lg overflow-hidden">
        <img
          src={(images && images[selectedImage]) || "/placeholder-product.jpg"}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Images */}
      {images && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                selectedImage === index ? "border-primary" : "border-base-300"
              }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Product Info Component
function ProductInfo({
  product,
  selectedVariant,
  onVariantChange,
  quantity,
  onQuantityChange,
  onAddToCart,
  onAddToWishlist,
  inWishlist,
  isTogglingWishlist,
  isAddingToCart,
  isInCart,
}: {
  product: Product;
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  inWishlist: boolean;
  isTogglingWishlist: boolean;
  isAddingToCart: boolean;
  isInCart: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Title and Rating */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.averageRating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-base-content/60 ml-1">
              {(product.averageRating || 0).toFixed(1)} ({product.totalReviews || 0}{" "}
            </span>
          </div>
          <span className="text-sm text-base-content/60 flex items-center gap-1">
            <Eye className="w-4 h-4" style={{ color: '#3b82f6' }} />
            {product.views} views
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold text-primary">
          ${(product.price || 0).toFixed(2)}
        </span>
        {product.compareAtPrice && (
          <span className="text-xl text-base-content/60 line-through">
            ${(product.compareAtPrice || 0).toFixed(2)}
          </span>
        )}
        {product.compareAtPrice && product.price && (
          <span className="badge badge-primary">
            {Math.round(
              ((product.compareAtPrice - product.price) /
                product.compareAtPrice) *
                100
            )}
            % off
          </span>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-base-content/80 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Options</h3>
          <div className="space-y-4">
            {product.variants.map((variant) => (
              <div key={variant.name}>
                <label className="block text-sm font-medium mb-2">
                  {variant.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => onVariantChange(option)}
                      className={`btn btn-outline btn-sm ${
                        selectedVariant === option ? "btn-active" : ""
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {product.specifications.map((spec, index) => (
              <div
                key={index}
                className="flex justify-between py-2 border-b border-base-300"
              >
                <span className="font-medium">{spec.key}</span>
                <span className="text-base-content/70">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center border border-base-300 rounded-lg">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="btn btn-ghost btn-sm btn-square"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
            <button
              onClick={() =>
                onQuantityChange(Math.min(product.stock, quantity + 1))
              }
              className="btn btn-ghost btn-sm btn-square"
              disabled={quantity >= product.stock}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-base-content/60">
            {product.stock} available
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAddToCart}
            className={`btn flex-1 ${
              isInCart ? "btn-success" : "btn-primary"
            }`}
            disabled={product.stock === 0 || isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Adding...
              </>
            ) : isInCart ? (
              <>
                <ShoppingCart className="w-5 h-5" style={{ color: '#ffffff' }} />
                View Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" style={{ color: '#ffffff' }} />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </>
            )}
          </button>
          <button
            onClick={onAddToWishlist}
            className={`btn btn-outline ${inWishlist ? 'text-error border-error' : ''}`}
            disabled={isTogglingWishlist}
          >
            {isTogglingWishlist ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} style={{ color: inWishlist ? '#ef4444' : '#3b82f6' }} />
            )}
          </button>
          <SocialShare 
            productId={product._id}
            productName={product.name}
            productImage={product.images?.[0]}
          />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-base-300">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8" style={{ color: '#3b82f6' }} />
          <div>
            <h4 className="font-semibold">Free Shipping</h4>
            <p className="text-sm text-base-content/60">On orders over $50</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" style={{ color: '#22c55e' }} />
          <div>
            <h4 className="font-semibold">Secure Payment</h4>
            <p className="text-sm text-base-content/60">SSL encrypted</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="w-8 h-8" style={{ color: '#f59e0b' }} />
          <div>
            <h4 className="font-semibold">Easy Returns</h4>
            <p className="text-sm text-base-content/60">30-day policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reviews Section Component
function ReviewsSection({ productId }: { productId: string }) {
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data?.data || response.data || { items: [] };
    },
    enabled: !!productId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-base-300 rounded-lg p-4">
            <div className="skeleton h-4 w-32 mb-2"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const reviews = reviewsData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Customer Reviews ({reviews.length})
        </h3>
        <button className="btn btn-primary btn-sm">Write a Review</button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-base-content/60">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Review) => (
            <div
              key={review._id}
              className="border border-base-300 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-8">
                      <span className="text-xs">
                        {typeof review.user === "object" && review.user?.name
                          ? review.user.name.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">
                      {typeof review.user === "object" && review.user?.name
                        ? review.user.name
                        : "Anonymous"}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-base-content/60">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {review.title && (
                <h4 className="font-medium mb-2">{review.title}</h4>
              )}

              <p className="text-base-content/80 mb-3">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-base-content/60">
                  {review.verified && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Shield className="w-4 h-4" style={{ color: '#22c55e' }} />
                      Verified Purchase
                    </span>
                  )}
                  <span>{review.helpful} found this helpful</span>
                </div>
                <button className="btn btn-ghost btn-xs">
                  <Heart className="w-3 h-3 mr-1" style={{ color: '#ef4444' }} />
                  Helpful
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Related Products Component
function RelatedProducts({ productId }: { productId: string }) {
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ["related-products", productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/related`);
      return response.data?.data?.products || response.data?.products || [];
    },
    enabled: !!productId,
    retry: false,
  });

  if (isLoading || !relatedProducts?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Related Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.slice(0, 4).map((product: Product) => (
          <div key={product._id} className="card bg-base-100 shadow-lg">
            <figure className="h-32">
              <img
                src={
                  (product.images && product.images[0]) ||
                  "/placeholder-product.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </figure>
            <div className="card-body p-3">
              <h4 className="card-title text-sm line-clamp-2">
                <Link
                  to={`/product/${product.slug}`}
                  className="hover:text-primary"
                >
                  {product.name}
                </Link>
              </h4>
              <p className="text-primary font-semibold">
                ${(product.price || 0).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isLoading: isAddingToCart, cart } = useCartStore();
  const { toggleWishlist, isInWishlist, isTogglingWishlist } = useWishlist();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await api.get(`/products/${slug}`);
      console.log('API Response:', response.data);
      
      // Backend returns: { status: "success", data: { product: {...} } }
      const productData = response.data?.data?.product || response.data?.product;
      
      if (!productData) {
        console.error('Product not found in response:', response.data);
        throw new Error('Product not found');
      }
      
      // Track product view for AI recommendations
      if (productData._id) {
        api.post('/ai/track', { productId: productData._id }).catch(err => {
          console.log('View tracking failed:', err);
        });
      }
      
      return productData;
    },
    enabled: !!slug,
    retry: 1,
  });

  // Early return if no slug
  if (!slug) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Product</h1>
        <p className="text-base-content/60 mb-4">
          The product you're looking for doesn't exist.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="skeleton aspect-square w-full"></div>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton w-20 h-20"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4"></div>
            <div className="skeleton h-6 w-1/2"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-base-content/60 mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product) {
      // Check if already in cart
      const isInCart = cart?.items?.some(
        (item) => item.product._id === product._id
      );
      
      if (isInCart) {
        navigate("/cart");
        return;
      }
      
      addToCart(product._id, quantity, selectedVariant);
    }
  };

  const isProductInCart = () => {
    if (!product) return false;
    return cart?.items?.some((item) => item.product._id === product._id) || false;
  };

  const handleAddToWishlist = () => {
    if (product) {
      toggleWishlist(product._id);
    }
  };

  return (
    <>
      <SEO 
        title={product.name}
        description={product.description}
        keywords={`${product.name}, ${product.category?.name || ''}, ${product.brand || ''}, buy online`}
        image={product.images?.[0] || ''}
        type="product"
      />
      <ProductSchema product={product} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-base-content/60 mb-6">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-primary">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-base-content">{product.name}</span>
        </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ImageGallery
          images={product.images || []}
          productName={product.name}
        />

        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          inWishlist={isInWishlist(product._id)}
          isTogglingWishlist={isTogglingWishlist}
          isAddingToCart={isAddingToCart}
          isInCart={isProductInCart()}
        />
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <ReviewsSection productId={product._id} />
      </div>

      {/* Related Products */}
      <RelatedProducts productId={product._id} />
      
      {/* AI-Powered Similar Products */}
      <div className="container mx-auto px-4">
        <SimilarProducts productId={product._id} limit={4} />
      </div>
    </div>
    </>
  );
}

