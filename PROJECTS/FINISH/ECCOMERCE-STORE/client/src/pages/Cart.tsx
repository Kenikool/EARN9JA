import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const { cart, updateCartItem, removeFromCart, clearCart, isLoading } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 mx-auto mb-6" style={{ color: '#6b7280' }} />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-base-content/60 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/shop" className="btn btn-ghost">
            <ArrowLeft className="w-5 h-5" style={{ color: '#3b82f6' }} />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>
        <button
          onClick={handleClearCart}
          className="btn btn-outline btn-error"
          disabled={isLoading}
        >
          <Trash2 className="w-4 h-4 mr-2" style={{ color: '#ef4444' }} />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="card bg-base-100 shadow-lg">
              <div className="card-body p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-lg">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold line-clamp-2">
                      {item.product.name}
                    </h3>

                    {item.variant && (
                      <p className="text-sm text-base-content/60 mt-1">
                        Variant: {item.variant}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-base-content/60">
                          each
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-base-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={isLoading}
                            className="btn btn-ghost btn-sm btn-square"
                          >
                            <Minus className="w-4 h-4" style={{ color: '#ef4444' }} />
                          </button>

                          <span className="px-4 py-2 min-w-12 text-center font-medium">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={isLoading || item.quantity >= item.product.stock}
                            className="btn btn-ghost btn-sm btn-square"
                          >
                            <Plus className="w-4 h-4" style={{ color: '#22c55e' }} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={isLoading}
                          className="btn btn-ghost btn-sm btn-square text-error"
                        >
                          <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
                      <span className="text-sm text-base-content/60">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-sm text-base-content/60">
                        {item.product.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-lg sticky top-4">
            <div className="card-body">
              <h3 className="card-title">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Items ({cart.totalItems})</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-base-content/60">Calculated at checkout</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-base-content/60">Calculated at checkout</span>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <Link to="/checkout" className="btn btn-primary w-full">
                  Proceed to Checkout
                </Link>

                <Link to="/shop" className="btn btn-outline w-full">
                  Continue Shopping
                </Link>
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-base-300">
                <div className="flex items-center justify-center gap-4 text-sm text-base-content/60">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    SSL Encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}