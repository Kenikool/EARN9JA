import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Folder, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useSidebarStore } from '../../stores/sidebarStore';
import type { Category } from '../../types';

interface SidebarCategoriesProps {
  isCollapsed: boolean;
}

export default function SidebarCategories({ isCollapsed }: SidebarCategoriesProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setIsOpen } = useSidebarStore();
  const selectedCategory = searchParams.get('category') || '';

  // Fetch categories
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data.categories as Category[];
    },
  });

  const handleCategoryClick = (slug: string) => {
    navigate(`/shop?category=${slug}`);
    // Close mobile drawer after navigation
    setIsOpen(false);
  };

  if (isCollapsed) {
    return (
      <div className="px-2 py-4">
        <div className="tooltip tooltip-right" data-tip="Categories">
          <button
            onClick={() => navigate('/shop')}
            className="btn btn-ghost btn-sm w-full h-12 btn-circle"
            aria-label="Categories"
          >
            <Folder className="w-5 h-5" style={{ color: '#f59e0b' }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 flex-shrink-0">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-2 py-2 text-sm font-semibold hover:bg-base-300 rounded-lg transition-colors"
        aria-expanded={isExpanded}
        aria-label="Toggle categories"
      >
        <span className="flex items-center gap-2">
          <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
          Categories
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" style={{ color: '#6b7280' }} />
        ) : (
          <ChevronRight className="w-4 h-4" style={{ color: '#6b7280' }} />
        )}
      </button>

      {/* Categories List */}
      {isExpanded && (
        <div className="mt-2">
          {isLoading && (
            <div className="space-y-2 px-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-8 w-full rounded-lg" />
              ))}
            </div>
          )}

          {isError && (
            <div className="px-2 py-4">
              <div className="alert alert-error alert-sm">
                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                <div className="flex-1">
                  <p className="text-xs">Failed to load categories</p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                className="btn btn-ghost btn-xs w-full mt-2"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && categories && categories.length === 0 && (
            <div className="px-2 py-4 text-center">
              <p className="text-sm text-base-content/60">No categories available</p>
            </div>
          )}

          {!isLoading && !isError && categories && categories.length > 0 && (
            <div className="max-h-80 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(var(--bc) / 0.2) transparent' }}>
              <ul className="menu menu-sm gap-1">
                {categories.map((category) => {
                  const isActive = selectedCategory === category.slug;
                  
                  return (
                    <li key={category._id}>
                      <button
                        onClick={() => handleCategoryClick(category.slug)}
                        className={`
                          flex items-center justify-between px-3 py-2 rounded-lg
                          transition-all duration-200
                          ${
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-base-300'
                          }
                        `}
                        aria-label={`View ${category.name} products`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="flex-1 text-left truncate text-sm">
                          {category.name}
                        </span>
                        {/* Optional: Show product count if available */}
                        {/* <span className="badge badge-ghost badge-sm">12</span> */}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
