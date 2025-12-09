import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Calendar, ShoppingCart, Plus, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import ProtectedRoute from "../components/ProtectedRoute";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { MealCalendar } from "../components/mealplan/MealCalendar";
import { RecipeSelector } from "../components/mealplan/RecipeSelector";
import { mealPlanAPI, shoppingListAPI } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { useMealPlanStore } from "../stores/mealPlanStore";
import type { Recipe } from "../types/recipe";

export const MealPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { currentDate } = useMealPlanStore();
  const [showRecipeSelector, setShowRecipeSelector] = React.useState(false);
  const [selectedMealType, setSelectedMealType] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Get the date range for the current week
  const getWeekRange = () => {
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const { start: startDate, end: endDate } = getWeekRange();

  // Fetch meal plans using React Query
  const { data: mealPlansData } = useQuery({
    queryKey: ["mealPlans", startDate, endDate],
    queryFn: () => mealPlanAPI.getMealPlansByDateRange(startDate, endDate),
    staleTime: 2 * 60 * 1000,
  });

  const mealPlans = mealPlansData?.data?.data || [];

  // Mutation for creating/updating meal plans
  const createMealPlanMutation = useMutation({
    mutationFn: (data: {
      date: string;
      meals: {
        breakfast?: string;
        lunch?: string;
        dinner?: string;
        snacks?: { recipe: string; time: string }[];
      };
    }) => mealPlanAPI.createMealPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      toast.success("Meal added to plan!");
    },
    onError: (error: any) => {
      console.error("Failed to create meal plan:", error);
      toast.error(error?.response?.data?.message || "Failed to add meal");
    },
  });

  const updateMealPlanMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        meals: {
          breakfast?: string;
          lunch?: string;
          dinner?: string;
          snacks?: { recipe: string; time: string }[];
        };
      };
    }) => mealPlanAPI.updateMealPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      toast.success("Meal plan updated!");
    },
    onError: (error: any) => {
      console.error("Failed to update meal plan:", error);
      toast.error(error?.response?.data?.message || "Failed to update meal");
    },
  });

  // Handle recipe selection from calendar
  const handleSelectRecipe = (mealType: string, date?: string) => {
    setSelectedMealType(mealType);
    setSelectedDate(date || new Date().toISOString().split("T")[0]);
    setShowRecipeSelector(true);
  };

  // Handle recipe selected from modal
  const handleRecipeSelected = async (recipe: Recipe) => {
    try {
      // Find existing meal plan for the selected date
      const existingPlan = mealPlans.find((mp: any) =>
        mp.date.startsWith(selectedDate)
      );

      if (existingPlan) {
        // Update existing meal plan
        const updatedMeals = {
          ...existingPlan.meals,
          [selectedMealType]: recipe._id,
        };

        await updateMealPlanMutation.mutateAsync({
          id: existingPlan._id,
          data: { meals: updatedMeals },
        });
      } else {
        // Create new meal plan
        await createMealPlanMutation.mutateAsync({
          date: selectedDate,
          meals: {
            [selectedMealType]: recipe._id,
          },
        });
      }
    } catch (error) {
      console.error("Error adding recipe to meal plan:", error);
    } finally {
      setShowRecipeSelector(false);
      setSelectedMealType("");
      setSelectedDate("");
    }
  };

  // Generate shopping list from meal plans
  const handleGenerateShoppingList = async () => {
    if (mealPlans.length === 0) {
      toast.error("No meal plans found. Add some meals first!");
      return;
    }

    setIsGenerating(true);
    try {
      // Collect all recipe IDs from meal plans
      const recipeIds: string[] = [];
      mealPlans.forEach((plan: unknown) => {
        // Handle breakfast
        if (plan.meals?.breakfast) {
          const id =
            typeof plan.meals.breakfast === "object"
              ? plan.meals.breakfast._id
              : plan.meals.breakfast;
          if (id) recipeIds.push(id);
        }
        // Handle lunch
        if (plan.meals?.lunch) {
          const id =
            typeof plan.meals.lunch === "object"
              ? plan.meals.lunch._id
              : plan.meals.lunch;
          if (id) recipeIds.push(id);
        }
        // Handle dinner
        if (plan.meals?.dinner) {
          const id =
            typeof plan.meals.dinner === "object"
              ? plan.meals.dinner._id
              : plan.meals.dinner;
          if (id) recipeIds.push(id);
        }
        // Handle snacks
        if (plan.meals?.snacks && Array.isArray(plan.meals.snacks)) {
          plan.meals.snacks.forEach((snack: unknown) => {
            if (snack?.recipe) {
              const id =
                typeof snack.recipe === "object"
                  ? snack.recipe._id
                  : snack.recipe;
              if (id) recipeIds.push(id);
            }
          });
        }
      });

      // Remove duplicates and filter out any undefined/null values
      const uniqueRecipeIds = [...new Set(recipeIds)].filter(Boolean);

      if (uniqueRecipeIds.length === 0) {
        toast.error("No recipes found in meal plans!");
        return;
      }

      console.log("Generating shopping list with recipe IDs:", uniqueRecipeIds);

      // Create shopping list from recipes
      const response = await shoppingListAPI.createFromRecipes({
        recipeIds: uniqueRecipeIds,
        title: `Shopping List - ${new Date().toLocaleDateString()}`,
      });

      toast.success("Shopping list generated!");
      // Store the shopping list ID in localStorage so ShoppingListPage can load it
      localStorage.setItem("lastShoppingListId", response.data.data._id);
      navigate("/shopping-list");
    } catch (error: unknown) {
      console.error("Failed to generate shopping list:", error);
      toast.error(
        error?.response?.data?.message || "Failed to generate shopping list"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Count total planned meals
  const totalMeals = mealPlans.reduce((count: number, plan: unknown) => {
    let mealCount = 0;
    if (plan.meals?.breakfast) mealCount++;
    if (plan.meals?.lunch) mealCount++;
    if (plan.meals?.dinner) mealCount++;
    if (plan.meals?.snacks?.length) mealCount += plan.meals.snacks.length;
    return count + mealCount;
  }, 0);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              {/* Title and description */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Calendar size={32} className="mr-3 text-orange-600" />
                  Meal Planner
                </h1>
                <p className="text-gray-600 mt-2">
                  Plan your meals for the week and generate shopping lists
                  automatically
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerateShoppingList}
                  disabled={isGenerating || mealPlans.length === 0}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={16} className="mr-2" />
                  {isGenerating ? "Generating..." : "Generate Shopping List"}
                </button>

                <button
                  onClick={() =>
                    handleSelectRecipe(
                      "breakfast",
                      new Date().toISOString().split("T")[0]
                    )
                  }
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Quick Add Recipe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Calendar Area */}
            <div className="lg:col-span-3">
              <MealCalendar
                onSelectRecipe={(mealType, date) =>
                  handleSelectRecipe(mealType, date)
                }
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Weekly Overview
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Planned Meals</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {totalMeals}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">This Week</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shopping List</span>
                    <span className="text-sm text-orange-600">
                      {mealPlans.length > 0
                        ? "Ready to generate"
                        : "Add meals first"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Recipes (suggestions) */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen size={20} className="mr-2" />
                  Suggested Recipes
                </h3>

                <div className="space-y-3">
                  <div className="text-sm text-gray-500 text-center py-4">
                    No suggestions yet. Add some favorite recipes to get
                    started!
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-orange-800 mb-2">
                  💡 Pro Tip
                </h4>
                <p className="text-sm text-orange-700">
                  Plan your meals on Sunday for the whole week, then generate a
                  shopping list to save time at the store!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Selector Modal */}
        {showRecipeSelector && (
          <RecipeSelector
            isOpen={showRecipeSelector}
            onClose={() => {
              setShowRecipeSelector(false);
              setSelectedMealType("");
              setSelectedDate("");
            }}
            onSelect={handleRecipeSelected}
            mealType={selectedMealType}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MealPlannerPage;
