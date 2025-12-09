import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isOpen, setCartOpen, updateCartItem, removeFromCart, isLoading } = useCartStore();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-base-100 shadow-xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" style={{ color: '#10b981' }} />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            {cart && cart.totalItems > 0 && (
              <span className="badge badge-primary badge-sm">{cart.totalItems}</span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-base-content/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-base-content/60 mb-4">Add some products to get started</p>
              <Link
                to="/shop"
                className="btn btn-primary"
                onClick={() => setCartOpen(false)}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item._id} className="card bg-base-200 p-4">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-lg">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-medium text-sm hover:text-primary line-clamp-2"
                        onClick={() => setCartOpen(false)}
                      >
                        {item.product.name}
                      </Link>

                      {item.variant && (
                        <p className="text-xs text-base-content/60 mt-1">
                          Variant: {item.variant}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={isLoading}
                            className="btn btn-ghost btn-xs"
                          >
                            <Minus className="w-3 h-3" style={{ color: '#ef4444' }} />
                          </button>

                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={isLoading || item.quantity >= item.product.stock}
                            className="btn btn-ghost btn-xs"
                          >
                            <Plus className="w-3 h-3" style={{ color: '#22c55e' }} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={isLoading}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-xs text-base-content/60">
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Cart Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-base-content/60">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link
                to="/checkout"
                className="btn btn-primary w-full"
                onClick={() => setCartOpen(false)}
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/cart"
                className="btn btn-outline w-full"
                onClick={() => setCartOpen(false)}
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}