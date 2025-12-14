import React, { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import notificationService, {
  type Notification,
} from "../../services/notificationService";

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(1, 10);
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-30 shadow-sm">
      <div className="flex-none lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn btn-ghost btn-square"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-2">
        <form
          onSubmit={handleSearch}
          className="w-full max-w-xs sm:max-w-sm md:max-w-md"
        >
          <div className="join w-full">
            <input
              type="text"
              placeholder="Search..."
              className="input input-bordered input-sm sm:input-md join-item w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-square btn-sm sm:btn-md join-item"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex-none gap-2">
        {/* Theme Toggle */}
        <label className="swap swap-rotate btn btn-ghost btn-circle">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <Sun className="swap-on w-5 h-5" />
          <Moon className="swap-off w-5 h-5" />
        </label>

        {/* Notifications Dropdown */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle"
            onClick={() => {
              if (notifications.length === 0) fetchNotifications();
            }}
          >
            <div className="indicator">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="badge badge-sm badge-error indicator-item">
                  {unreadCount}
                </span>
              )}
            </div>
          </label>
          <div
            tabIndex={0}
            className="dropdown-content card card-compact w-80 p-0 shadow-lg bg-base-100 border border-base-300 mt-3"
          >
            <div className="card-body p-0">
              <div className="flex items-center justify-between p-4 border-b border-base-300">
                <h3 className="font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="btn btn-ghost btn-xs"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-base-content/60">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification._id);
                        }
                        if (notification.actionUrl) {
                          navigate(notification.actionUrl);
                        } else {
                          navigate("/dashboard/notifications");
                        }
                        (document.activeElement as HTMLElement)?.blur();
                      }}
                      className={`p-4 border-b border-base-200 hover:bg-base-200 cursor-pointer ${
                        !notification.read ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">
                            {notification.title}
                          </h4>
                          <p className="text-sm opacity-70 mt-1">
                            {notification.body}
                          </p>
                          <p className="text-xs opacity-50 mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-base-300">
                <button
                  onClick={() => {
                    navigate("/dashboard/notifications");
                    (document.activeElement as HTMLElement)?.blur();
                  }}
                  className="btn btn-ghost btn-sm btn-block"
                >
                  View all notifications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost gap-2">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-8">
                <span className="text-xs">
                  {user?.profile?.firstName?.[0]}
                  {user?.profile?.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs opacity-60 capitalize">
                {user?.roles?.join(", ") || "User"}
              </p>
            </div>
          </label>
          <div
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-56 mt-3"
          >
            <div className="px-4 py-3 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-12">
                    <span className="text-lg">
                      {user?.profile?.firstName?.[0]}
                      {user?.profile?.lastName?.[0]}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-xs opacity-60">{user?.email}</p>
                </div>
              </div>
            </div>
            <li
              onClick={() => {
                (document.activeElement as HTMLElement)?.blur();
                navigate("/dashboard/profile");
              }}
            >
              <a>
                <User className="w-4 h-4" />
                View Profile
              </a>
            </li>
            <li
              onClick={() => {
                (document.activeElement as HTMLElement)?.blur();
                navigate("/dashboard/settings");
              }}
            >
              <a>
                <Settings className="w-4 h-4" />
                Account Settings
              </a>
            </li>
            <div className="divider my-0"></div>
            <li
              onClick={() => {
                (document.activeElement as HTMLElement)?.blur();
                handleLogout();
              }}
            >
              <a className="text-error">
                <LogOut className="w-4 h-4" />
                Sign Out
              </a>
            </li>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
