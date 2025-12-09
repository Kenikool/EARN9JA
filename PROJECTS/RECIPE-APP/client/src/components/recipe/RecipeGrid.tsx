import React from "react";
import type { Recipe } from "../../types/recipe";
import { RecipeCard } from "./RecipeCard";
import { LoadingCard } from "../common/LoadingSpinner";

interface RecipeGridProps {
  recipes: Recipe[];
  isLoading?: boolean;
  onFavoriteToggle?: () => void;
  columns?: 2 | 3 | 4;
}

const gridClasses = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  isLoading = false,
  onFavoriteToggle,
  columns = 3,
}) => {
  if (isLoading) {
    return (
      <div className={`grid gap-6 ${gridClasses[columns]}`}>
        {Array.from({ length: 6 }).map((_: unknown, index: number) => (
          <LoadingCard key={index} />
        ))}
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍳</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No recipes found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters or search terms to find more recipes.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridClasses[columns]}`}>
      {recipes.map((recipe: Recipe) => (
        <RecipeCard
          key={recipe._id}
          recipe={recipe}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
};
