import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Truck,
  BarChart3,
  Settings,
  X,
  MessageCircle,
  Zap,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    label: "Products",
    icon: Package,
    path: "/admin/products",
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    path: "/admin/orders",
  },
  {
    label: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    label: "Support Chats",
    icon: MessageCircle,
    path: "/admin/support-chats",
  },
  {
    label: "Flash Sales",
    icon: Zap,
    path: "/admin/flash-sales",
  },
  {
    label: "Coupons",
    icon: Tag,
    path: "/admin/coupons",
  },
  {
    label: "Shipping",
    icon: Truck,
    path: "/admin/shipping",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30
          w-64 bg-base-100 border-r border-base-300 
          h-screen lg:h-[calc(100vh-4rem)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 lg:hidden">
          <span className="text-lg font-bold">Menu</span>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            <X className="w-5 h-5" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100%-4rem)] lg:h-full">
          <ul className="menu gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/admin"}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary text-primary-content font-medium"
                          : "hover:bg-base-200"
                      }`
                    }
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: item.path === '/admin' ? '#3b82f6' : /* Dashboard - Blue */
                              item.path === '/admin/products' ? '#22c55e' : /* Products - Green */
                              item.path === '/admin/orders' ? '#f59e0b' : /* Orders - Orange */
                              item.path === '/admin/users' ? '#8b5cf6' : /* Users - Purple */
                              item.path === '/admin/support-chats' ? '#10b981' : /* Support Chats - Green */
                              item.path === '/admin/flash-sales' ? '#eab308' : /* Flash Sales - Yellow */
                              item.path === '/admin/coupons' ? '#ec4899' : /* Coupons - Pink */
                              item.path === '/admin/shipping' ? '#06b6d4' : /* Shipping - Cyan */
                              item.path === '/admin/analytics' ? '#8b5cf6' : /* Analytics - Purple */
                              item.path === '/admin/settings' ? '#6b7280' : /* Settings - Gray */
                              '#6b7280' /* Default */
                      }}
                    />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
