import { useQuery } from "@tanstack/react-query";
import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import api from "../../services/api";
import SEO from "../../components/SEO";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-dashboard"],
    queryFn: async () => {
      const response = await api.get("/vendor/dashboard");
      return response.data.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  const stats = data?.stats;
  const vendor = data?.vendor;

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Pending Payouts",
      value: `$${stats?.pendingPayouts?.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <>
      <SEO title="Vendor Dashboard" />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-base-content/60">
            Welcome back, {vendor?.businessName}
          </p>
          {vendor?.status === "pending" && (
            <div className="alert alert-warning mt-4">
              Your vendor account is pending approval
            </div>
          )}
          {vendor?.status === "suspended" && (
            <div className="alert alert-error mt-4">
              Your vendor account has been suspended
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card bg-base-100 border shadow-sm">
                <div className="card-body p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60 mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="card bg-base-100 border shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Recent Orders</h2>
            {data?.recentOrders?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order: { _id: string; orderNumber: string; user?: { name: string }; totalPrice: number; status: string; createdAt: string }) => (
                      <tr key={order._id}>
                        <td className="font-mono text-sm">{order.orderNumber}</td>
                        <td>{order.user?.name}</td>
                        <td>${order.totalPrice.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            order.status === "delivered" ? "badge-success" :
                            order.status === "shipped" ? "badge-info" :
                            order.status === "processing" ? "badge-warning" :
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
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
