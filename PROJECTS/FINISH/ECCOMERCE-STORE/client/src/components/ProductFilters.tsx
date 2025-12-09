import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import type { Category } from '../types';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedRating: number;
  onRatingChange: (rating: number) => void;
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
  availableBrands: string[];
  onClearFilters: () => void;
  className?: string;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  selectedRating,
  onRatingChange,
  selectedBrands,
  onBrandChange,
  availableBrands,
  onClearFilters,
  className = ''
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000 ||
                          selectedRating > 0 || selectedBrands.length > 0;

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-outline w-full"
        >
          <Filter className="w-4 h-4 mr-2 icon-navbar" />
          Filters
          {hasActiveFilters && (
            <span className="badge badge-primary badge-sm ml-2">
              {(selectedCategory ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0) +
               (selectedRating > 0 ? 1 : 0) + selectedBrands.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`${className} ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="bg-base-100 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5 icon-primary-responsive" />
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="btn btn-ghost btn-sm text-primary"
              >
                <X className="w-4 h-4 mr-1 icon-modal" />
                Clear All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Categories</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="radio radio-primary radio-sm"
                />
                <span className="text-sm">All Categories</span>
              </label>
              {categories.map((category) => (
                <label key={category._id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category.slug}
                    checked={selectedCategory === category.slug}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Price Range</h4>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label label-text text-xs">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange[0] || ''}
                    onChange={(e) => onPriceRangeChange([Number(e.target.value) || 0, priceRange[1]])}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
                <div>
                  <label className="label label-text text-xs">Max Price</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={priceRange[1] < 10000 ? priceRange[1] : ''}
                    onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value) || 10000])}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={selectedRating === rating}
                    onChange={(e) => onRatingChange(Number(e.target.value))}
                    className="radio radio-primary radio-sm"
                  />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-sm">& up</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          {availableBrands.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Brands</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onBrandChange([...selectedBrands, brand]);
                        } else {
                          onBrandChange(selectedBrands.filter(b => b !== brand));
                        }
                      }}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Apply Filters Button (Mobile) */}
          <div className="lg:hidden mt-6">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-primary w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}