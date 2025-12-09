import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  ChefHat,
  Heart,
  ArrowLeft,
  UserPlus,
  UserMinus,
  BookOpen,
  Plus,
} from "lucide-react";
import { recipeAPI, userAPI, collectionAPI } from "../services/api";
import { RecipeGrid } from "../components/recipe/RecipeGrid";
import { LoadingPage } from "../components/common/LoadingSpinner";
import { useAuthStore } from "../stores/authStore";
import { CollectionCard } from "../components/collection/CollectionCard";
import { useCollectionStore } from "../stores/collectionStore";
import { toast } from "react-hot-toast";
import type { Recipe } from "../types/recipe";
import type { Collection } from "../types/collection";

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { deleteCollection } = useCollectionStore();

  const [activeTab, setActiveTab] = React.useState<"recipes" | "collections">(
    "recipes"
  );
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followersCount, setFollowersCount] = React.useState(0);
  const [followingCount, setFollowingCount] = React.useState(0);
  const [showCreateCollection, setShowCreateCollection] = React.useState(false);
  const [newCollectionName, setNewCollectionName] = React.useState("");

  const isOwnProfile = currentUser?._id === id;

  const {
    data: recipesData,
    isLoading: recipesLoading,
    refetch: refetchRecipes,
  } = useQuery({
    queryKey: ["userRecipes", id],
    queryFn: () =>
      id ? recipeAPI.getUserRecipes(id) : recipeAPI.getMyRecipes(),
    enabled: !!id || !!currentUser,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: collectionsData,
    isLoading: collectionsLoading,
    refetch: refetchCollections,
  } = useQuery({
    queryKey: ["userCollections", id],
    queryFn: () => collectionAPI.getUserCollections(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile", id],
    queryFn: () => userAPI.getUserProfile(id!),
    enabled: !!id && !isOwnProfile,
    staleTime: 5 * 60 * 1000,
  });

  const recipes: Recipe[] = recipesData?.data?.data || [];
  const collections: Collection[] = collectionsData?.data?.data || [];
  const profileUser = isOwnProfile
    ? currentUser
    : profileData?.data?.data?.user || currentUser;

  // Check if current user is following this profile
  React.useEffect(() => {
    if (currentUser && profileUser && !isOwnProfile) {
      const following = currentUser.following || [];
      setIsFollowing(following.includes(profileUser._id));
    }
    if (profileUser) {
      setFollowersCount(profileUser.followers?.length || 0);
      setFollowingCount(profileUser.following?.length || 0);
    }
  }, [currentUser, profileUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser || !id) {
      toast.error("Please log in to follow users");
      navigate("/login");
      return;
    }

    try {
      if (isFollowing) {
        await userAPI.unfollowUser(id);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        toast.success("Unfollowed successfully");
      } else {
        await userAPI.followUser(id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        toast.success("Following successfully");
      }
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    await deleteCollection(collectionId);
    refetchCollections();
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }

    try {
      await collectionAPI.createCollection({
        name: newCollectionName,
        isPublic: false,
      });
      setNewCollectionName("");
      setShowCreateCollection(false);
      refetchCollections();
      toast.success("Collection created!");
    } catch {
      toast.error("Failed to create collection");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view profiles
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (recipesLoading || profileLoading) {
    return <LoadingPage />;
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

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                {profileUser?.avatar ? (
                  <img
                    src={profileUser.avatar}
                    alt={profileUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-orange-600">
                    {profileUser?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User Details */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profileUser?.name}
                </h1>
                <p className="text-gray-600 mt-1">{profileUser?.email}</p>
                {profileUser?.bio && (
                  <p className="text-gray-700 mt-2">{profileUser.bio}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <React.Fragment>
                  <button
                    onClick={() => navigate("/create-recipe")}
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <ChefHat size={16} className="mr-2" />
                    Create Recipe
                  </button>
                  <button
                    onClick={() => navigate("/favorites")}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Heart size={16} className="mr-2" />
                    Favorites
                  </button>
                </React.Fragment>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {isFollowing ? (
                    <React.Fragment>
                      <UserMinus size={16} className="mr-2" />
                      Unfollow
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <UserPlus size={16} className="mr-2" />
                      Follow
                    </React.Fragment>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-6 max-w-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {recipes.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {followersCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {followingCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("recipes")}
              className={`py-4 border-b-2 font-medium ${
                activeTab === "recipes"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Recipes
            </button>
            <button
              onClick={() => setActiveTab("collections")}
              className={`py-4 border-b-2 font-medium ${
                activeTab === "collections"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Collections
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "recipes" ? (
          recipes.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isOwnProfile ? "My Recipes" : `${profileUser?.name}'s Recipes`}
              </h2>
              <RecipeGrid
                recipes={recipes}
                isLoading={recipesLoading}
                onFavoriteToggle={() => refetchRecipes()}
                columns={3}
              />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isOwnProfile ? "No recipes yet" : "No recipes found"}
              </h2>
              <p className="text-gray-600 mb-6">
                {isOwnProfile
                  ? "Start creating and sharing your favorite recipes"
                  : "This user hasn't shared any recipes yet"}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate("/create-recipe")}
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <ChefHat size={20} className="mr-2" />
                  Create Your First Recipe
                </button>
              )}
            </div>
          )
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isOwnProfile
                  ? "My Collections"
                  : `${profileUser?.name}'s Collections`}
              </h2>
              {isOwnProfile && (
                <button
                  onClick={() => setShowCreateCollection(true)}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  New Collection
                </button>
              )}
            </div>

            {collectionsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
              </div>
            ) : collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection._id}
                    collection={collection}
                    onDelete={isOwnProfile ? handleDeleteCollection : undefined}
                    showActions={isOwnProfile}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isOwnProfile ? "No collections yet" : "No collections found"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {isOwnProfile
                    ? "Create collections to organize your favorite recipes"
                    : "This user hasn't created any public collections yet"}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowCreateCollection(true)}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus size={20} className="mr-2" />
                    Create Your First Collection
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create New Collection
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Name *
              </label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Italian Favorites"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateCollection(false);
                  setNewCollectionName("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
