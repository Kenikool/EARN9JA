import React from "react";
import { Link } from "react-router-dom";
import { Heart, Clock, Users, Star, Eye } from "lucide-react";
import type { Recipe } from "../../types/recipe";
import { useAuthStore } from "../../stores/authStore";
import { recipeAPI } from "../../services/api";

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteToggle?: () => void;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onFavoriteToggle,
}) => {
  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (user && recipe.author) {
      // Check if current user has favorited this recipe
      // This would need to be implemented in the backend or through a separate API call
      // For now, we'll assume it's not favorited
      setIsFavorite(false);
    }
  }, [user, recipe.author]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    setIsLoading(true);
    try {
      if (isFavorite) {
        await recipeAPI.removeFavorite(recipe._id);
        setIsFavorite(false);
      } else {
        await recipeAPI.toggleFavorite(recipe._id);
        setIsFavorite(true);
      }
      onFavoriteToggle?.();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
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

  return React.createElement(
    Link,
    { to: `/recipes/${recipe.slug}`, className: "group block" },
    React.createElement(
      "div",
      {
        className:
          "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300",
      },
      // Recipe Image
      React.createElement(
        "div",
        { className: "relative h-48 bg-gray-200" },
        recipe.images && recipe.images.length > 0
          ? React.createElement("img", {
              src: recipe.images[0],
              alt: recipe.title,
              className:
                "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
              onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.src = "/assets/react.svg"; // Fallback image
              },
            })
          : React.createElement(
              "div",
              {
                className:
                  "w-full h-full flex items-center justify-center text-gray-400",
              },
              React.createElement("span", { className: "text-4xl" }, "🍳")
            ),

        // Favorite Button
        user &&
          React.createElement(
            "button",
            {
              onClick: handleFavoriteToggle,
              disabled: isLoading,
              className:
                "absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors",
            },
            React.createElement(Heart, {
              size: 16,
              className: `${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              } transition-colors`,
            })
          ),

        // Difficulty Badge
        React.createElement(
          "div",
          { className: "absolute top-2 left-2" },
          React.createElement(
            "span",
            {
              className: `px-2 py-1 rounded-full text-xs font-medium ${
                difficultyColors[recipe.difficulty]
              }`,
            },
            recipe.difficulty.charAt(0).toUpperCase() +
              recipe.difficulty.slice(1)
          )
        )
      ),

      // Recipe Info
      React.createElement(
        "div",
        { className: "p-4" },
        // Title
        React.createElement(
          "h3",
          {
            className:
              "font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors",
          },
          recipe.title
        ),

        // Description
        React.createElement(
          "p",
          { className: "text-gray-600 text-sm mb-3 line-clamp-2" },
          recipe.description
        ),

        // Author
        React.createElement(
          "div",
          { className: "flex items-center mb-3 text-sm text-gray-500" },
          React.createElement(
            "div",
            {
              className:
                "w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center",
            },
            recipe.author.avatar
              ? React.createElement("img", {
                  src: recipe.author.avatar,
                  alt: recipe.author.name,
                  className: "w-full h-full rounded-full object-cover",
                })
              : React.createElement(
                  "span",
                  { className: "text-xs font-medium" },
                  recipe.author.name.charAt(0).toUpperCase()
                )
          ),
          React.createElement("span", null, `by ${recipe.author.name}`)
        ),

        // Recipe Stats
        React.createElement(
          "div",
          {
            className:
              "flex items-center justify-between text-sm text-gray-500",
          },
          React.createElement(
            "div",
            { className: "flex items-center space-x-3" },
            // Prep Time
            React.createElement(
              "div",
              { className: "flex items-center" },
              React.createElement(Clock, { size: 14, className: "mr-1" }),
              React.createElement(
                "span",
                null,
                formatTime(recipe.prepTime + recipe.cookTime)
              )
            ),

            // Servings
            React.createElement(
              "div",
              { className: "flex items-center" },
              React.createElement(Users, { size: 14, className: "mr-1" }),
              React.createElement("span", null, recipe.servings)
            ),

            // Cuisine
            React.createElement(
              "span",
              { className: "px-2 py-1 bg-gray-100 rounded text-xs" },
              recipe.cuisine
            )
          ),

          React.createElement(
            "div",
            { className: "flex items-center space-x-2" },
            // Views
            React.createElement(
              "div",
              { className: "flex items-center" },
              React.createElement(Eye, { size: 14, className: "mr-1" }),
              React.createElement("span", null, recipe.views)
            ),

            // Rating
            React.createElement(
              "div",
              { className: "flex items-center" },
              React.createElement(Star, {
                size: 14,
                className: "mr-1 fill-yellow-400 text-yellow-400",
              }),
              React.createElement(
                "span",
                null,
                recipe.averageRating.toFixed(1)
              ),
              React.createElement(
                "span",
                { className: "text-gray-400 ml-1" },
                `(${recipe.totalReviews})`
              )
            )
          )
        ),

        // Dietary Tags
        recipe.dietaryTags &&
          recipe.dietaryTags.length > 0 &&
          React.createElement(
            "div",
            { className: "mt-3 flex flex-wrap gap-1" },
            recipe.dietaryTags.slice(0, 3).map((tag, index) =>
              React.createElement(
                "span",
                {
                  key: index,
                  className:
                    "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full",
                },
                tag
              )
            ),
            recipe.dietaryTags.length > 3 &&
              React.createElement(
                "span",
                {
                  className:
                    "px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full",
                },
                `+${recipe.dietaryTags.length - 3} more`
              )
          )
      )
    )
  );
};
