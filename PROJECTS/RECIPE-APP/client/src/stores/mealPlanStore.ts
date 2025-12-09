import { create } from "zustand";
import { mealPlanAPI } from "../services/api";

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  images: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisine: string;
  difficulty: string;
}

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

interface MealPlanStore {
  // State
  mealPlans: MealPlan[];
  currentDate: Date;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMealPlans: (startDate: Date, endDate: Date) => Promise<void>;
  createMealPlan: (data: {
    date: Date;
    meals: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snacks?: { recipe: string; time: "morning" | "afternoon" | "evening" }[];
    };
    notes?: string;
  }) => Promise<MealPlan>;

  updateMealPlan: (
    id: string,
    data: Partial<{
      date: Date;
      meals: {
        breakfast?: string;
        lunch?: string;
        dinner?: string;
        snacks?: {
          recipe: string;
          time: "morning" | "afternoon" | "evening";
        }[];
      };
      notes: string;
    }>
  ) => Promise<MealPlan>;

  deleteMealPlan: (id: string) => Promise<void>;
  addMealToDate: (
    date: Date,
    mealType: string,
    recipeId: string
  ) => Promise<void>;
  removeMealFromDate: (date: Date, mealType: string) => Promise<void>;

  // UI actions
  setCurrentDate: (date: Date) => void;
  setError: (error: string | null) => void;
  clearMealPlans: () => void;
}

export const useMealPlanStore = create<MealPlanStore>((set, get) => ({
  // Initial state
  mealPlans: [],
  currentDate: new Date(),
  isLoading: false,
  error: null,

  // Fetch meal plans for a date range
  fetchMealPlans: async (startDate: Date, endDate: Date) => {
    try {
      set({ isLoading: true, error: null });

      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      const response = await mealPlanAPI.getMealPlansByDateRange(start, end);

      set({
        mealPlans: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch meal plans",
        isLoading: false,
      });
    }
  },

  // Create new meal plan
  createMealPlan: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const response = await mealPlanAPI.createMealPlan({
        date: data.date.toISOString(),
        meals: data.meals,
        notes: data.notes,
      });

      const newMealPlan = response.data.data;

      set((state) => ({
        mealPlans: [...state.mealPlans, newMealPlan],
        isLoading: false,
      }));

      return newMealPlan;
    } catch (error: any) {
      set({
        error: error.message || "Failed to create meal plan",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update existing meal plan
  updateMealPlan: async (id: string, data) => {
    try {
      set({ isLoading: true, error: null });

      const updateData: any = {};
      if (data.date) updateData.date = data.date.toISOString();
      if (data.meals) updateData.meals = data.meals;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const response = await mealPlanAPI.updateMealPlan(id, updateData);
      const updatedMealPlan = response.data.data;

      set((state) => ({
        mealPlans: state.mealPlans.map((mp) =>
          mp._id === id ? updatedMealPlan : mp
        ),
        isLoading: false,
      }));

      return updatedMealPlan;
    } catch (error: any) {
      set({
        error: error.message || "Failed to update meal plan",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete meal plan
  deleteMealPlan: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await mealPlanAPI.deleteMealPlan(id);

      set((state) => ({
        mealPlans: state.mealPlans.filter((mp) => mp._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete meal plan",
        isLoading: false,
      });
    }
  },

  // Add meal to specific date
  addMealToDate: async (date: Date, mealType: string, recipeId: string) => {
    try {
      set({ isLoading: true, error: null });

      const dateStr = date.toISOString().split("T")[0];

      // Find existing meal plan for this date
      const existingMealPlan = get().mealPlans.find((mp) =>
        mp.date.startsWith(dateStr)
      );

      if (existingMealPlan) {
        // Update existing meal plan
        const updatedMeals = {
          ...existingMealPlan.meals,
          [mealType]: recipeId,
        };

        await get().updateMealPlan(existingMealPlan._id, {
          meals: updatedMeals,
        });
      } else {
        // Create new meal plan
        const newMealPlan = {
          date,
          meals: {
            [mealType]: recipeId,
          },
        };

        await get().createMealPlan(newMealPlan);
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to add meal",
        isLoading: false,
      });
      throw error;
    }
  },

  // Remove meal from specific date
  removeMealFromDate: async (date: Date, mealType: string) => {
    try {
      set({ isLoading: true, error: null });

      const dateStr = date.toISOString().split("T")[0];

      const existingMealPlan = get().mealPlans.find((mp) =>
        mp.date.startsWith(dateStr)
      );

      if (existingMealPlan) {
        const updatedMeals = { ...existingMealPlan.meals };
        delete updatedMeals[mealType as keyof typeof updatedMeals];

        await get().updateMealPlan(existingMealPlan._id, {
          meals: updatedMeals,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to remove meal",
        isLoading: false,
      });
      throw error;
    }
  },

  // UI actions
  setCurrentDate: (date: Date) => {
    set({ currentDate: date });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearMealPlans: () => {
    set({ mealPlans: [], error: null });
  },
}));
