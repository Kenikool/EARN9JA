import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSavedPosts, likePost, bookmarkPost } from "../services/postService";
import { Bookmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import type { Post } from "../types";

const SavedPostsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedPosts, isLoading } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: getSavedPosts,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
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
        toast.success("✅ Removed from saved posts");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
            <Bookmark className="w-6 h-6 text-primary-content" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Saved Posts</h1>
            <p className="text-base-content/60">Posts you've bookmarked to read later</p>
          </div>
        </div>

        {savedPosts?.posts.length === 0 ? (
          <div className="card bg-base-100 shadow-xl border-2 border-dashed border-base-300">
            <div className="card-body text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <Bookmark className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No saved posts yet</h3>
              <p className="text-base-content/60 mb-6">
                Bookmark posts to read them later. Click the "Save" button on any post.
              </p>
              <Link to="/posts" className="btn btn-primary gap-2">
                Browse Posts
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPosts?.posts.map((post: Post) => (
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
      </div>
    </div>
  );
};

export default SavedPostsPage;
