import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPost, likePost, bookmarkPost, deletePost } from "../services/postService";
import { useAuth } from "../context/AuthContext";
import { Clock, Eye, Heart, ArrowLeft, Tag, Edit, Bookmark, Trash2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";
import CommentSection from "../components/CommentSection";
import ImageLightbox from "../components/ImageLightbox";
import ReadingProgressBar from "../components/ReadingProgressBar";
import SEO from "../components/SEO";

const PostDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  });

  // Debug: Log post data to console
  if (post) {
    console.log("📝 Post Data:", post);
    console.log("🖼️ Media Files:", post.mediaFiles);
    console.log("📊 Media Files Count:", post.mediaFiles?.length || 0);
  }

  const likeMutation = useMutation({
    mutationFn: () => likePost(post!._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["post", slug] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (data.isLiked) {
        toast.success("❤️ You liked this post!");
      } else {
        toast.success("💔 You disliked this post");
      }
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarkPost(post!._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      if (data.isBookmarked) {
        toast.success("🔖 Post saved for later!");
      } else {
        toast.success("Removed from saved posts");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post!._id),
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      navigate("/posts");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <Link to="/posts" className="btn btn-primary">
            Back to Posts
          </Link>
        </div>
      </div>
    );
  }

  const isLiked = user && post.likes.includes(user._id);
  const canEdit =
    user && (post.author._id === user._id || user.role === "admin");

  return (
    <>
      <ReadingProgressBar />
      <SEO
        title={post.title}
        description={post.excerpt || post.content.substring(0, 160)}
        image={post.mediaFiles?.[0]?.url || post.featuredImage}
        type="article"
        author={post.author.name}
        publishedTime={post.publishedAt}
        tags={post.tags}
      />
      <div className="min-h-screen bg-base-200 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/posts" className="btn btn-ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Link>

          <div className="flex gap-2">
            {user && (
              <button
                onClick={() => bookmarkMutation.mutate()}
                disabled={bookmarkMutation.isPending}
                className="btn btn-ghost btn-sm gap-2"
                title="Save for later"
              >
                <Bookmark className="w-4 h-4" />
                Save
              </button>
            )}
            {canEdit && (
              <>
                <button
                  onClick={() => navigate(`/edit/${post._id}`)}
                  className="btn btn-primary btn-outline btn-sm gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="btn btn-error btn-outline btn-sm gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <article className="card bg-base-100 shadow-xl">
          {/* Media Gallery - Facebook Style */}
          {post.mediaFiles && post.mediaFiles.length > 0 && (
            <figure className="w-full overflow-hidden cursor-pointer">
              {post.mediaFiles.length === 1 ? (
                // Single media - full width
                <div className="w-full" onClick={() => setLightboxIndex(0)}>
                  {post.mediaFiles[0].type === "image" ? (
                    <img
                      src={post.mediaFiles[0].url}
                      alt={post.title}
                      className="w-full h-auto hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <video
                      src={post.mediaFiles[0].url}
                      controls
                      className="w-full h-auto"
                    />
                  )}
                </div>
              ) : post.mediaFiles.length === 2 ? (
                // Two media - side by side
                <div className="grid grid-cols-2 gap-2">
                  {post.mediaFiles.slice(0, 2).map((media, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden"
                      onClick={() => setLightboxIndex(idx)}
                    >
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt={`${post.title} ${idx + 1}`}
                          className="w-full h-auto hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-auto"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : post.mediaFiles.length === 3 ? (
                // Three media - 1 large + 2 stacked
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="row-span-2"
                    onClick={() => setLightboxIndex(0)}
                  >
                    {post.mediaFiles[0].type === "image" ? (
                      <img
                        src={post.mediaFiles[0].url}
                        alt={post.title}
                        className="w-full h-auto hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <video
                        src={post.mediaFiles[0].url}
                        controls
                        className="w-full h-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                  {post.mediaFiles.slice(1, 3).map((media, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden"
                      onClick={() => setLightboxIndex(idx + 1)}
                    >
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt={`${post.title} ${idx + 2}`}
                          className="w-full h-auto hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-auto"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // 4+ media - 2x2 grid
                <div className="grid grid-cols-2 gap-2 aspect-video">
                  {post.mediaFiles.slice(0, 4).map((media, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden"
                      onClick={() => setLightboxIndex(idx)}
                    >
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt={`${post.title} ${idx + 1}`}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-full object-cover"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      {idx === 3 && post.mediaFiles!.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                          <span className="text-white text-4xl font-bold">
                            +{post.mediaFiles!.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </figure>
          )}

          <div className="card-body">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{post.author.name}</p>
                  {post.publishedAt && (
                    <p className="text-sm text-base-content/60">
                      {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-base-content/60 mb-6 pb-6 border-b">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views} views
              </div>
              <button
                onClick={() => user && likeMutation.mutate()}
                disabled={!user || likeMutation.isPending}
                className={`flex items-center gap-1 ${
                  isLiked ? "text-error" : ""
                } ${
                  user
                    ? "cursor-pointer hover:text-error"
                    : "cursor-not-allowed"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {post.likes.length}
              </button>
            </div>

            {post.category && (
              <div className="mb-4">
                <span className="badge badge-primary">
                  {post.category.name}
                </span>
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-4 h-4 text-base-content/60" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="badge badge-outline">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />
          </div>
        </article>

        {/* Gallery Lightbox with Navigation */}
        {lightboxIndex !== null &&
          post.mediaFiles &&
          post.mediaFiles.length > 0 && (
            <ImageLightbox
              src={post.mediaFiles[lightboxIndex].url}
              alt={`${post.title} - Image ${lightboxIndex + 1}`}
              onClose={() => setLightboxIndex(null)}
              onPrevious={
                lightboxIndex > 0
                  ? () => setLightboxIndex(lightboxIndex - 1)
                  : undefined
              }
              onNext={
                lightboxIndex < post.mediaFiles.length - 1
                  ? () => setLightboxIndex(lightboxIndex + 1)
                  : undefined
              }
              currentIndex={lightboxIndex}
              totalImages={post.mediaFiles.length}
            />
          )}

        {/* Comments Section */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <CommentSection postId={post._id} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PostDetailPage;
