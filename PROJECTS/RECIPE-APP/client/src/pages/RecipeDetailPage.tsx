import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Users,
  Star,
  Eye,
  Heart,
  Share2,
  Printer,
  ArrowLeft,
  ChefHat,
  BookOpen,
  Calendar,
  FolderPlus,
} from "lucide-react";
import { recipeAPI, collectionAPI } from "../services/api";
import { LoadingPage } from "../components/common/LoadingSpinner";
import { useAuthStore } from "../stores/authStore";
import { ReviewSection } from "../components/review/ReviewSection";
import { toast } from "react-hot-toast";
import type { Recipe } from "../types/recipe";
import type { Collection } from "../types/collection";

export const RecipeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [showCollectionModal, setShowCollectionModal] = React.useState(false);
  const [userCollections, setUserCollections] = React.useState<Collection[]>(
    []
  );

  const {
    data: recipeData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recipe", slug],
    queryFn: () => recipeAPI.getRecipe(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recipe: Recipe | null = recipeData?.data?.data || null;

  React.useEffect(() => {
    if (recipe) {
      // Check if current user has favorited this recipe
      setIsFavorite(false); // Would need API call to check
    }
  }, [recipe]);

  const handleFavoriteToggle = async () => {
    if (!user || !recipe) return;

    try {
      if (isFavorite) {
        await recipeAPI.removeFavorite(recipe._id);
        setIsFavorite(false);
      } else {
        await recipeAPI.toggleFavorite(recipe._id);
        setIsFavorite(true);
      }
      refetch();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title,
        text: recipe?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Recipe link copied to clipboard!");
    }
  };

  const handleAddToMealPlan = () => {
    if (!user) {
      toast.error("Please log in to add recipes to your meal plan");
      navigate("/login");
      return;
    }
    toast.success("Redirecting to meal planner...");
    navigate("/meal-planner");
  };

  const handleOpenCollectionModal = async () => {
    if (!user) {
      toast.error("Please log in to save recipes to collections");
      navigate("/login");
      return;
    }

    try {
      const response = await collectionAPI.getCollections();
      setUserCollections(response.data.data || []);
      setShowCollectionModal(true);
    } catch {
      toast.error("Failed to load collections");
    }
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!recipe) return;

    try {
      await collectionAPI.addRecipeToCollection(collectionId, recipe._id);
      toast.success("Recipe added to collection!");
      setShowCollectionModal(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message?.includes("already in collection")) {
        toast.error("Recipe is already in this collection");
      } else {
        toast.error("Failed to add recipe to collection");
      }
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const nextImage = () => {
    if (recipe && recipe.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % recipe.images.length);
    }
  };

  const previousImage = () => {
    if (recipe && recipe.images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + recipe.images.length) % recipe.images.length
      );
    }
  };

  if (isLoading) {
    return React.createElement(LoadingPage);
  }

  if (error || !recipe) {
    return React.createElement(
      "div",
      { className: "min-h-screen flex items-center justify-center" },
      React.createElement(
        "div",
        { className: "text-center" },
        React.createElement("div", { className: "text-6xl mb-4" }, "🔍"),
        React.createElement(
          "h2",
          { className: "text-xl font-semibold text-gray-900 mb-2" },
          "Recipe not found"
        ),
        React.createElement(
          "p",
          { className: "text-gray-600 mb-4" },
          "The recipe you're looking for doesn't exist or has been removed."
        ),
        React.createElement(
          Link,
          {
            to: "/",
            className:
              "inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
          },
          React.createElement(ArrowLeft, { size: 16, className: "mr-2" }),
          "Back to Home"
        )
      )
    );
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-gray-50" },

    // Back Button
    React.createElement(
      "div",
      { className: "bg-white border-b" },
      React.createElement(
        "div",
        { className: "container mx-auto px-4 py-4" },
        React.createElement(
          "button",
          {
            onClick: () => navigate(-1),
            className:
              "flex items-center text-gray-600 hover:text-gray-900 transition-colors",
          },
          React.createElement(ArrowLeft, { size: 20, className: "mr-2" }),
          "Back"
        )
      )
    ),

    // Hero Section with Images
    React.createElement(
      "div",
      { className: "bg-white" },
      React.createElement(
        "div",
        { className: "container mx-auto px-4 py-8" },
        recipe.images && recipe.images.length > 0
          ? React.createElement(
              "div",
              { className: "relative max-w-4xl mx-auto" },
              // Main Image
              React.createElement("img", {
                src: recipe.images[currentImageIndex],
                alt: recipe.title,
                className: "w-full h-96 object-cover rounded-lg shadow-lg",
                onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/react.svg";
                },
              }),

              // Image Navigation
              recipe.images.length > 1 &&
                React.createElement(
                  "div",
                  {
                    className:
                      "absolute inset-0 flex items-center justify-between",
                  },
                  React.createElement(
                    "button",
                    {
                      onClick: previousImage,
                      className:
                        "bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all",
                    },
                    "‹"
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: nextImage,
                      className:
                        "bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all",
                    },
                    "›"
                  )
                ),

              // Image Indicators
              recipe.images.length > 1 &&
                React.createElement(
                  "div",
                  { className: "flex justify-center mt-4 space-x-2" },
                  recipe.images.map((_, index) =>
                    React.createElement("button", {
                      key: index,
                      onClick: () => setCurrentImageIndex(index),
                      className: `w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? "bg-red-600"
                          : "bg-gray-300"
                      }`,
                    })
                  )
                )
            )
          : React.createElement(
              "div",
              {
                className:
                  "w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center",
              },
              React.createElement(ChefHat, {
                size: 48,
                className: "text-gray-400",
              })
            )
      )
    ),

    // Recipe Content
    React.createElement(
      "div",
      { className: "container mx-auto px-4 py-8" },
      React.createElement(
        "div",
        { className: "max-w-4xl mx-auto" },
        React.createElement(
          "div",
          { className: "bg-white rounded-lg shadow-lg p-8" },
          // Title and Actions
          React.createElement(
            "div",
            {
              className:
                "flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8",
            },
            React.createElement(
              "div",
              { className: "flex-1 mb-6 lg:mb-0" },
              React.createElement(
                "h1",
                {
                  className:
                    "text-3xl lg:text-4xl font-bold text-gray-900 mb-4",
                },
                recipe.title
              ),
              React.createElement(
                "p",
                { className: "text-gray-600 text-lg mb-6" },
                recipe.description
              ),

              // Author Info
              React.createElement(
                "div",
                { className: "flex items-center mb-6" },
                React.createElement(
                  "div",
                  {
                    className:
                      "w-12 h-12 rounded-full bg-gray-200 mr-4 flex items-center justify-center",
                  },
                  recipe.author.avatar
                    ? React.createElement("img", {
                        src: recipe.author.avatar,
                        alt: recipe.author.name,
                        className: "w-full h-full rounded-full object-cover",
                      })
                    : React.createElement(
                        "span",
                        { className: "text-lg font-medium text-gray-600" },
                        recipe.author.name.charAt(0).toUpperCase()
                      )
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "p",
                    { className: "font-medium text-gray-900" },
                    recipe.author.name
                  ),
                  React.createElement(
                    "p",
                    { className: "text-sm text-gray-500" },
                    "Recipe Author"
                  )
                )
              )
            ),

            // Action Buttons
            React.createElement(
              "div",
              { className: "flex flex-col sm:flex-row gap-3" },
              user &&
                React.createElement(
                  "button",
                  {
                    onClick: handleFavoriteToggle,
                    className: `flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      isFavorite
                        ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`,
                  },
                  React.createElement(Heart, {
                    size: 16,
                    className: `mr-2 ${isFavorite ? "fill-current" : ""}`,
                  }),
                  isFavorite ? "Favorited" : "Add to Favorites"
                ),

              user &&
                React.createElement(
                  "button",
                  {
                    onClick: handleAddToMealPlan,
                    className:
                      "flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors",
                  },
                  React.createElement(Calendar, {
                    size: 16,
                    className: "mr-2",
                  }),
                  "Add to Meal Plan"
                ),

              user &&
                React.createElement(
                  "button",
                  {
                    onClick: handleOpenCollectionModal,
                    className:
                      "flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",
                  },
                  React.createElement(FolderPlus, {
                    size: 16,
                    className: "mr-2",
                  }),
                  "Save to Collection"
                ),

              React.createElement(
                "button",
                {
                  onClick: handleShare,
                  className:
                    "flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",
                },
                React.createElement(Share2, { size: 16, className: "mr-2" }),
                "Share"
              ),

              React.createElement(
                "button",
                {
                  onClick: () => window.print(),
                  className:
                    "flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",
                },
                React.createElement(Printer, { size: 16, className: "mr-2" }),
                "Print"
              )
            )
          ),

          // Recipe Stats
          React.createElement(
            "div",
            {
              className:
                "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-lg",
            },
            React.createElement(
              "div",
              { className: "text-center" },
              React.createElement(Clock, {
                size: 24,
                className: "mx-auto mb-2 text-gray-600",
              }),
              React.createElement(
                "p",
                { className: "text-sm text-gray-500" },
                "Total Time"
              ),
              React.createElement(
                "p",
                { className: "font-semibold" },
                formatTime(recipe.prepTime + recipe.cookTime)
              )
            ),
            React.createElement(
              "div",
              { className: "text-center" },
              React.createElement(Users, {
                size: 24,
                className: "mx-auto mb-2 text-gray-600",
              }),
              React.createElement(
                "p",
                { className: "text-sm text-gray-500" },
                "Servings"
              ),
              React.createElement(
                "p",
                { className: "font-semibold" },
                recipe.servings
              )
            ),
            React.createElement(
              "div",
              { className: "text-center" },
              React.createElement(Star, {
                size: 24,
                className: "mx-auto mb-2 text-gray-600",
              }),
              React.createElement(
                "p",
                { className: "text-sm text-gray-500" },
                "Rating"
              ),
              React.createElement(
                "p",
                { className: "font-semibold" },
                `${recipe.averageRating.toFixed(1)} (${
                  recipe.totalReviews
                } reviews)`
              )
            ),
            React.createElement(
              "div",
              { className: "text-center" },
              React.createElement(Eye, {
                size: 24,
                className: "mx-auto mb-2 text-gray-600",
              }),
              React.createElement(
                "p",
                { className: "text-sm text-gray-500" },
                "Views"
              ),
              React.createElement(
                "p",
                { className: "font-semibold" },
                recipe.views
              )
            )
          ),

          // Recipe Details
          React.createElement(
            "div",
            { className: "grid lg:grid-cols-2 gap-8 mb-8" },
            // Basic Info
            React.createElement(
              "div",
              null,
              React.createElement(
                "h3",
                { className: "text-lg font-semibold mb-4" },
                "Recipe Details"
              ),
              React.createElement(
                "div",
                { className: "space-y-3" },
                React.createElement(
                  "div",
                  { className: "flex justify-between" },
                  React.createElement(
                    "span",
                    { className: "text-gray-600" },
                    "Cuisine:"
                  ),
                  React.createElement(
                    "span",
                    { className: "font-medium" },
                    recipe.cuisine
                  )
                ),
                React.createElement(
                  "div",
                  { className: "flex justify-between" },
                  React.createElement(
                    "span",
                    { className: "text-gray-600" },
                    "Difficulty:"
                  ),
                  React.createElement(
                    "span",
                    {
                      className: `px-2 py-1 rounded text-xs font-medium ${
                        recipe.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : recipe.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`,
                    },
                    recipe.difficulty.charAt(0).toUpperCase() +
                      recipe.difficulty.slice(1)
                  )
                ),
                React.createElement(
                  "div",
                  { className: "flex justify-between" },
                  React.createElement(
                    "span",
                    { className: "text-gray-600" },
                    "Prep Time:"
                  ),
                  React.createElement(
                    "span",
                    { className: "font-medium" },
                    formatTime(recipe.prepTime)
                  )
                ),
                React.createElement(
                  "div",
                  { className: "flex justify-between" },
                  React.createElement(
                    "span",
                    { className: "text-gray-600" },
                    "Cook Time:"
                  ),
                  React.createElement(
                    "span",
                    { className: "font-medium" },
                    formatTime(recipe.cookTime)
                  )
                ),
                recipe.dietaryTags &&
                  recipe.dietaryTags.length > 0 &&
                  React.createElement(
                    "div",
                    { className: "flex flex-wrap gap-2 mt-4" },
                    recipe.dietaryTags.map((tag, index) =>
                      React.createElement(
                        "span",
                        {
                          key: index,
                          className:
                            "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full",
                        },
                        tag
                      )
                    )
                  )
              )
            ),

            // Nutrition Info
            recipe.nutrition &&
              React.createElement(
                "div",
                null,
                React.createElement(
                  "h3",
                  { className: "text-lg font-semibold mb-4" },
                  "Nutrition Info"
                ),
                React.createElement(
                  "div",
                  { className: "grid grid-cols-2 gap-3" },
                  recipe.nutrition.calories &&
                    React.createElement(
                      "div",
                      { className: "text-center p-3 bg-gray-50 rounded" },
                      React.createElement(
                        "p",
                        { className: "text-2xl font-bold" },
                        recipe.nutrition.calories
                      ),
                      React.createElement(
                        "p",
                        { className: "text-sm text-gray-600" },
                        "Calories"
                      )
                    ),
                  recipe.nutrition.protein &&
                    React.createElement(
                      "div",
                      { className: "text-center p-3 bg-gray-50 rounded" },
                      React.createElement(
                        "p",
                        { className: "text-2xl font-bold" },
                        `${recipe.nutrition.protein}g`
                      ),
                      React.createElement(
                        "p",
                        { className: "text-sm text-gray-600" },
                        "Protein"
                      )
                    ),
                  recipe.nutrition.carbs &&
                    React.createElement(
                      "div",
                      { className: "text-center p-3 bg-gray-50 rounded" },
                      React.createElement(
                        "p",
                        { className: "text-2xl font-bold" },
                        `${recipe.nutrition.carbs}g`
                      ),
                      React.createElement(
                        "p",
                        { className: "text-sm text-gray-600" },
                        "Carbs"
                      )
                    ),
                  recipe.nutrition.fat &&
                    React.createElement(
                      "div",
                      { className: "text-center p-3 bg-gray-50 rounded" },
                      React.createElement(
                        "p",
                        { className: "text-2xl font-bold" },
                        `${recipe.nutrition.fat}g`
                      ),
                      React.createElement(
                        "p",
                        { className: "text-sm text-gray-600" },
                        "Fat"
                      )
                    )
                )
              )
          ),

          // Ingredients and Instructions
          React.createElement(
            "div",
            { className: "grid lg:grid-cols-2 gap-8" },
            // Ingredients
            React.createElement(
              "div",
              null,
              React.createElement(
                "h3",
                { className: "text-xl font-bold mb-4 flex items-center" },
                React.createElement(BookOpen, { size: 20, className: "mr-2" }),
                "Ingredients"
              ),
              React.createElement(
                "div",
                { className: "space-y-3" },
                recipe.ingredients.map((ingredient, index) =>
                  React.createElement(
                    "label",
                    {
                      key: index,
                      className:
                        "flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer",
                    },
                    React.createElement("input", {
                      type: "checkbox",
                      className:
                        "mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded",
                    }),
                    React.createElement(
                      "span",
                      { className: "flex-1" },
                      ingredient.notes
                        ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name} (${ingredient.notes})`
                        : `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                    )
                  )
                )
              )
            ),

            // Instructions
            React.createElement(
              "div",
              null,
              React.createElement(
                "h3",
                { className: "text-xl font-bold mb-4" },
                "Instructions"
              ),
              React.createElement(
                "div",
                { className: "space-y-4" },
                recipe.instructions.map((instruction) =>
                  React.createElement(
                    "div",
                    { key: instruction.stepNumber, className: "flex" },
                    React.createElement(
                      "div",
                      {
                        className:
                          "flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4",
                      },
                      instruction.stepNumber
                    ),
                    React.createElement(
                      "div",
                      { className: "flex-1" },
                      React.createElement(
                        "p",
                        { className: "text-gray-900 mb-2" },
                        instruction.description
                      ),
                      instruction.image &&
                        React.createElement("img", {
                          src: instruction.image,
                          alt: `Step ${instruction.stepNumber}`,
                          className: "w-full max-w-md rounded-lg shadow-md",
                        })
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // Reviews Section
      React.createElement(
        "div",
        { className: "mt-12" },
        React.createElement(ReviewSection, {
          recipeId: recipe._id,
          recipeSlug: recipe.slug,
        })
      ),

      // Collection Modal
      showCollectionModal &&
        React.createElement(
          "div",
          {
            className:
              "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
          },
          React.createElement(
            "div",
            { className: "bg-white rounded-lg max-w-md w-full p-6" },
            React.createElement(
              "h3",
              { className: "text-xl font-bold text-gray-900 mb-4" },
              "Save to Collection"
            ),

            userCollections.length > 0
              ? React.createElement(
                  "div",
                  { className: "space-y-2 max-h-96 overflow-y-auto" },
                  userCollections.map((collection) =>
                    React.createElement(
                      "button",
                      {
                        key: collection._id,
                        onClick: () => handleAddToCollection(collection._id),
                        className:
                          "w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors",
                      },
                      React.createElement(
                        "div",
                        { className: "font-medium text-gray-900" },
                        collection.name
                      ),
                      collection.description &&
                        React.createElement(
                          "div",
                          { className: "text-sm text-gray-600 mt-1" },
                          collection.description
                        )
                    )
                  )
                )
              : React.createElement(
                  "div",
                  { className: "text-center py-8" },
                  React.createElement(
                    "p",
                    { className: "text-gray-600 mb-4" },
                    "You don't have any collections yet."
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: () => {
                        setShowCollectionModal(false);
                        navigate("/profile/" + user?._id);
                      },
                      className:
                        "px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors",
                    },
                    "Create Collection"
                  )
                ),

            React.createElement(
              "button",
              {
                onClick: () => setShowCollectionModal(false),
                className:
                  "w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors",
              },
              "Cancel"
            )
          )
        )
    )
  );
};
