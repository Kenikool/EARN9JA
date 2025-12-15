import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  X,
  Shield,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Sliders,
  Send,
  Smartphone,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      path: "/dashboard/analytics",
    },
    {
      title: "User Management",
      icon: Users,
      path: "/dashboard/users",
      submenu: [
        { title: "All Users", path: "/dashboard/users" },
        { title: "Active Users", path: "/dashboard/users/active" },
        { title: "Suspended Users", path: "/dashboard/users/suspended" },
      ],
    },
    {
      title: "Task Management",
      icon: FileText,
      path: "/dashboard/tasks",
      submenu: [
        { title: "All Tasks", path: "/dashboard/tasks" },
        { title: "Pending Approval", path: "/dashboard/tasks/pending" },
        { title: "Approved Tasks", path: "/dashboard/tasks/approved" },
        { title: "Rejected Tasks", path: "/dashboard/tasks/rejected" },
      ],
    },
    {
      title: "Withdrawal Management",
      icon: DollarSign,
      path: "/dashboard/withdrawals",
      submenu: [
        {
          title: "Pending Withdrawals",
          path: "/dashboard/withdrawals/pending",
        },
        {
          title: "Approved Withdrawals",
          path: "/dashboard/withdrawals/approved",
        },
        {
          title: "Rejected Withdrawals",
          path: "/dashboard/withdrawals/rejected",
        },
      ],
    },
    {
      title: "Dispute Resolution",
      icon: AlertTriangle,
      path: "/dashboard/disputes",
      submenu: [
        { title: "Pending Disputes", path: "/dashboard/disputes/pending" },
        { title: "Resolved Disputes", path: "/dashboard/disputes/resolved" },
      ],
    },
    {
      title: "Revenue & Payments",
      icon: TrendingUp,
      path: "/dashboard/revenue",
      submenu: [
        { title: "Revenue Report", path: "/dashboard/revenue" },
        { title: "Payment History", path: "/dashboard/revenue/payments" },
        { title: "Commission Report", path: "/dashboard/revenue/commission" },
      ],
    },
    {
      title: "Platform Management",
      icon: Shield,
      path: "/dashboard/platform",
      submenu: [
        { title: "System Status", path: "/dashboard/platform/status" },
        { title: "Security Logs", path: "/dashboard/platform/security" },
        { title: "Configuration", path: "/dashboard/platform/config" },
        { title: "Platform Settings", path: "/dashboard/platform/settings" },
        { title: "Messaging Center", path: "/dashboard/messaging" },
        { title: "Version Manager", path: "/dashboard/versions" },
      ],
    },
    {
      title: "Support",
      icon: MessageSquare,
      path: "/dashboard/support",
      submenu: [
        { title: "Support Tickets", path: "/dashboard/support/tickets" },
        { title: "FAQs", path: "/dashboard/support/faqs" },
        { title: "Contact Messages", path: "/dashboard/support/messages" },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

  const isActivePath = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const toggleMenu = (path: string) => {
    setOpenMenus((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const isMenuOpen = (path: string) => {
    return openMenus.includes(path) || isActivePath(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-base-100 border-r border-base-300 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:fixed w-72 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-content" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-base-content">Earn9ja</h1>
              <p className="text-sm text-base-content/60">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden btn btn-ghost btn-sm btn-square"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.path)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? "bg-primary/10 text-primary"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3 shrink-0" />
                      <span className="flex-1 font-medium text-left">
                        {item.title}
                      </span>
                      {isMenuOpen(item.path) ? (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                    {isMenuOpen(item.path) && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                location.pathname === subItem.path
                                  ? "bg-primary/20 text-primary font-medium"
                                  : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActivePath(item.path)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-base-content hover:bg-base-200"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 border-t border-base-300 shrink-0">
          <div className="flex items-center space-x-3 mb-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-8">
                <span className="text-xs">
                  {user?.profile?.firstName?.[0]}
                  {user?.profile?.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-base-content truncate">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
