import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, Settings, Package, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useSidebarStore } from '../stores/sidebarStore';
import { getInitials } from '../utils/formatters';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { toggleSidebar } = useSidebarStore();

  return (
    <nav className="bg-base-100 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger Menu for Mobile */}
          <button
            onClick={toggleSidebar}
            className="btn btn-ghost btn-circle lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6" style={{ color: '#6b7280' }} />
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            E-Store
          </Link>



          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="input input-bordered w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6b7280' }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Cart */}
            <Link
              to="/cart"
              className="btn btn-ghost btn-circle"
            >
              <div className="indicator">
                <ShoppingCart className="w-6 h-6" style={{ color: '#10b981' }} />
                {cart && cart.totalItems > 0 && (
                  <span className="badge badge-sm badge-primary indicator-item">
                    {cart.totalItems}
                  </span>
                )}
              </div>
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span className="text-sm font-semibold">
                        {getInitials(user.name)}
                      </span>
                    )}
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li className="menu-title">
                    <span>{user.name}</span>
                    <span className="text-xs opacity-60">{user.email}</span>
                  </li>
                  <li>
                    <Link to="/profile" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                      <User className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/account-settings" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                      <Settings className="w-4 h-4" style={{ color: '#f59e0b' }} />
                      Account Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                      <Package className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/referrals" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                      <User className="w-4 h-4" style={{ color: '#10b981' }} />
                      Referrals
                    </Link>
                  </li>
                  <li>
                    <Link to="/loyalty-points" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                      <Package className="w-4 h-4" style={{ color: '#f59e0b' }} />
                      Loyalty Points
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <Link to="/admin" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                        <Settings className="w-4 h-4" style={{ color: '#7c3aed' }} />
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <div className="divider my-0"></div>
                  <li>
                    <button onClick={() => { logout(); (document.activeElement as HTMLElement)?.blur(); }}>
                      <LogOut className="w-4 h-4" style={{ color: '#ef4444' }} />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-ghost btn-circle">
                <User className="w-6 h-6" style={{ color: '#8b5cf6' }} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
