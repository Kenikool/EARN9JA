import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { recipeAPI } from "../services/api";
import { RecipeGrid } from "../components/recipe/RecipeGrid";
import { SearchBar } from "../components/common/SearchBar";
import { FilterPanel } from "../components/common/FilterPanel";
import { LoadingPage } from "../components/common/LoadingSpinner";
import type { Recipe, RecipeFilters } from "../types/recipe";

export const HomePage: React.FC = () => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<RecipeFilters>({
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  });

  const [searchQuery, setSearchQuery] = React.useState("");

  const {
    data: recipesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recipes", { ...filters, search: searchQuery }],
    queryFn: () =>
      recipeAPI.getRecipes({
        ...filters,
        search: searchQuery || undefined,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: RecipeFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    });
    setSearchQuery("");
  };

  const recipes: Recipe[] = recipesData?.data?.data || [];

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
          "We couldn't load the recipes. Please try again."
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
    // Hero Section
    React.createElement(
      "div",
      { className: "bg-gradient-to-r from-red-600 to-red-800 text-white" },
      React.createElement(
        "div",
        { className: "container mx-auto px-4 py-16" },
        React.createElement(
          "div",
          { className: "text-center" },
          React.createElement(
            "h1",
            { className: "text-4xl md:text-6xl font-bold mb-4" },
            "Discover Amazing Recipes"
          ),
          React.createElement(
            "p",
            { className: "text-xl md:text-2xl mb-8 opacity-90" },
            "Share, explore, and create delicious meals with our community"
          ),
          React.createElement(
            "div",
            { className: "max-w-2xl mx-auto" },
            React.createElement(SearchBar, {
              onSearch: handleSearch,
              placeholder: "Search for recipes, ingredients, or cuisines...",
              className: "w-full",
            })
          )
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
                { className: "text-2xl font-bold text-gray-900" },
                searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : "All Recipes"
              ),
              React.createElement(
                "p",
                { className: "text-gray-600" },
                `${recipes.length} recipe${
                  recipes.length !== 1 ? "s" : ""
                } found`
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

          // Pagination would go here
          recipes.length > 0 &&
            React.createElement(
              "div",
              { className: "mt-12 flex justify-center" },
              React.createElement(
                "div",
                { className: "flex items-center space-x-2" },
                React.createElement(
                  "button",
                  {
                    className:
                      "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50",
                    disabled: true,
                  },
                  "Previous"
                ),
                React.createElement(
                  "span",
                  { className: "px-4 py-2 bg-red-600 text-white rounded-lg" },
                  "1"
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
                    className:
                      "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50",
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
