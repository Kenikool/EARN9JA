import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Search,
  Calendar,
  CreditCard,
  MapPin
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import type { Order } from "../types";

export default function Orders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch user orders
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const response = await api.get("/orders/myorders");
      return response.data.data as {
        orders: Order[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const orderResponse = await api.get(`/orders/${orderId}`);
      const order = orderResponse.data.data.order;

      // Add all items from the order to cart
      const cartPromises = order.items.map((item: { product: { _id: string }; quantity: number }) => 
        api.post("/cart", {
          product: item.product._id,
          quantity: item.quantity
        })
      );

      await Promise.all(cartPromises);
      return order;
    },
    onSuccess: () => {
      toast.success("Items added to cart successfully");
      navigate("/cart");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to reorder items");
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" style={{ color: '#f59e0b' }} />;
      case "processing":
        return <Package className="w-4 h-4" style={{ color: '#8b5cf6' }} />;
      case "shipped":
        return <Truck className="w-4 h-4" style={{ color: '#3b82f6' }} />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />;
      case "cancelled":
        return <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />;
      default:
        return <Clock className="w-4 h-4" style={{ color: '#9ca3af' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "processing":
        return "badge-info";
      case "shipped":
        return "badge-primary";
      case "delivered":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const canCancelOrder = (status: string) => {
    return ["pending", "processing"].includes(status);
  };

  const filteredOrders = ordersData?.orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = searchTerm === "" || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  }) || [];

  const handleCancelOrder = (order: Order) => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      cancelOrderMutation.mutate(order._id);
    }
  };

  const handleReorder = (order: Order) => {
    reorderMutation.mutate(order._id);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-base-300 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-base-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-base-content/60">
              Track and manage your orders
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="btn btn-outline btn-sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} style={{ color: '#22c55e' }} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 border mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="form-control">
                  <div className="input-group">
                    <span>
                      <Search className="w-4 h-4" style={{ color: '#6b7280' }} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search orders or products..."
                      className="input input-bordered flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="md:w-48">
                <div className="form-control">
                  <select
                    className="select select-bordered"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card bg-base-100 border">
            <div className="card-body text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? "No orders found" : "No orders yet"}
              </h3>
              <p className="text-base-content/60 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start shopping to see your orders here"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => navigate("/shop")}
                  className="btn btn-primary"
                >
                  Start Shopping
                  <ArrowRight className="w-4 h-4 ml-2" style={{ color: '#ffffff' }} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="card bg-base-100 border">
                <div className="card-body">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          Order #{order.orderNumber}
                        </h3>
                        <div className={`badge ${getStatusColor(order.status)} badge-sm`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" style={{ color: '#3b82f6' }} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" style={{ color: '#22c55e' }} />
                          {order.paymentMethod}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-base-content">
                            ${order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="btn btn-outline btn-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" style={{ color: '#3b82f6' }} />
                        Details
                      </button>
                      <button
                        onClick={() => handleReorder(order)}
                        className="btn btn-primary btn-sm"
                        disabled={reorderMutation.isPending}
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${reorderMutation.isPending ? 'animate-spin' : ''}`} style={{ color: '#ffffff' }} />
                        Reorder
                      </button>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="btn btn-error btn-sm"
                          disabled={cancelOrderMutation.isPending}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="flex flex-wrap gap-4">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 bg-base-200 rounded-lg p-3">
                          <img
                            src={item.image || "/placeholder-product.jpg"}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-base-content/60">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center w-12 h-12 bg-base-200 rounded-lg">
                          <span className="text-xs font-medium text-base-content/60">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <div className={`badge ${getStatusColor(selectedOrder.status)} badge-lg mb-4`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-2 capitalize text-sm">{selectedOrder.status}</span>
                </div>

                {/* Status Timeline */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Order Placed</span>
                  </div>
                  <div className="flex-1 h-px bg-base-300"></div>
                  {["processing", "shipped", "delivered"].includes(selectedOrder.status) && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Processing</span>
                    </div>
                  )}
                  {["shipped", "delivered"].includes(selectedOrder.status) && (
                    <div className="flex-1 h-px bg-base-300"></div>
                  )}
                  {["shipped", "delivered"].includes(selectedOrder.status) && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Shipped</span>
                    </div>
                  )}
                  {selectedOrder.status === "delivered" && (
                    <>
                      <div className="flex-1 h-px bg-base-300"></div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span>Delivered</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Items */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                        <img
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <p className="text-sm text-base-content/60">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Order Summary</h4>
                  <div className="card bg-base-200">
                    <div className="card-body space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${selectedOrder.itemsPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>${selectedOrder.shippingPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${selectedOrder.taxPrice.toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-success">
                          <span>Discount</span>
                          <span>-${selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="divider my-2"></div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-4">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#ef4444' }} />
                      Shipping Address
                    </h5>
                    <div className="text-sm text-base-content/80 bg-base-200 p-3 rounded">
                      <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <p>{selectedOrder.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                      </p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-action">
                <button
                  onClick={handleCloseDetails}
                  className="btn"
                >
                  Close
                </button>
                {canCancelOrder(selectedOrder.status) && (
                  <button
                    onClick={() => {
                      handleCloseDetails();
                      handleCancelOrder(selectedOrder);
                    }}
                    className="btn btn-error"
                    disabled={cancelOrderMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-1" style={{ color: '#ffffff' }} />
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => {
                    handleCloseDetails();
                    handleReorder(selectedOrder);
                  }}
                  className="btn btn-primary"
                  disabled={reorderMutation.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${reorderMutation.isPending ? 'animate-spin' : ''}`} style={{ color: '#ffffff' }} />
                  Reorder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
