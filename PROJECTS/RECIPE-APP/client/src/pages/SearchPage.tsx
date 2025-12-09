import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { recipeAPI } from "../services/api";
import { RecipeGrid } from "../components/recipe/RecipeGrid";
import { SearchBar } from "../components/common/SearchBar";
import { FilterPanel } from "../components/common/FilterPanel";
import { LoadingPage } from "../components/common/LoadingSpinner";
import type { Recipe, RecipeFilters } from "../types/recipe";

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = React.useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = React.useState<RecipeFilters>(() => {
    const urlParams = Object.fromEntries(searchParams.entries());
    return {
      search: urlParams.search || "",
      cuisine: urlParams.cuisine || undefined,
      difficulty:
        (urlParams.difficulty as "easy" | "medium" | "hard") || undefined,
      dietary: urlParams.dietary || undefined,
      sortBy: [
        "createdAt",
        "averageRating",
        "views",
        "prepTime",
        "cookTime",
      ].includes(urlParams.sortBy)
        ? (urlParams.sortBy as
            | "createdAt"
            | "averageRating"
            | "views"
            | "prepTime"
            | "cookTime")
        : "createdAt",
      sortOrder: (urlParams.sortOrder as "asc" | "desc") || "desc",
      prepTime:
        urlParams.prepTimeMin || urlParams.prepTimeMax
          ? {
              min: urlParams.prepTimeMin
                ? parseInt(urlParams.prepTimeMin)
                : undefined,
              max: urlParams.prepTimeMax
                ? parseInt(urlParams.prepTimeMax)
                : undefined,
            }
          : undefined,
      cookTime:
        urlParams.cookTimeMin || urlParams.cookTimeMax
          ? {
              min: urlParams.cookTimeMin
                ? parseInt(urlParams.cookTimeMin)
                : undefined,
              max: urlParams.cookTimeMax
                ? parseInt(urlParams.cookTimeMax)
                : undefined,
            }
          : undefined,
    };
  });

  const [searchQuery, setSearchQuery] = React.useState(filters.search || "");

  const {
    data: recipesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recipes", filters],
    queryFn: () =>
      recipeAPI.getRecipes({
        ...filters,
        search: filters.search || undefined,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.cuisine) params.set("cuisine", filters.cuisine);
    if (filters.difficulty) params.set("difficulty", filters.difficulty);
    if (filters.dietary) params.set("dietary", filters.dietary);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.prepTime?.min)
      params.set("prepTimeMin", filters.prepTime.min.toString());
    if (filters.prepTime?.max)
      params.set("prepTimeMax", filters.prepTime.max.toString());
    if (filters.cookTime?.min)
      params.set("cookTimeMin", filters.cookTime.min.toString());
    if (filters.cookTime?.max)
      params.set("cookTimeMax", filters.cookTime.max.toString());

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters((prev: RecipeFilters) => ({
      ...prev,
      search: query || undefined,
    }));
  };

  const handleFiltersChange = (newFilters: RecipeFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: RecipeFilters = {
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    setSearchQuery("");
  };

  const recipes: Recipe[] = recipesData?.data?.data || [];
  const pagination = recipesData?.data?.pagination;

  if (isLoading) {
    return React.createElement(LoadingPage);
  }

  if (error) {
    return React.createElement(
      "div",
      { className: "min-h-screen flex items-center justify-center" },
      React.createElement(
        "div",
        { className: "text-center" },
        React.createElement("div", { className: "text-6xl mb-4" }, "😞"),
        React.createElement(
          "h2",
          { className: "text-xl font-semibold text-gray-900 mb-2" },
          "Oops! Something went wrong"
        ),
        React.createElement(
          "p",
          { className: "text-gray-600 mb-4" },
          "We couldn't search for recipes. Please try again."
        ),
        React.createElement(
          "button",
          {
            onClick: () => refetch(),
            className:
              "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
          },
          "Try Again"
        )
      )
    );
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-gray-50" },
    // Header
    React.createElement(
      "div",
      { className: "bg-white border-b" },
      React.createElement(
        "div",
        { className: "container mx-auto px-4 py-6" },
        React.createElement(
          "h1",
          { className: "text-2xl font-bold text-gray-900 mb-4" },
          "Search Recipes"
        ),

        // Search Bar
        React.createElement(
          "div",
          { className: "max-w-2xl" },
          React.createElement(SearchBar, {
            onSearch: handleSearch,
            placeholder: "Search for recipes, ingredients, or cuisines...",
            initialValue: searchQuery,
            className: "w-full",
          })
        )
      )
    ),

    // Main Content
    React.createElement(
      "div",
      { className: "container mx-auto px-4 py-8" },
      React.createElement(
        "div",
        { className: "flex flex-col lg:flex-row gap-8" },
        // Sidebar with Filters (Desktop)
        React.createElement(
          "div",
          { className: "hidden lg:block w-80 flex-shrink-0" },
          React.createElement(
            "div",
            { className: "sticky top-4" },
            React.createElement(FilterPanel, {
              filters,
              onFiltersChange: handleFiltersChange,
              onClearFilters: handleClearFilters,
            })
          )
        ),

        // Main Content Area
        React.createElement(
          "div",
          { className: "flex-1" },
          // Mobile Filter Toggle
          React.createElement(
            "div",
            { className: "lg:hidden mb-6" },
            React.createElement(
              "button",
              {
                onClick: () => setShowFilters(!showFilters),
                className:
                  "flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
              },
              React.createElement(Filter, { size: 16, className: "mr-2" }),
              "Filters"
            ),

            // Mobile Filter Panel
            showFilters &&
              React.createElement(
                "div",
                { className: "mt-4" },
                React.createElement(FilterPanel, {
                  filters,
                  onFiltersChange: handleFiltersChange,
                  onClearFilters: handleClearFilters,
                })
              )
          ),

          // Search Results Info
          React.createElement(
            "div",
            { className: "flex justify-between items-center mb-6" },
            React.createElement(
              "div",
              null,
              React.createElement(
                "h2",
                { className: "text-xl font-semibold text-gray-900" },
                filters.search
                  ? `Search Results for "${filters.search}"`
                  : "All Recipes"
              ),
              React.createElement(
                "p",
                { className: "text-gray-600" },
                `${recipes.length} recipe${
                  recipes.length !== 1 ? "s" : ""
                } found`
              )
            ),

            // Sort Options (Mobile)
            React.createElement(
              "div",
              { className: "lg:hidden" },
              React.createElement(
                "select",
                {
                  value: filters.sortBy || "createdAt",
                  onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleFiltersChange({
                      ...filters,
                      sortBy: e.target.value as
                        | "createdAt"
                        | "averageRating"
                        | "views"
                        | "prepTime"
                        | "cookTime",
                    }),
                  className:
                    "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent",
                },
                React.createElement(
                  "option",
                  { value: "createdAt" },
                  "Newest First"
                ),
                React.createElement(
                  "option",
                  { value: "averageRating" },
                  "Highest Rated"
                ),
                React.createElement(
                  "option",
                  { value: "views" },
                  "Most Popular"
                ),
                React.createElement(
                  "option",
                  { value: "prepTime" },
                  "Shortest Prep Time"
                ),
                React.createElement(
                  "option",
                  { value: "cookTime" },
                  "Shortest Cook Time"
                )
              )
            )
          ),

          // Recipe Grid
          React.createElement(RecipeGrid, {
            recipes,
            isLoading,
            onFavoriteToggle: () => refetch(),
            columns: 3,
          }),

          // Pagination
          pagination &&
            pagination.totalPages > 1 &&
            React.createElement(
              "div",
              { className: "mt-12 flex justify-center" },
              React.createElement(
                "div",
                { className: "flex items-center space-x-2" },
                React.createElement(
                  "button",
                  {
                    className: `px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                      !pagination.hasPrev ? "opacity-50 cursor-not-allowed" : ""
                    }`,
                    disabled: !pagination.hasPrev,
                    onClick: () => {
                      // Handle pagination - would need page parameter in API
                      console.log("Previous page");
                    },
                  },
                  "Previous"
                ),

                // Page numbers (simplified - would need proper pagination logic)
                React.createElement(
                  "span",
                  { className: "px-4 py-2 bg-red-600 text-white rounded-lg" },
                  pagination.currentPage.toString()
                ),

                React.createElement(
                  "button",
                  {
                    className:
                      "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50",
                  },
                  "2"
                ),
                React.createElement(
                  "button",
                  {
                    className:
                      "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50",
                  },
                  "3"
                ),

                React.createElement(
                  "button",
                  {
                    className: `px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                      !pagination.hasNext ? "opacity-50 cursor-not-allowed" : ""
                    }`,
                    disabled: !pagination.hasNext,
                    onClick: () => {
                      // Handle pagination
                      console.log("Next page");
                    },
                  },
                  "Next"
                )
              )
            )
        )
      )
    )
  );
};
