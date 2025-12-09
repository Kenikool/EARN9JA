import type { Recipe } from "./recipe";
import type { User } from "./index";

export interface Collection {
  _id: string;
  name: string;
  description?: string;
  user: User | string;
  recipes: Recipe[] | string[];
  isPublic: boolean;
  coverImage?: string;
  recipeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
}
