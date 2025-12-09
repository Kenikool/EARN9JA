import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import api from "../../services/api";
import type { Order, Product } from "../../types";

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data.data;
    },
  });

  // Fetch low stock products
  const { data: lowStockData } = useQuery({
    queryKey: ["admin-low-stock"],
    queryFn: async () => {
      const response = await api.get("/admin/low-stock");
      return response.data.data.products;
    },
  });

  const stats = dashboardData?.overview;

  // Calculate percentage changes
  const calculateChange = (newVal: number, total: number) => {
    if (!total || !newVal) return 0;
    const oldVal = total - newVal;
    if (!oldVal) return 100;
    return ((newVal - oldVal) / oldVal) * 100;
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      change: stats?.periodRevenue && stats?.totalRevenue 
        ? calculateChange(stats.periodRevenue, stats.totalRevenue) 
        : 0,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      change: stats?.newOrders && stats?.totalOrders
        ? calculateChange(stats.newOrders, stats.totalOrders)
        : 0,
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      change: 0,
      icon: Package,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: stats?.newUsers && stats?.totalUsers
        ? calculateChange(stats.newUsers, stats.totalUsers)
        : 0,
      icon: Users,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-base-content/60">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <div
              key={index}
              className="card bg-base-100 border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="card-body p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60 mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-error" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isPositive ? "text-success" : "text-error"
                    }`}
                  >
                    {Math.abs(stat.change).toFixed(1)}%
                  </span>
                  <span className="text-sm text-base-content/60">
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {lowStockData && lowStockData.length > 0 && (
        <div className="alert alert-warning mb-6">
          <AlertTriangle className="w-6 h-6" />
          <div className="flex-1">
            <h3 className="font-bold">Low Stock Alert!</h3>
            <p className="text-sm">
              {lowStockData.length} product{lowStockData.length > 1 ? 's' : ''} running low on stock
            </p>
          </div>
          <Link to="/admin/products" className="btn btn-sm btn-outline">
            <ExternalLink className="w-4 h-4 mr-1" />
            View Products
          </Link>
        </div>
      )}

      {/* Sales Chart */}
      <div className="card bg-base-100 border shadow-sm mb-8">
        <div className="card-body p-5 md:p-6">
          <h2 className="card-title text-lg md:text-xl mb-4">
            Sales Overview
          </h2>
          <SalesChart />
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Low Stock Products Widget */}
        {lowStockData && lowStockData.length > 0 && (
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body p-5 md:p-6">
              <h2 className="card-title text-lg md:text-xl mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-warning mr-2" />
                Low Stock Products
              </h2>
              
              <div className="space-y-3">
                {lowStockData.slice(0, 5).map((product: any) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded">
                          <img
                            src={product.images?.[0] || '/placeholder.jpg'}
                            alt={product.name}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-base-content/60">
                          {product.category?.name || 'No Category'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-warning">{product.stock} left</p>
                      <p className="text-xs text-base-content/60">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                ))}
                
                {lowStockData.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to="/admin/products" className="link link-primary text-sm">
                      View all {lowStockData.length} low stock products
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
}

// Sales Chart Component
function SalesChart() {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["admin-sales-chart"],
    queryFn: async () => {
      const response = await api.get("/admin/analytics/sales?period=7&groupBy=day");
      return response.data.data;
    },
  });

  if (isLoading) {
    return <div className="skeleton h-80"></div>;
  }

  const sales = salesData?.salesData || [];
  
  if (sales.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-base-content/60">
        <ShoppingBag className="w-16 h-16 text-base-content/30 mb-4" />
        <p className="text-lg font-medium">No sales data available</p>
        <p className="text-sm">Sales data will appear here once you have orders</p>
      </div>
    );
  }

  const maxSales = Math.max(...sales.map((s: { totalSales: number }) => s.totalSales), 1);
  const totalSales = sales.reduce((sum: number, s: { totalSales: number }) => sum + s.totalSales, 0);
  const avgSales = totalSales / sales.length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-base-200 rounded-lg">
        <div>
          <p className="text-xs text-base-content/60 mb-1">Total Sales</p>
          <p className="text-xl font-bold text-success">${totalSales.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-base-content/60 mb-1">Average/Day</p>
          <p className="text-xl font-bold text-primary">${avgSales.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-base-content/60 mb-1">Peak Day</p>
          <p className="text-xl font-bold text-warning">${maxSales.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-base-content/60 pr-2">
          <span>${maxSales.toFixed(0)}</span>
          <span>${(maxSales * 0.75).toFixed(0)}</span>
          <span>${(maxSales * 0.5).toFixed(0)}</span>
          <span>${(maxSales * 0.25).toFixed(0)}</span>
          <span>$0</span>
        </div>

        {/* Chart bars */}
        <div className="ml-12 h-full flex items-end justify-between gap-2">
          {sales.map((day: { _id: string; totalSales: number; orderCount: number }, index: number) => {
            const height = (day.totalSales / maxSales) * 100;
            const date = new Date(day._id);
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-lg hover:from-primary-focus hover:to-primary transition-all cursor-pointer relative group"
                    style={{ height: `${height}%`, minHeight: "8px" }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-base-300 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <p className="text-xs font-semibold">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      <p className="text-sm font-bold text-success">${day.totalSales.toFixed(2)}</p>
                      <p className="text-xs text-base-content/60">{day.orderCount} orders</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-base-content/60 text-center font-medium">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                  <br />
                  <span className="text-[10px]">{date.getDate()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Recent Orders Component
function RecentOrders() {
  const navigate = useNavigate();
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const response = await api.get("/orders?limit=5");
      return response.data.data;
    },
  });

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

  return (
    <div className="card bg-base-100 border shadow-sm">
      <div className="card-body p-5 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-lg md:text-xl">Recent Orders</h2>
          <button
            onClick={() => navigate("/admin/orders")}
            className="btn btn-ghost btn-sm"
          >
            View All
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16"></div>
            ))}
          </div>
        ) : !ordersData?.orders || ordersData.orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-base-content/60">
            <ShoppingBag className="w-16 h-16 text-base-content/30 mb-4" />
            <p className="text-lg font-medium mb-2">No orders yet</p>
            <p className="text-sm text-center">Orders will appear here once customers start purchasing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ordersData?.orders?.slice(0, 5).map((order: Order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold font-mono text-sm">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {typeof order.user === "object" && order.user?.name
                      ? order.user.name
                      : order.shippingAddress?.fullName}
                  </p>
                </div>
                <div className="text-right mr-3">
                  <p className="font-semibold">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-base-content/60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`badge badge-sm ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Top Products Component
