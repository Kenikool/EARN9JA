import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export default function MobileBottomNav() {
  const location = useLocation();
  const { items } = useCart();
  
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shop', icon: Search, label: 'Shop' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { path: '/profile', icon: User, label: 'Account' },
  ];

  // Hide on desktop and certain pages
  if (window.innerWidth >= 768) return null;
  if (location.pathname.startsWith('/admin')) return null;
  if (location.pathname.startsWith('/vendor')) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-40 safe-area-bottom">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? 'text-primary' : 'text-base-content/60'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error text-error-content text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
