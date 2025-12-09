import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Grid, List, Star } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import type { Product, Category } from "../types";

// Filters Sidebar Component
function FiltersSidebar({
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
}: {
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
}) {
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={onClearFilters}
          className="btn btn-ghost btn-sm text-primary"
        >
          Clear All
        </button>
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
              checked={selectedCategory === ""}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="radio radio-primary radio-sm"
            />
            <span className="text-sm">All Categories</span>
          </label>
          {categories.map((category) => (
            <label
              key={category._id}
              className="flex items-center gap-2 cursor-pointer"
            >
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
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) =>
                onPriceRangeChange([Number(e.target.value), priceRange[1]])
              }
              className="input input-bordered input-sm flex-1"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) =>
                onPriceRangeChange([priceRange[0], Number(e.target.value)])
              }
              className="input input-bordered input-sm flex-1"
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer"
            >
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
                  <Star
                    key={i}
                    className={`w-3 h-3 icon-warning-responsive ${
                      i < rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
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
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onBrandChange([...selectedBrands, brand]);
                    } else {
                      onBrandChange(selectedBrands.filter((b) => b !== brand));
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
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 10000,
  ]);
  const [selectedRating, setSelectedRating] = useState(
    Number(searchParams.get("rating")) || 0
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brands")?.split(",").filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "createdAt");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  // Sync state with URL parameters when they change
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setPriceRange([
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 10000,
    ]);
    setSelectedRating(Number(searchParams.get("rating")) || 0);
    setSelectedBrands(
      searchParams.get("brands")?.split(",").filter(Boolean) || []
    );
    setSortBy(searchParams.get("sort") || "createdAt");
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data.data.categories;
    },
  });

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "products",
      selectedCategory,
      priceRange,
      selectedRating,
      selectedBrands,
      sortBy,
      currentPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
      if (priceRange[1] < 10000)
        params.set("maxPrice", priceRange[1].toString());
      if (selectedRating > 0) params.set("rating", selectedRating.toString());
      if (selectedBrands.length > 0)
        params.set("brands", selectedBrands.join(","));
      if (sortBy !== "createdAt") params.set("sort", sortBy);
      if (currentPage > 1) params.set("page", currentPage.toString());

      const { data } = await api.get(`/products?${params}`);
      return { items: data.data.products, pagination: data.data.pagination };
    },
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString());
    if (selectedRating > 0) params.set("rating", selectedRating.toString());
    if (selectedBrands.length > 0)
      params.set("brands", selectedBrands.join(","));
    if (sortBy !== "createdAt") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [
    selectedCategory,
    priceRange,
    selectedRating,
    selectedBrands,
    sortBy,
    currentPage,
    setSearchParams,
  ]);

  // Get available brands from current products
  const availableBrands = Array.from(
    new Set(
      productsData?.items
        ?.map((p: Product) => p.brand)
        .filter((brand: string): brand is string => Boolean(brand)) || []
    )
  ) as string[];

  const handleClearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 10000]);
    setSelectedRating(0);
    setSelectedBrands([]);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4 lg:sticky lg:top-4 lg:self-start lg:max-h-screen lg:overflow-y-auto">
          <FiltersSidebar
            categories={categories || []}
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              setCurrentPage(1);
            }}
            priceRange={priceRange}
            onPriceRangeChange={(range) => {
              setPriceRange(range);
              setCurrentPage(1);
            }}
            selectedRating={selectedRating}
            onRatingChange={(rating) => {
              setSelectedRating(rating);
              setCurrentPage(1);
            }}
            selectedBrands={selectedBrands}
            onBrandChange={(brands) => {
              setSelectedBrands(brands);
              setCurrentPage(1);
            }}
            availableBrands={availableBrands}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-base-content/60">
                {productsData?.pagination?.total || 0} products found
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="createdAt">Newest</option>
                <option value="-createdAt">Oldest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Highest Rated</option>
                <option value="-sold">Best Sellers</option>
              </select>

              {/* View Toggle */}
              <div className="flex border rounded-lg">
                <button
                  onClick={() => setView("grid")}
                  className={`btn btn-ghost btn-sm ${
                    view === "grid" ? "btn-active" : ""
                  }`}
                >
                  <Grid className="w-4 h-4 icon-navbar" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`btn btn-ghost btn-sm ${
                    view === "list" ? "btn-active" : ""
                  }`}
                >
                  <List className="w-4 h-4 icon-navbar" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {isLoading ? (
            <div
              className={`grid gap-6 ${
                view === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card bg-base-100 shadow-xl">
                  <div className="skeleton h-48 w-full"></div>
                  <div className="card-body">
                    <div className="skeleton h-4 w-3/4 mb-2"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : productsData?.items?.length > 0 ? (
            <div
              className={`grid gap-6 ${
                view === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {productsData.items.map((product: Product) => (
                <ProductCard key={product._id} product={product} view={view} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-base-content/60 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <button onClick={handleClearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {productsData?.pagination?.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                <button
                  className="join-item btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  «
                </button>
                {[...Array(productsData.pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === productsData.pagination.pages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`join-item btn ${
                          page === currentPage ? "btn-active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="join-item btn btn-disabled">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  className="join-item btn"
                  disabled={currentPage === productsData.pagination.pages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
