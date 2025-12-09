import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import api from "../../services/api";
import SEO from "../../components/SEO";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function VendorOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: async () => {
      const response = await api.get("/vendor/orders");
      return response.data.data.orders;
    },
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  return (
    <>
      <SEO title="Orders - Vendor" />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-base-content/60">
            Manage orders containing your products
          </p>
        </div>

        {data && data.length > 0 ? (
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((order: { _id: string; orderNumber: string; user?: { name: string; email: string }; items?: unknown[]; totalPrice: number; status: string; createdAt: string }) => (
                      <tr key={order._id}>
                        <td className="font-mono text-sm">{order.orderNumber}</td>
                        <td>
                          <div>
                            <div className="font-medium">{order.user?.name}</div>
                            <div className="text-sm text-base-content/60">
                              {order.user?.email}
                            </div>
                          </div>
                        </td>
                        <td>{order.items?.length || 0}</td>
                        <td className="font-semibold">${order.totalPrice.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            order.status === "delivered" ? "badge-success" :
                            order.status === "shipped" ? "badge-info" :
                            order.status === "processing" ? "badge-warning" :
                            order.status === "cancelled" ? "badge-error" :
                            "badge-ghost"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
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
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-base-content/60">
                Orders will appear here once customers purchase your products
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
