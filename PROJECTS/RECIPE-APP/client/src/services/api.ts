import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    console.log("🔑 Token from store:", token ? "EXISTS" : "MISSING");
    console.log("📡 Making request to:", config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set");
    } else {
      console.log("❌ No token in store - request will fail");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - no automatic logout
// Let components handle auth errors explicitly
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Just pass the error through without automatic logout
    // Components can handle auth errors as needed
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  getMe: () => api.get("/auth/me"),

  updateProfile: (data: any) => api.put("/auth/profile", data),

  logout: () => api.post("/auth/logout"),
};

// Recipe API
export const recipeAPI = {
  getRecipes: (params?: any) => api.get("/recipes", { params }),

  getRecipe: (slug: string) => api.get(`/recipes/${slug}`),

  createRecipe: (data: any) => api.post("/recipes", data),

  updateRecipe: (id: string, data: any) => api.put(`/recipes/${id}`, data),

  deleteRecipe: (id: string) => api.delete(`/recipes/${id}`),

  getMyRecipes: () => api.get("/recipes/my/recipes"),

  getUserRecipes: (userId: string, params?: any) =>
    api.get(`/recipes/user/${userId}`, { params }),

  toggleFavorite: (recipeId: string) =>
    api.post(`/recipes/${recipeId}/favorite`),

  removeFavorite: (recipeId: string) =>
    api.delete(`/recipes/${recipeId}/favorite`),

  getFavorites: () => api.get("/recipes/favorites/list"),

  getPopularRecipes: (limit?: number) =>
    api.get("/recipes/popular", { params: { limit } }),

  getRecipesByCuisine: (cuisine: string, limit?: number) =>
    api.get(`/recipes/cuisine/${cuisine}`, { params: { limit } }),
};

// Review API
export const reviewAPI = {
  getRecipeReviews: (recipeId: string, params?: any) =>
    api.get(`/reviews/recipe/${recipeId}`, { params }),

  getReviewStats: (recipeId: string) => api.get(`/reviews/stats/${recipeId}`),

  createReview: (recipeId: string, data: any) =>
    api.post(`/reviews/recipe/${recipeId}`, data),

  updateReview: (reviewId: string, data: any) =>
    api.put(`/reviews/${reviewId}`, data),

  deleteReview: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
};

// Meal Plan API
export const mealPlanAPI = {
  getMealPlans: (params?: any) => api.get("/meal-plans", { params }),

  getMealPlan: (id: string) => api.get(`/meal-plans/${id}`),

  getMealPlanByDate: (date: string) => api.get(`/meal-plans/date/${date}`),

  getMealPlansByDateRange: (startDate: string, endDate: string) =>
    api.get("/meal-plans/range", { params: { startDate, endDate } }),

  createMealPlan: (data: any) => api.post("/meal-plans", data),

  updateMealPlan: (id: string, data: any) => api.put(`/meal-plans/${id}`, data),

  deleteMealPlan: (id: string) => api.delete(`/meal-plans/${id}`),

  generateShoppingList: (mealPlanId: string) =>
    api.get(`/meal-plans/${mealPlanId}/shopping-list`),
};

// Shopping List API
export const shoppingListAPI = {
  getShoppingLists: (params?: any) => api.get("/shopping-lists", { params }),

  getShoppingList: (id: string) => api.get(`/shopping-lists/${id}`),

  createFromRecipes: (data: any) =>
    api.post("/shopping-lists/from-recipes", data),

  createFromMealPlan: (data: any) =>
    api.post("/shopping-lists/from-meal-plan", data),

  createCustom: (data: any) => api.post("/shopping-lists/custom", data),

  updateShoppingList: (id: string, data: any) =>
    api.put(`/shopping-lists/${id}`, data),

  deleteShoppingList: (id: string) => api.delete(`/shopping-lists/${id}`),

  updateItemStatus: (id: string, itemIndex: number, checked: boolean) =>
    api.patch(`/shopping-lists/${id}/items/${itemIndex}`, { checked }),

  addItem: (id: string, data: unknown) =>
    api.post(`/shopping-lists/${id}/items`, data),

  removeItem: (id: string, itemIndex: number) =>
    api.delete(`/shopping-lists/${id}/items`, { data: { itemIndex } }),
};

// Upload API
export const uploadAPI = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Collection API
export const collectionAPI = {
  getCollections: () => api.get("/collections"),

  getCollection: (id: string) => api.get(`/collections/${id}`),

  getUserCollections: (userId: string) =>
    api.get(`/collections/user/${userId}`),

  createCollection: (data: unknown) => api.post("/collections", data),

  updateCollection: (id: string, data: unknown) =>
    api.put(`/collections/${id}`, data),

  deleteCollection: (id: string) => api.delete(`/collections/${id}`),

  addRecipeToCollection: (collectionId: string, recipeId: string) =>
    api.post(`/collections/${collectionId}/recipes`, { recipeId }),

  removeRecipeFromCollection: (collectionId: string, recipeId: string) =>
    api.delete(`/collections/${collectionId}/recipes/${recipeId}`),
};

// User/Social API
export const userAPI = {
  getUserProfile: (userId: string) => api.get(`/auth/users/${userId}`),

  followUser: (userId: string) => api.post(`/auth/users/${userId}/follow`),

  unfollowUser: (userId: string) => api.delete(`/auth/users/${userId}/follow`),

  getFollowers: (userId: string) => api.get(`/auth/users/${userId}/followers`),

  getFollowing: (userId: string) => api.get(`/auth/users/${userId}/following`),
};

export default api;
