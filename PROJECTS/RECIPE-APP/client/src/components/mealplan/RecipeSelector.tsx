import React from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Search, Clock, Users, Star } from "lucide-react";
import { recipeAPI } from "../../services/api";
import type { Recipe } from "../../types/recipe";

interface RecipeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  mealType: string;
}

export const RecipeSelector: React.FC<RecipeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  mealType,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCuisine, setSelectedCuisine] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  const { data: recipesData, isLoading } = useQuery({
    queryKey: ["recipes", searchQuery, selectedCuisine],
    queryFn: () =>
      recipeAPI.getRecipes({
        search: searchQuery,
        cuisine: selectedCuisine,
        limit: 20,
      }),
    enabled: isOpen,
  });

  const recipes = recipesData?.data?.data || [];

  const handleSelect = async (recipe: Recipe) => {
    setIsAdding(true);
    try {
      await onSelect(recipe);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={isAdding ? undefined : onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Loading Overlay */}
          {isAdding && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-3"></div>
                <p className="text-gray-700 font-medium">
                  Adding recipe to meal plan...
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              Select Recipe for {mealType}
            </h2>
            <button
              onClick={onClose}
              disabled={isAdding}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Cuisine Filter */}
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Cuisines</option>
                <option value="Italian">Italian</option>
                <option value="Indian">Indian</option>
                <option value="Mexican">Mexican</option>
                <option value="Thai">Thai</option>
                <option value="American">American</option>
                <option value="French">French</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
          </div>

          {/* Recipe List */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No recipes found. Try adjusting your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((recipe: Recipe) => (
                  <button
                    key={recipe._id}
                    onClick={() => handleSelect(recipe)}
                    disabled={isAdding}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Recipe Image */}
                    {recipe.images && recipe.images.length > 0 ? (
                      <img
                        src={recipe.images[0]}
                        alt={recipe.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-3xl">🍽️</span>
                      </div>
                    )}

                    {/* Recipe Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {recipe.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {recipe.prepTime + recipe.cookTime}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {recipe.servings}
                        </span>
                        {recipe.averageRating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star
                              size={14}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            {recipe.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {recipe.cuisine && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                          {recipe.cuisine}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSelector;
