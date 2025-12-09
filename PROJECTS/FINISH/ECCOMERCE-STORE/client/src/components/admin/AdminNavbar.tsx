import { useState, useRef, useEffect } from "react";
import { Bell, Search, LogOut, Menu, Store, UserCircle, X, Package, ShoppingBag, Users as UsersIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

interface AdminNavbarProps {
  onMenuClick: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data } = await api.get('/admin/notifications?limit=10');
      return data.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['admin-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return null;
      const { data } = await api.get(`/admin/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      return data.data;
    },
    enabled: searchQuery.length >= 2,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/admin/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/admin/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: { _id: string; isRead: boolean; link?: string }) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setShowNotifications(false);
  };

  const handleSearchResultClick = (type: string) => {
    setShowSearch(false);
    setSearchQuery("");
    if (type === 'products') navigate(`/admin/products`);
    else if (type === 'orders') navigate(`/admin/orders`);
    else if (type === 'users') navigate(`/admin/users`);
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-40 shadow-sm h-16 px-4">
      <div className="flex-1 gap-2">
        {/* Mobile Menu Button */}
        <button
          className="btn btn-ghost btn-square lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" style={{ color: '#6b7280' }} />
        </button>

        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5" style={{ color: '#ffffff' }} />
          </div>
          <span className="text-xl font-bold hidden sm:inline">Admin Panel</span>
        </div>
      </div>

      <div className="flex-none">
        <div className="flex items-center gap-2">
          {/* Search - Desktop */}
          <div className="form-control hidden lg:block relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, orders, users..."
                className="input input-bordered input-sm w-64 pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" style={{ color: '#6b7280' }} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearch && searchQuery.length >= 2 && (
              <div className="absolute top-full mt-2 w-96 bg-base-100 rounded-lg shadow-xl border border-base-300 max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <span className="loading loading-spinner"></span>
                  </div>
                ) : searchResults && searchResults.totalResults > 0 ? (
                  <div className="p-2">
                    {/* Products */}
                    {searchResults.results.products && searchResults.results.products.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-base-content/60 px-2 py-1">Products</p>
                        {searchResults.results.products.map((product: { _id: string; name: string; price: number }) => (
                          <button
                            key={product._id}
                            onClick={() => handleSearchResultClick('products')}
                            className="w-full p-2 hover:bg-base-200 rounded flex items-center gap-2 text-left"
                          >
                            <Package className="w-4 h-4 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-base-content/60">${product.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Orders */}
                    {searchResults.results.orders && searchResults.results.orders.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-base-content/60 px-2 py-1">Orders</p>
                        {searchResults.results.orders.map((order: { _id: string; orderNumber: string; totalPrice: number }) => (
                          <button
                            key={order._id}
                            onClick={() => handleSearchResultClick('orders')}
                            className="w-full p-2 hover:bg-base-200 rounded flex items-center gap-2 text-left"
                          >
                            <ShoppingBag className="w-4 h-4 text-warning" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">#{order.orderNumber}</p>
                              <p className="text-xs text-base-content/60">${order.totalPrice}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Users */}
                    {searchResults.results.users && searchResults.results.users.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-base-content/60 px-2 py-1">Users</p>
                        {searchResults.results.users.map((user: { _id: string; name: string; email: string }) => (
                          <button
                            key={user._id}
                            onClick={() => handleSearchResultClick('users')}
                            className="w-full p-2 hover:bg-base-200 rounded flex items-center gap-2 text-left"
                          >
                            <UsersIcon className="w-4 h-4 text-success" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-base-content/60">{user.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-base-content/60">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search - Mobile */}
          <button className="btn btn-ghost btn-circle btn-sm lg:hidden">
            <Search className="w-5 h-5" style={{ color: '#6b7280' }} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="btn btn-ghost btn-circle btn-sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <div className="indicator">
                <Bell className="w-5 h-5" style={{ color: '#f59e0b' }} />
                {notificationsData && notificationsData.unreadCount > 0 && (
                  <span className="badge badge-xs badge-primary indicator-item">
                    {notificationsData.unreadCount}
                  </span>
                )}
              </div>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-xl border border-base-300 max-h-96 overflow-y-auto z-50">
                <div className="p-3 border-b border-base-300 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {notificationsData && notificationsData.unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsReadMutation.mutate()}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div>
                  {notificationsData && notificationsData.notifications.length > 0 ? (
                    notificationsData.notifications.map((notification: { _id: string; title: string; message: string; createdAt: string; isRead: boolean; link?: string }) => (
                      <button
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-3 border-b border-base-300 hover:bg-base-200 text-left ${
                          !notification.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-base-content/60 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-base-content/40 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-base-content/60">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost gap-2 normal-case">
              <div className="avatar placeholder">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content">
                  <span className="text-sm">{user?.name?.charAt(0) || "A"}</span>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{user?.name || "Admin"}</span>
                <span className="text-xs text-base-content/60">{user?.role || "Administrator"}</span>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 z-50 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-56 border border-base-300"
            >
              <li className="menu-title px-4 py-2">
                <div className="flex flex-col">
                  <span className="font-semibold">{user?.name}</span>
                  <span className="text-xs text-base-content/60">{user?.email}</span>
                </div>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a onClick={() => navigate("/admin/settings")} className="gap-2">
                  <UserCircle className="w-4 h-4" style={{ color: '#7c3aed' }} />
                  Profile Settings
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/")} className="gap-2">
                  <Store className="w-4 h-4" style={{ color: '#22c55e' }} />
                  View Store
                </a>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a onClick={handleLogout} className="gap-2 text-error">
                  <LogOut className="w-4 h-4" style={{ color: '#ef4444' }} />
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
