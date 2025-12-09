import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getPosts, likePost, bookmarkPost } from "../services/postService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";

const PostsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">All Posts</h1>
        <p className="text-base-content/60">
          Discover amazing stories from our community
        </p>
      </div>

      {data?.posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-base-content/60">No posts yet. Be the first to write!</p>
          <Link to="/create" className="btn btn-primary mt-4">
            Create Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.posts.map((post) => (
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

      {data && data.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`join-item btn ${page === data.currentPage ? "btn-active" : ""}`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PostsPage;
