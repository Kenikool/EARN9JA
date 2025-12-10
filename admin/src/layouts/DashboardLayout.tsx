import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";

export default function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: "📊",
      description: "Overview & Analytics",
    },
    {
      path: "/users",
      label: "Users",
      icon: "👥",
      description: "User Management",
    },
    {
      path: "/tasks",
      label: "Tasks",
      icon: "📋",
      description: "Task Management",
    },
    {
      path: "/withdrawals",
      label: "Withdrawals",
      icon: "💰",
      description: "Payment Requests",
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: "📈",
      description: "Reports & Insights",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: "⚙️",
      description: "Configuration",
    },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Enhanced Navbar */}
        <div className="navbar navbar-glass shadow-lg border-b border-base-300">
          <div className="flex-none lg:hidden">
            <label htmlFor="drawer" className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="/icon.png" alt="Earn9ja" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold gradient-text">
                  Earn9ja Admin
                </span>
                <div className="text-xs text-base-content/60">
                  Administrator Dashboard
                </div>
              </div>
            </div>
          </div>

          <div className="flex-none items-center gap-2">
            {/* Notifications */}
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-circle">
                <div className="indicator">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5-5-5h5V5a3 3 0 00-3-3H9a3 3 0 00-3 3v12z"
                    />
                  </svg>
                  <span className="badge badge-xs badge-primary indicator-item">
                    3
                  </span>
                </div>
              </button>
              <div
                tabIndex={0}
                className="card card-compact dropdown-content z-[1] w-80 bg-base-100 shadow-xl"
              >
                <div className="card-body">
                  <h3 className="font-bold text-lg">Notifications</h3>
                  <div className="space-y-2">
                    <div className="alert alert-info">
                      <span className="text-sm">
                        New user registration pending approval
                      </span>
                    </div>
                    <div className="alert alert-warning">
                      <span className="text-sm">
                        5 withdrawal requests need review
                      </span>
                    </div>
                    <div className="alert alert-success">
                      <span className="text-sm">
                        Monthly report generated successfully
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar placeholder hover-lift"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-xl font-bold">
                    {user?.firstName?.[0]}
                  </span>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-box w-64 border border-base-300"
              >
                <li className="menu-title">
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-lg">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {user?.email}
                    </span>
                    <span className="badge badge-primary badge-sm mt-1">
                      {user?.roles?.[0]}
                    </span>
                  </div>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <Link to="/settings" className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-error"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 bg-base-200">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <div className="drawer-side">
        <label
          htmlFor="drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <div className="w-80 min-h-full bg-base-100 border-r border-base-300 shadow-xl">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                  <img src="/icon.png" alt="Earn9ja" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold gradient-text">Earn9ja</h2>
                <p className="text-xs text-base-content/60">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <ul className="menu p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="sidebar-item">
                  <Link
                    to={item.path}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "active bg-primary text-primary-content shadow-lg"
                        : "hover:bg-base-200"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.label}</div>
                      <div
                        className={`text-xs ${
                          isActive
                            ? "text-primary-content/70"
                            : "text-base-content/60"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-base-300 bg-base-100">
            <div className="text-center">
              <div className="text-xs text-base-content/60 mb-2">
                System Status
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-success rounded-full animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-success rounded-full animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                ></div>
              </div>
              <div className="text-xs text-success font-medium mt-1">
                All Systems Operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
