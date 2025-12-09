import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { searchPosts } from "../services/searchService";
import { Search, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { likePost, bookmarkPost } from "../services/postService";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import type { Post } from "../types";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, page],
    queryFn: () => searchPosts(query, page),
    enabled: !!query,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["search", query, page] });
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

  if (!query) {
    return (
      <>
        <Link to="/" className="btn btn-ghost mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
          <h2 className="text-2xl font-bold mb-2">No search query</h2>
          <p className="text-base-content/60">Please enter a search term</p>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      <Link to="/" className="btn btn-ghost mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-base-content/60">
          Found {data?.totalPosts || 0} result{data?.totalPosts !== 1 ? "s" : ""} for "
          <span className="font-semibold">{query}</span>"
        </p>
      </div>

      {data?.posts && data.posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.posts.map((post: Post) => (
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

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                {page > 1 && (
                  <Link
                    to={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                    className="join-item btn"
                  >
                    «
                  </Link>
                )}

                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === data.totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <Link
                        key={pageNum}
                        to={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
                        className={`join-item btn ${pageNum === page ? "btn-active" : ""}`}
                      >
                        {pageNum}
                      </Link>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <button key={pageNum} className="join-item btn btn-disabled">
                        ...
                      </button>
                    );
                  }
                  return null;
                })}

                {page < data.totalPages && (
                  <Link
                    to={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="join-item btn"
                  >
                    »
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
          <h2 className="text-2xl font-bold mb-2">No results found</h2>
          <p className="text-base-content/60">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      )}
    </>
  );
};

export default SearchResultsPage;
