export interface ShoppingListItem {
  ingredient: string;
  amount: number;
  unit: string;
  checked: boolean;
  category?: string;
  recipes?: string[];
}

export interface ShoppingList {
  _id: string;
  user: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

export type ShoppingListCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "seafood"
  | "bakery"
  | "pantry"
  | "spices"
  | "beverages"
  | "frozen"
  | "other";
