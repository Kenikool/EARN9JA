import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PenTool, LogOut, User, Home, BookOpen, Menu, Bookmark } from "lucide-react";
import { useContext, useRef } from "react";
import { SidebarContext } from "../context/SidebarContext";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarContext = useContext(SidebarContext);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  
  // Pages that should NOT show sidebar (same logic as MainLayout)
  const noSidebarPages = ["/login", "/register", "/create"];
  const isEditPage = location.pathname.startsWith("/edit/");
  const showSidebar = !noSidebarPages.includes(location.pathname) && !isEditPage;

  // Function to close dropdown
  const closeDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.removeAttribute("open");
    }
  };

  // Handle logout with dropdown close
  const handleLogout = () => {
    closeDropdown();
    logout();
  };

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start flex items-center gap-2">
        {/* Mobile Menu Button - Only show on pages with sidebar */}
        {sidebarContext && showSidebar && (
          <button
            onClick={sidebarContext.toggleSidebar}
            className="btn btn-ghost btn-square lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        <Link to="/" className="btn btn-ghost text-xl">
          <Home className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Blog Platform</span>
          <span className="sm:hidden">Blog</span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/posts">
              <BookOpen className="w-4 h-4" />
              Posts
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/create">
                <PenTool className="w-4 h-4" />
                Write
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {/* Theme Switcher */}
        <ThemeSwitcher />
        
        {user ? (
          <details ref={dropdownRef} className="dropdown dropdown-end">
            <summary className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="rounded-full" />
                ) : (
                  <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </summary>
            <ul className="mt-3 z-10 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-base-content/60">{user.email}</span>
              </li>
              <li>
                <Link to="/dashboard" onClick={closeDropdown}>
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/saved" onClick={closeDropdown}>
                  <Bookmark className="w-4 h-4" />
                  Saved Posts
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={closeDropdown}>
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </li>
              <li className="lg:hidden">
                <Link to="/create" onClick={closeDropdown}>
                  <PenTool className="w-4 h-4" />
                  Create Post
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </li>
            </ul>
          </details>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm sm:btn-md">
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm sm:btn-md">
              <span className="hidden sm:inline">Sign Up</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
