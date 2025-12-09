import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Lock, Globe, Trash2 } from "lucide-react";
import type { Collection } from "../../types/collection";

interface CollectionCardProps {
  collection: Collection;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onDelete,
  showActions = false,
}) => {
  const recipeCount = Array.isArray(collection.recipes)
    ? collection.recipes.length
    : collection.recipeCount || 0;

  const coverImage =
    collection.coverImage ||
    (Array.isArray(collection.recipes) &&
    collection.recipes.length > 0 &&
    typeof collection.recipes[0] !== "string"
      ? collection.recipes[0].images?.[0]
      : null) ||
    "/assets/react.svg";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/collections/${collection._id}`}>
        <div className="relative h-48 bg-gray-200">
          <img
            src={coverImage}
            alt={collection.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/assets/react.svg";
            }}
          />
          <div className="absolute top-2 right-2">
            {collection.isPublic ? (
              <div className="bg-white bg-opacity-90 rounded-full p-2">
                <Globe size={16} className="text-green-600" />
              </div>
            ) : (
              <div className="bg-white bg-opacity-90 rounded-full p-2">
                <Lock size={16} className="text-gray-600" />
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/collections/${collection._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
            {collection.name}
          </h3>
        </Link>

        {collection.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <BookOpen size={16} className="mr-1" />
            <span>
              {recipeCount} recipe{recipeCount !== 1 ? "s" : ""}
            </span>
          </div>

          {showActions && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (
                  window.confirm(
                    "Are you sure you want to delete this collection?"
                  )
                ) {
                  onDelete(collection._id);
                }
              }}
              className="text-red-600 hover:text-red-700 transition-colors"
              title="Delete collection"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
