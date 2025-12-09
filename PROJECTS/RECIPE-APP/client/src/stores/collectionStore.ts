import { create } from "zustand";
import { collectionAPI } from "../services/api";
import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
} from "../types/collection";
import { toast } from "react-hot-toast";

interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: string) => Promise<void>;
  fetchUserCollections: (userId: string) => Promise<void>;
  createCollection: (data: CreateCollectionData) => Promise<Collection | null>;
  updateCollection: (id: string, data: UpdateCollectionData) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addRecipeToCollection: (
    collectionId: string,
    recipeId: string
  ) => Promise<void>;
  removeRecipeFromCollection: (
    collectionId: string,
    recipeId: string
  ) => Promise<void>;
  clearCurrentCollection: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  currentCollection: null,
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await collectionAPI.getCollections();
      set({ collections: response.data.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to load collections");
    }
  },

  fetchCollection: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await collectionAPI.getCollection(id);
      set({ currentCollection: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to load collection");
    }
  },

  fetchUserCollections: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await collectionAPI.getUserCollections(userId);
      set({ collections: response.data.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to load user collections");
    }
  },

  createCollection: async (data: CreateCollectionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await collectionAPI.createCollection(data);
      const newCollection = response.data.data;
      set((state) => ({
        collections: [newCollection, ...state.collections],
        isLoading: false,
      }));
      toast.success("Collection created successfully!");
      return newCollection;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to create collection");
      return null;
    }
  },

  updateCollection: async (id: string, data: UpdateCollectionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await collectionAPI.updateCollection(id, data);
      const updatedCollection = response.data.data;
      set((state) => ({
        collections: state.collections.map((c) =>
          c._id === id ? updatedCollection : c
        ),
        currentCollection:
          state.currentCollection?._id === id
            ? updatedCollection
            : state.currentCollection,
        isLoading: false,
      }));
      toast.success("Collection updated successfully!");
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to update collection");
    }
  },

  deleteCollection: async (id: string) => {
    try {
      await collectionAPI.deleteCollection(id);
      set((state) => ({
        collections: state.collections.filter((c) => c._id !== id),
        currentCollection:
          state.currentCollection?._id === id ? null : state.currentCollection,
      }));
      toast.success("Collection deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete collection");
    }
  },

  addRecipeToCollection: async (collectionId: string, recipeId: string) => {
    try {
      const response = await collectionAPI.addRecipeToCollection(
        collectionId,
        recipeId
      );
      const updatedCollection = response.data.data;
      set((state) => ({
        collections: state.collections.map((c) =>
          c._id === collectionId ? updatedCollection : c
        ),
        currentCollection:
          state.currentCollection?._id === collectionId
            ? updatedCollection
            : state.currentCollection,
      }));
      toast.success("Recipe added to collection!");
    } catch (error: any) {
      toast.error("Failed to add recipe to collection");
    }
  },

  removeRecipeFromCollection: async (
    collectionId: string,
    recipeId: string
  ) => {
    try {
      const response = await collectionAPI.removeRecipeFromCollection(
        collectionId,
        recipeId
      );
      const updatedCollection = response.data.data;
      set((state) => ({
        collections: state.collections.map((c) =>
          c._id === collectionId ? updatedCollection : c
        ),
        currentCollection:
          state.currentCollection?._id === collectionId
            ? updatedCollection
            : state.currentCollection,
      }));
      toast.success("Recipe removed from collection!");
    } catch (error: any) {
      toast.error("Failed to remove recipe from collection");
    }
  },

  clearCurrentCollection: () => {
    set({ currentCollection: null });
  },
}));
