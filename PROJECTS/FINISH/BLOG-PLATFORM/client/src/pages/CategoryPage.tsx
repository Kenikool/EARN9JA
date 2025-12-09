import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { likePost, bookmarkPost } from "../services/postService";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import type { Post } from "../types";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const response = await api.get(`/categories/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["category", slug] });
      if (data.isLiked) {
        toast.success("❤️ You liked this post!");
      } else {
        toast.success("💔 You disliked this post");
      }
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (postId: string) => bookmarkPost(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      if (data.isBookmarked) {
        toast.success("🔖 Post saved!");
      } else {
        toast.success("Removed from saved");
      }
    },
  });

  const category = categoryData?.category;
  const postsData = { posts: categoryData?.posts || [] };
  const postsLoading = categoryLoading;

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Category not found</h2>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li>
            <Link to="/">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/posts">Posts</Link>
          </li>
          <li>{category.name}</li>
        </ul>
      </div>

        {/* Category Header */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-base-content/70 text-lg">{category.description}</p>
          )}
          <div className="text-sm text-base-content/60 mt-2">
            {category.postCount} {category.postCount === 1 ? "post" : "posts"}
          </div>
        </div>
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : postsData?.posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-base-content/60">No posts in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsData?.posts.map((post: Post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={(postId) => likeMutation.mutate(postId)}
              onBookmark={(postId) => bookmarkMutation.mutate(postId)}
              isLiked={user ? post.likes.includes(user._id) : false}
              currentUserId={user?._id}
              isLiking={likeMutation.isPending}
              isBookmarking={bookmarkMutation.isPending}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CategoryPage;
