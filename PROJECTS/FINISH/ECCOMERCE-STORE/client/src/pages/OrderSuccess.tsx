import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Home, 
  Download,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import api from "../services/api";
import { useCart } from "../hooks/useCart";
import type { Order } from "../types";

interface OrderWithItems extends Order {
  items: Array<{
    product: {
      _id: string;
      name: string;
      images: string[];
      price: number;
    };
    quantity: number;
    price: number;
  }>;
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const [orderPlacedTime] = useState(new Date());
  const { clearCart } = useCart();
  const [cartCleared, setCartCleared] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data.order as OrderWithItems;
    },
    enabled: !!orderId,
    retry: false,
  });

  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  // Clear cart only when payment is confirmed (isPaid is true)
  useEffect(() => {
    if (order && !cartCleared) {
      // Only clear cart if payment is confirmed
      if (order.isPaid) {
        clearCart();
        setCartCleared(true);
        console.log("Cart cleared after payment confirmation");
      } else {
        console.log("Waiting for payment confirmation before clearing cart");
      }
    }
  }, [order, cartCleared, clearCart]);

  if (!orderId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-success rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-base-300 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-6 bg-base-300 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-base-content/60 text-lg">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="card bg-base-100 border shadow-lg mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="card-title text-xl">
                  <Package className="w-6 h-6" />
                  Order Details
                </h2>
                <p className="text-sm text-base-content/60">
                  Order #{order?.orderNumber || orderId?.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-base-content/60">Order Date</p>
                <p className="font-medium">
                  {orderPlacedTime.toLocaleDateString()} at {orderPlacedTime.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Shipping Address */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h3>
                <div className="text-sm text-base-content/80">
                  {order?.shippingAddress && (
                    <>
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p>{order.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Info
                </h3>
                <div className="text-sm text-base-content/80">
                  <p>Order updates will be sent to your email</p>
                  <p className="text-primary">Check your inbox for confirmation</p>
                </div>
              </div>

              {/* Order Status */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Order Status
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Order Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-sm">Preparing for shipment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-base-300 rounded-full"></div>
                    <span className="text-sm">Out for delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card bg-base-100 border shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-6">
              <ShoppingBag className="w-6 h-6" />
              Items Ordered
            </h2>
            
            <div className="space-y-4">
              {order?.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-base-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images?.[0] || "/placeholder-product.jpg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-base-content/60">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-base-content/60">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card bg-base-100 border shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order?.itemsPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order?.shippingPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order?.taxPrice?.toFixed(2) || "0.00"}</span>
              </div>
              {order?.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({order?.coupon?.code})</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="divider"></div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">${order?.totalPrice?.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            {order?.paymentMethod && (
              <div className="mt-4 p-3 bg-base-200 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                </p>
                {order?.isPaid && (
                  <p className="text-sm text-success">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Payment Confirmed
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders" className="btn btn-outline">
            <Package className="w-4 h-4 mr-2" />
            View All Orders
          </Link>
          <Link to="/shop" className="btn btn-primary">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <button 
            onClick={() => window.print()} 
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Print Receipt
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-6 bg-info/10 border border-info/20 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            What's Next?
          </h3>
          <div className="space-y-2 text-sm">
            <p>• You'll receive an email confirmation shortly</p>
            <p>• We'll start preparing your order for shipment</p>
            <p>• You'll receive tracking information once your order ships</p>
            <p>• Estimated delivery: 3-7 business days</p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-base-content/60 mb-4">Need help with your order?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
            <Link to="/faq" className="text-primary hover:underline">
              View FAQ
            </Link>
            <Link to="/shipping-policy" className="text-primary hover:underline">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}