import React from "react";
import type { RecipeFilters } from "../../types/recipe";

interface FilterPanelProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleFilterChange = (key: keyof RecipeFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleTimeRangeChange = (
    field: "prepTime" | "cookTime",
    type: "min" | "max",
    value: number
  ) => {
    const currentRange = filters[field] || {};
    const newRange = {
      ...currentRange,
      [type]: value || undefined,
    };

    handleFilterChange(
      field,
      Object.keys(newRange).length > 0 ? newRange : undefined
    );
  };

  const cuisines = [
    "Italian",
    "Mexican",
    "Asian",
    "American",
    "French",
    "Indian",
    "Mediterranean",
    "Thai",
    "Japanese",
    "Chinese",
    "Korean",
    "Greek",
  ];

  const dietaryTags = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "keto",
    "paleo",
    "low-carb",
    "high-protein",
  ];

  const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Newest First" },
    { value: "averageRating", label: "Highest Rated" },
    { value: "views", label: "Most Popular" },
    { value: "prepTime", label: "Shortest Prep Time" },
    { value: "cookTime", label: "Shortest Cook Time" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || "createdAt"}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <label key={difficulty.value} className="flex items-center">
                <input
                  type="radio"
                  name="difficulty"
                  value={difficulty.value}
                  checked={filters.difficulty === difficulty.value}
                  onChange={(e) =>
                    handleFilterChange("difficulty", e.target.value)
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  {difficulty.label}
                </span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value=""
                checked={!filters.difficulty}
                onChange={() => handleFilterChange("difficulty", undefined)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">All</span>
            </label>
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine
          </label>
          <select
            value={filters.cuisine || ""}
            onChange={(e) =>
              handleFilterChange("cuisine", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Cuisines</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Dietary Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Tags
          </label>
          <div className="space-y-2">
            {dietaryTags.map((tag) => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.dietary === tag}
                  onChange={(e) =>
                    handleFilterChange(
                      "dietary",
                      e.target.checked ? tag : undefined
                    )
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Prep Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prep Time (minutes)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.prepTime?.min || ""}
              onChange={(e) =>
                handleTimeRangeChange(
                  "prepTime",
                  "min",
                  parseInt(e.target.value) || 0
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.prepTime?.max || ""}
              onChange={(e) =>
                handleTimeRangeChange(
                  "prepTime",
                  "max",
                  parseInt(e.target.value) || 0
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Cook Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cook Time (minutes)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.cookTime?.min || ""}
              onChange={(e) =>
                handleTimeRangeChange(
                  "cookTime",
                  "min",
                  parseInt(e.target.value) || 0
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.cookTime?.max || ""}
              onChange={(e) =>
                handleTimeRangeChange(
                  "cookTime",
                  "max",
                  parseInt(e.target.value) || 0
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
