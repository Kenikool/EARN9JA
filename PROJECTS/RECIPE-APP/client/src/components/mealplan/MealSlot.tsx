import React from "react";
import { Plus, Trash2, Clock, Users, ChefHat } from "lucide-react";
import type { Recipe } from "../../types/recipe";

interface MealSlotProps {
  title: string;
  meal?: Recipe;
  icon: string;
  onAddMeal: () => void;
  onRemoveMeal: () => void;
  formatTime: (minutes: number) => string;
}

export const MealSlot: React.FC<MealSlotProps> = ({
  title,
  meal,
  icon,
  onAddMeal,
  onRemoveMeal,
  formatTime,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 min-w-0">
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center truncate min-w-0 flex-1">
          <span className="mr-1 flex-shrink-0">{icon}</span>
          <span className="truncate">{title}</span>
        </h4>
        {meal && (
          <button
            onClick={onRemoveMeal}
            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors flex-shrink-0"
            title={`Remove ${title}`}
            aria-label={`Remove ${title}`}
          >
            <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      {meal ? (
        <div className="space-y-1.5">
          {/* Recipe Image */}
          {meal.images && meal.images.length > 0 && !imageError ? (
            <div className="relative overflow-hidden rounded">
              <img
                src={meal.images[0]}
                alt={meal.title}
                className="w-full h-16 sm:h-20 object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-16 sm:h-20 bg-gray-200 rounded flex items-center justify-center">
              <ChefHat size={20} className="text-gray-400 sm:w-6 sm:h-6" />
            </div>
          )}

          {/* Recipe Info */}
          <div className="space-y-1">
            {/* Title */}
            <h5 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
              {meal.title}
            </h5>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-gray-600">
              {/* Prep time */}
              <div className="flex items-center gap-0.5">
                <Clock size={10} className="sm:w-3 sm:h-3" />
                <span>{formatTime(meal.prepTime + meal.cookTime)}</span>
              </div>

              {/* Servings */}
              <div className="flex items-center gap-0.5">
                <Users size={10} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">
                  {meal.servings} servings
                </span>
                <span className="sm:hidden">{meal.servings}</span>
              </div>

              {/* Difficulty */}
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  meal.difficulty === "easy"
                    ? "bg-green-100 text-green-700"
                    : meal.difficulty === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {meal.difficulty}
              </span>
            </div>

            {/* Cuisine */}
            {meal.cuisine && (
              <div className="text-xs text-gray-500 truncate">
                {meal.cuisine}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty slot - Add meal button */
        <button
          onClick={onAddMeal}
          className="w-full h-16 sm:h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-all group"
        >
          <Plus
            size={16}
            className="mb-1 group-hover:scale-110 transition-transform sm:w-5 sm:h-5"
          />
          <span className="text-xs">Add {title}</span>
        </button>
      )}
    </div>
  );
};

export default MealSlot;
