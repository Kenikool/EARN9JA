// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  following?: string[];
  followers?: string[];
  favoriteRecipes?: string[];
  createdAt?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  token: string;
}

// Form types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Re-export recipe types
export * from "./recipe";
