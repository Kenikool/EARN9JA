import type { User } from "./index";

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface RecipeInstruction {
  stepNumber: number;
  description: string;
  image?: string;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface Recipe {
  _id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  cuisine: string;
  dietaryTags: string[];
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutrition?: RecipeNutrition;
  author: User;
  averageRating: number;
  totalReviews: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  recipe: string;
  user: User;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface RecipeFilters {
  cuisine?: string;
  difficulty?: "easy" | "medium" | "hard";
  dietary?: string;
  prepTime?: { min?: number; max?: number };
  cookTime?: { min?: number; max?: number };
  search?: string;
  sortBy?: "createdAt" | "averageRating" | "views" | "prepTime" | "cookTime";
  sortOrder?: "asc" | "desc";
}

export interface RecipeListResponse {
  status: string;
  results: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecipes: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: Recipe[];
}

export interface RecipeDetailResponse {
  status: string;
  data: Recipe & {
    reviews: Review[];
  };
}
