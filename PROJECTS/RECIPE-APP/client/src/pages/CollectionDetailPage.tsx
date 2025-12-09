import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Trash2, Plus, Globe, Lock } from "lucide-react";
import { collectionAPI } from "../services/api";
import { RecipeGrid } from "../components/recipe/RecipeGrid";
import { LoadingPage } from "../components/common/LoadingSpinner";
import { useAuthStore } from "../stores/authStore";
import { useCollectionStore } from "../stores/collectionStore";
import type { Collection } from "../types/collection";
import type { Recipe } from "../types/recipe";

export const CollectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { deleteCollection } = useCollectionStore();

  const {
    data: collectionData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["collection", id],
    queryFn: () => collectionAPI.getCollection(id!),
    enabled: !!id,
  });

  const collection: Collection | null = collectionData?.data?.data || null;
  const recipes: Recipe[] = Array.isArray(collection?.recipes)
    ? (collection.recipes as Recipe[])
    : [];

  const isOwner =
    user &&
    collection &&
    (typeof collection.user === "string"
      ? collection.user === user._id
      : collection.user._id === user._id);

  const handleDelete = async () => {
    if (!collection) return;

    if (
      window.confirm(
        "Are you sure you want to delete this collection? This action cannot be undone."
      )
    ) {
      await deleteCollection(collection._id);
      navigate("/profile/" + user?._id);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Collection not found
          </h2>
          <p className="text-gray-600 mb-4">
            This collection doesn't exist or you don't have permission to view
            it.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {collection.name}
                </h1>
                <div className="flex items-center gap-1 text-sm">
                  {collection.isPublic ? (
                    <>
                      <Globe size={16} className="text-green-600" />
                      <span className="text-green-600">Public</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="text-gray-600" />
                      <span className="text-gray-600">Private</span>
                    </>
                  )}
                </div>
              </div>

              {collection.description && (
                <p className="text-gray-600 mt-2">{collection.description}</p>
              )}

              <p className="text-sm text-gray-500 mt-2">
                {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {isOwner && (
              <div className="flex gap-3">
                <Link
                  to={`/collections/${collection._id}/edit`}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {recipes.length > 0 ? (
          <RecipeGrid
            recipes={recipes}
            isLoading={isLoading}
            onFavoriteToggle={() => refetch()}
            columns={3}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No recipes yet
            </h2>
            <p className="text-gray-600 mb-6">
              {isOwner
                ? "Start adding recipes to this collection"
                : "This collection is empty"}
            </p>
            {isOwner && (
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Browse Recipes
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailPage;
