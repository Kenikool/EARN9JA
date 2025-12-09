import { create } from "zustand";
import { shoppingListAPI } from "../services/api";
import type { ShoppingList, ShoppingListItem } from "../types/shopping";
import { toast } from "react-hot-toast";

interface ShoppingListState {
  shoppingLists: ShoppingList[];
  currentList: ShoppingList | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchShoppingLists: () => Promise<void>;
  fetchShoppingList: (id: string) => Promise<void>;
  createFromMealPlan: (
    mealPlanId: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  createFromRecipes: (recipeIds: string[]) => Promise<void>;
  createCustom: (items: ShoppingListItem[]) => Promise<void>;
  updateItemStatus: (
    listId: string,
    itemIndex: number,
    checked: boolean
  ) => Promise<void>;
  addItem: (
    listId: string,
    item: Omit<ShoppingListItem, "checked">
  ) => Promise<void>;
  removeItem: (listId: string, itemIndex: number) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  clearCurrentList: () => void;
}

export const useShoppingListStore = create<ShoppingListState>((set, get) => ({
  shoppingLists: [],
  currentList: null,
  isLoading: false,
  error: null,

  fetchShoppingLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await shoppingListAPI.getShoppingLists();
      const lists = Array.isArray(response.data.data) ? response.data.data : [];
      // Always set the most recent list as current (first in array)
      const currentList = lists.length > 0 ? lists[0] : null;
      set({ shoppingLists: lists, currentList, isLoading: false });
    } catch (error: any) {
      console.error("Error fetching shopping lists:", error);
      set({ error: error.message, isLoading: false });
      toast.error("Failed to load shopping lists");
    }
  },

  fetchShoppingList: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await shoppingListAPI.getShoppingList(id);
      set({ currentList: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to load shopping list");
    }
  },

  createFromMealPlan: async (
    mealPlanId: string,
    startDate: string,
    endDate: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await shoppingListAPI.createFromMealPlan({
        mealPlanId,
        startDate,
        endDate,
      });
      set({ currentList: response.data.data, isLoading: false });
      toast.success("Shopping list generated from meal plan!");
      await get().fetchShoppingLists();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to generate shopping list");
    }
  },

  createFromRecipes: async (recipeIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await shoppingListAPI.createFromRecipes({ recipeIds });
      set({ currentList: response.data.data, isLoading: false });
      toast.success("Shopping list created from recipes!");
      await get().fetchShoppingLists();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to create shopping list");
    }
  },

  createCustom: async (items: ShoppingListItem[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await shoppingListAPI.createCustom({ items });
      set({ currentList: response.data.data, isLoading: false });
      toast.success("Custom shopping list created!");
      await get().fetchShoppingLists();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to create shopping list");
    }
  },

  updateItemStatus: async (
    listId: string,
    itemIndex: number,
    checked: boolean
  ) => {
    try {
      await shoppingListAPI.updateItemStatus(listId, itemIndex, checked);

      // Update local state
      const currentList = get().currentList;
      if (currentList && currentList._id === listId) {
        const updatedItems = [...currentList.items];
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], checked };
        set({ currentList: { ...currentList, items: updatedItems } });
      }
    } catch (error: any) {
      toast.error("Failed to update item");
    }
  },

  addItem: async (listId: string, item: Omit<ShoppingListItem, "checked">) => {
    try {
      const response = await shoppingListAPI.addItem(listId, item);
      set({ currentList: response.data.data });
      toast.success("Item added to shopping list");
    } catch (error: unknown) {
      toast.error("Failed to add item");
    }
  },

  removeItem: async (listId: string, itemIndex: number) => {
    try {
      const response = await shoppingListAPI.removeItem(listId, itemIndex);
      set({ currentList: response.data.data });
      toast.success("Item removed from shopping list");
    } catch (error: unknown) {
      toast.error("Failed to remove item");
    }
  },

  deleteShoppingList: async (id: string) => {
    try {
      await shoppingListAPI.deleteShoppingList(id);
      set({
        shoppingLists: get().shoppingLists.filter((list) => list._id !== id),
        currentList: get().currentList?._id === id ? null : get().currentList,
      });
      toast.success("Shopping list deleted");
    } catch (error: unknown) {
      toast.error("Failed to delete shopping list");
    }
  },

  clearCurrentList: () => {
    set({ currentList: null });
  },
}));
