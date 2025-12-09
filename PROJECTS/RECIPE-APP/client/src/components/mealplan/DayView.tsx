import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { MealSlot } from "./MealSlot";
import type { Recipe } from "../../types/recipe";

interface MealPlan {
  _id: string;
  user: string;
  date: string;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    snacks?: { recipe: Recipe; time: "morning" | "afternoon" | "evening" }[];
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DayViewProps {
  date: Date;
  mealPlan?: MealPlan;
  onSelectRecipe?: (mealType: string, date: string) => void;
  isToday?: boolean;
}

export const DayView: React.FC<DayViewProps> = ({
  date,
  mealPlan,
  onSelectRecipe,
  isToday = false,
}) => {
  const [showNotes, setShowNotes] = React.useState(false);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const handleAddMeal = (mealType: string) => {
    if (onSelectRecipe) {
      const dateStr = date.toISOString().split("T")[0];
      onSelectRecipe(mealType, dateStr);
    }
  };

  const handleRemoveMeal = (mealType: string) => {
    // This would be handled by the parent component or store
    console.log(`Remove ${mealType} for ${formatDate(date)}`);
  };

  return (
    <div
      className={`border rounded-lg p-2 sm:p-3 min-h-[250px] sm:min-h-[300px] ${
        isToday
          ? "bg-orange-50 border-orange-200 ring-2 ring-orange-200"
          : "bg-white border-gray-200 hover:border-gray-300"
      } transition-all min-w-0`}
    >
      {/* Date Header */}
      <div
        className={`text-center mb-3 pb-2 border-b ${
          isToday
            ? "text-orange-600 border-orange-200"
            : "text-gray-700 border-gray-200"
        }`}
      >
        <h3 className="font-semibold text-sm sm:text-base">
          {formatDate(date)}
        </h3>
        {isToday && (
          <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
            Today
          </span>
        )}
      </div>

      {/* Meal Slots */}
      <div className="space-y-2 sm:space-y-3">
        {/* Breakfast */}
        <MealSlot
          title="Breakfast"
          meal={mealPlan?.meals?.breakfast}
          icon="🌅"
          onAddMeal={() => handleAddMeal("breakfast")}
          onRemoveMeal={() => handleRemoveMeal("breakfast")}
          formatTime={formatTime}
        />

        {/* Lunch */}
        <MealSlot
          title="Lunch"
          meal={mealPlan?.meals?.lunch}
          icon="🌞"
          onAddMeal={() => handleAddMeal("lunch")}
          onRemoveMeal={() => handleRemoveMeal("lunch")}
          formatTime={formatTime}
        />

        {/* Dinner */}
        <MealSlot
          title="Dinner"
          meal={mealPlan?.meals?.dinner}
          icon="🌙"
          onAddMeal={() => handleAddMeal("dinner")}
          onRemoveMeal={() => handleRemoveMeal("dinner")}
          formatTime={formatTime}
        />

        {/* Snacks */}
        {mealPlan?.meals?.snacks && mealPlan.meals.snacks.length > 0 ? (
          <div className="border rounded-lg p-2 bg-gray-50">
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="mr-1">🍪</span>
              <span>Snacks</span>
            </h4>
            <div className="space-y-1">
              {mealPlan.meals.snacks.map((snack, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs sm:text-sm bg-white p-1.5 rounded"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xs flex-shrink-0">
                      {snack.recipe
                        ? snack.recipe.title?.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                    <span className="truncate">
                      {snack.recipe?.title || "Unknown Recipe"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMeal("snacks")}
                    className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                    aria-label="Remove snack"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleAddMeal("snacks")}
            className="w-full border-2 border-dashed border-gray-200 rounded-lg p-2 text-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
          >
            <Plus size={14} className="mx-auto mb-1" />
            <span className="text-xs block">Add Snacks</span>
          </button>
        )}
      </div>

      {/* Notes Section */}
      {mealPlan?.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 flex items-center w-full"
          >
            <span>{showNotes ? "📝 Hide Notes" : "📝 Show Notes"}</span>
            <span className="ml-1">{showNotes ? "▲" : "▼"}</span>
          </button>
          {showNotes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-700">
              {mealPlan.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayView;
