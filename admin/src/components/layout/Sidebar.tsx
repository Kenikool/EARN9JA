import React from "react";
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
  UserCheck,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAuthStore();

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
        className={`fixed left-0 top-0 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0 w-72`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Earn9ja</h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                {item.submenu ? (
                  <div>
                    <div
                      className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
                        isActivePath(item.path)
                          ? "bg-blue-50 text-blue-700"
                          : ""
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="flex-1 font-medium">{item.title}</span>
                    </div>
                    <ul className="ml-8 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                              location.pathname === subItem.path
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActivePath(item.path)
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-500 truncate">
                admin@earn9ja.com
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
