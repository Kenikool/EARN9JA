import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useSidebarStore } from '../../stores/sidebarStore';
import SidebarNav from './SidebarNav';
import SidebarCategories from './SidebarCategories';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const { isOpen, isCollapsed, setIsOpen } = useSidebarStore();

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fadeIn"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-base-200 border-r border-base-300 z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:sticky
          ${isCollapsed ? 'lg:w-20' : 'lg:w-80'}
          w-80
          flex flex-col
          shadow-xl lg:shadow-none
          hidden lg:flex
          ${isOpen ? '!flex' : ''}
          ${className}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" style={{ color: '#6b7280' }} />
        </button>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full overflow-hidden pt-4">
          {/* Navigation Menu */}
          <SidebarNav isCollapsed={isCollapsed} />

          {/* Divider */}
          <div className="divider my-0" />

          {/* Categories Section */}
          <SidebarCategories isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
}
