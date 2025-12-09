import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';
import { useSidebarStore } from '../../stores/sidebarStore';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export default function SidebarHeader({ isCollapsed }: SidebarHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { setIsOpen } = useSidebarStore();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile drawer after navigation
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!isAuthenticated || !user) {
    // Unauthenticated state
    return (
      <div className="p-4">
        {isCollapsed ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleNavigation('/login')}
              className="btn btn-primary btn-sm btn-circle"
              aria-label="Login"
              title="Login"
            >
              <LogIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigation('/register')}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Register"
              title="Register"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleNavigation('/login')}
              className="btn btn-primary btn-sm w-full"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              onClick={() => handleNavigation('/register')}
              className="btn btn-ghost btn-sm w-full"
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>
        )}
      </div>
    );
  }

  // Authenticated state
  if (isCollapsed) {
    return (
      <div className="p-4">
        <div className="dropdown dropdown-right w-full">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle w-12 h-12 avatar"
            aria-label="User menu"
          >
            <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="rounded-full" />
              ) : (
                <span className="text-sm font-semibold">{getInitials(user.name)}</span>
              )}
            </div>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52"
          >
            <li className="menu-title">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-xs opacity-60 truncate">{user.email}</span>
            </li>
            <div className="divider my-1" />
            <li>
              <button onClick={() => handleNavigation('/profile')}>
                <User className="w-4 h-4" />
                Profile
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/account-settings')}>
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </li>
            <div className="divider my-1" />
            <li>
              <button onClick={handleLogout} className="text-error">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Expanded state
  return (
    <div className="p-4">
      <div className="dropdown dropdown-bottom w-full">
        <label
          tabIndex={0}
          className="btn btn-ghost w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-base-300"
          aria-label="User menu"
        >
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="rounded-full" />
              ) : (
                <span className="text-sm font-semibold">{getInitials(user.name)}</span>
              )}
            </div>
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <div className="font-semibold text-sm truncate">{user.name}</div>
            <div className="text-xs opacity-60 truncate">{user.email}</div>
          </div>
          <ChevronDown className="w-4 h-4 opacity-60" />
        </label>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-full"
        >
          <li>
            <button onClick={() => handleNavigation('/profile')}>
              <User className="w-4 h-4" />
              Profile
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/account-settings')}>
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </li>
          <div className="divider my-1" />
          <li>
            <button onClick={handleLogout} className="text-error">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
