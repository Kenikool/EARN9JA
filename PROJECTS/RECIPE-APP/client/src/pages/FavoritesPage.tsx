import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowLeft } from "lucide-react";
import { recipeAPI } from "../services/api";
import { RecipeGrid } from "../components/recipe/RecipeGrid";
import { LoadingPage } from "../components/common/LoadingSpinner";
import { useAuthStore } from "../stores/authStore";
import type { Recipe } from "../types/recipe";

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: favoritesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => recipeAPI.getFavorites(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const favorites: Recipe[] = favoritesData?.data?.data || [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your favorites
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn't load your favorites. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Favorite Recipes
              </h1>
              <p className="text-gray-600 mt-1">
                {favorites.length} recipe{favorites.length !== 1 ? "s" : ""}{" "}
                saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {favorites.length > 0 ? (
          <RecipeGrid
            recipes={favorites}
            isLoading={isLoading}
            onFavoriteToggle={() => refetch()}
            columns={3}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start exploring recipes and save your favorites here
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Explore Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
