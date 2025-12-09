import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Settings, Store } from "lucide-react";

export default function VendorLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/vendor/products", icon: Package, label: "Products" },
    { path: "/vendor/orders", icon: ShoppingBag, label: "Orders" },
    { path: "/vendor/payouts", icon: DollarSign, label: "Payouts" },
    { path: "/vendor/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-base-200 border-r hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Store className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Vendor Portal</span>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden navbar bg-base-100 border-b">
          <div className="flex-1">
            <Store className="w-6 h-6 text-primary mr-2" />
            <span className="text-lg font-bold">Vendor Portal</span>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
