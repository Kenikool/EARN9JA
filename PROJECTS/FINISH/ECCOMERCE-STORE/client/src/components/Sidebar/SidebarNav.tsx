import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Store, Grid, Package, User, Heart, Zap, Tag, Repeat, Wallet, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore } from '../../stores/cartStore';
import { useWishlist } from '../../hooks/useWishlist';
import { useSidebarStore } from '../../stores/sidebarStore';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
  requiresAuth?: boolean;
}

interface SidebarNavProps {
  isCollapsed: boolean;
}

export default function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getItemCount } = useCartStore();
  const { wishlist } = useWishlist();
  const { setIsOpen } = useSidebarStore();

  const cartCount = getItemCount();
  const wishlistCount = wishlist?.items?.length || 0;

  // Navigation items configuration
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: Store,
      path: '/shop',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid,
      path: '/shop',
    },
    {
      id: 'flash-sales',
      label: 'Flash Sales',
      icon: Zap,
      path: '/flash-sales',
    },
    {
      id: 'deals',
      label: 'Deals & Coupons',
      icon: Tag,
      path: '/deals',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      path: '/orders',
      requiresAuth: true,
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      path: '/profile',
      requiresAuth: true,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      path: '/wishlist',
      requiresAuth: true,
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: Repeat,
      path: '/subscriptions',
      requiresAuth: true,
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
      path: '/wallet',
      requiresAuth: true,
    },
    {
      id: 'settings',
      label: 'Global Settings',
      icon: Settings,
      path: '/global-settings',
      requiresAuth: true,
    },
  ];

  const handleNavigation = (item: NavItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(item.path);
    }
    // Close mobile drawer after navigation
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Filter items based on authentication
  const visibleItems = navItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  if (isCollapsed) {
    return (
      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Main navigation">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const showBadge = 
              (item.id === 'orders' && cartCount > 0) ||
              (item.id === 'wishlist' && wishlistCount > 0);
            const badgeCount = item.id === 'orders' ? cartCount : wishlistCount;

            return (
              <li key={item.id}>
                <div className="tooltip tooltip-right" data-tip={item.label}>
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`
                      btn btn-ghost btn-sm w-full h-12 btn-circle
                      ${active ? 'bg-primary text-primary-content hover:bg-primary' : ''}
                    `}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                  >
                    <div className="indicator">
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color: item.id === 'home' ? '#3b82f6' :
                                item.id === 'shop' ? '#22c55e' :
                                item.id === 'categories' ? '#f59e0b' :
                                item.id === 'flash-sales' ? '#eab308' :
                                item.id === 'deals' ? '#10b981' :
                                item.id === 'orders' ? '#8b5cf6' :
                                item.id === 'account' ? '#ec4899' :
                                item.id === 'wishlist' ? '#ef4444' :
                          item.id === 'subscriptions' ? '#06b6d4' :
                          item.id === 'wallet' ? '#f59e0b' :
                          item.id === 'settings' ? '#6366f1' : '#6b7280'
                        }}
                      />
                      {showBadge && (
                        <span className="indicator-item badge badge-secondary badge-sm">
                          {badgeCount}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
      <ul className="menu menu-sm gap-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const showBadge = 
            (item.id === 'orders' && cartCount > 0) ||
            (item.id === 'wishlist' && wishlistCount > 0);
          const badgeCount = item.id === 'orders' ? cartCount : wishlistCount;

          return (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    active
                      ? 'bg-primary text-primary-content font-semibold'
                      : 'hover:bg-base-300'
                  }
                `}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className="w-5 h-5 shrink-0"
                  style={{
                    color: item.id === 'home' ? '#3b82f6' :
                          item.id === 'shop' ? '#22c55e' :
                          item.id === 'categories' ? '#f59e0b' :
                          item.id === 'flash-sales' ? '#eab308' :
                          item.id === 'deals' ? '#10b981' :
                          item.id === 'orders' ? '#8b5cf6' :
                          item.id === 'account' ? '#ec4899' :
                          item.id === 'wishlist' ? '#ef4444' :
                          item.id === 'subscriptions' ? '#06b6d4' :
                          item.id === 'wallet' ? '#f59e0b' :
                          item.id === 'settings' ? '#6366f1' : '#6b7280'
                  }}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {showBadge && (
                  <span className="badge badge-secondary badge-sm">{badgeCount}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