function TopProducts() {
  const navigate = useNavigate();
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-top-products"],
    queryFn: async () => {
      const response = await api.get("/products?sort=-sold&limit=5");
      return response.data.data;
    },
  });

  return (
    <div className="card bg-base-100 border shadow-sm">
      <div className="card-body p-5 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-lg md:text-xl">Top Products</h2>
          <button
            onClick={() => navigate("/admin/products")}
            className="btn btn-ghost btn-sm"
          >
            View All
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16"></div>
            ))}
          </div>
        ) : !productsData?.products || productsData.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-base-content/60">
            <Package className="w-16 h-16 text-base-content/30 mb-4" />
            <p className="text-lg font-medium mb-2">No products yet</p>
            <p className="text-sm text-center">Add products to see top sellers here</p>
            <button
              onClick={() => navigate("/admin/products")}
              className="btn btn-primary btn-sm mt-4"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {productsData?.products?.slice(0, 5).map((product: Product) => (
              <div
                key={product._id}
                className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div className="avatar">
                  <div className="w-12 h-12 rounded">
                    <img
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-base-content/60">
                    ${product.price.toFixed(2)} • {product.sold || 0} sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">
                    ${(product.price * (product.sold || 0)).toFixed(2)}
                  </p>
                  <p className="text-xs text-base-content/60">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
