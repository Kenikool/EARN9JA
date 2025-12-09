import { Link } from "react-router-dom";
import { Clock, Eye, Heart, Bookmark, BookOpen } from "lucide-react";
import { format } from "date-fns";
import type { Post } from "../types";

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  isLiked?: boolean;
  currentUserId?: string;
  isLiking?: boolean;
  isBookmarking?: boolean;
}

const PostCard = ({
  post,
  onLike,
  onBookmark,
  isLiked,
  currentUserId,
  isLiking,
  isBookmarking,
}: PostCardProps) => {
  return (
    <div className="group card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-200 hover:border-primary/30 hover:-translate-y-1">
      <Link to={`/posts/${post.slug}`}>
        {/* Media Grid Preview - Facebook Style */}
        {post.mediaFiles && post.mediaFiles.length > 0 ? (
          <figure className="w-full overflow-hidden">
            {post.mediaFiles.length === 1 ? (
              <div className="w-full">
                {post.mediaFiles[0].type === "image" ? (
                  <img
                    src={post.mediaFiles[0].url}
                    alt={post.title}
                    className="w-full h-auto group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <video src={post.mediaFiles[0].url} className="w-full h-auto" />
                )}
              </div>
            ) : post.mediaFiles.length === 2 ? (
              <div className="grid grid-cols-2 gap-2">
                {post.mediaFiles.slice(0, 2).map((media, idx) => (
                  <div key={idx} className="relative overflow-hidden">
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={`${post.title} ${idx + 1}`}
                        className="w-full h-auto group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <video src={media.url} className="w-full h-auto" />
                    )}
                  </div>
                ))}
              </div>
            ) : post.mediaFiles.length === 3 ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="row-span-2">
                  {post.mediaFiles[0].type === "image" ? (
                    <img
                      src={post.mediaFiles[0].url}
                      alt={post.title}
                      className="w-full h-auto group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <video src={post.mediaFiles[0].url} className="w-full h-auto" />
                  )}
                </div>
                {post.mediaFiles.slice(1, 3).map((media, idx) => (
                  <div key={idx} className="relative overflow-hidden">
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={`${post.title} ${idx + 2}`}
                        className="w-full h-auto group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <video src={media.url} className="w-full h-auto" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.mediaFiles.slice(0, 4).map((media, idx) => (
                  <div key={idx} className="relative overflow-hidden">
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={`${post.title} ${idx + 1}`}
                        className="w-full h-auto group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <video src={media.url} className="w-full h-auto" />
                    )}
                    {idx === 3 && post.mediaFiles!.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          +{post.mediaFiles!.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </figure>
        ) : post.featuredImage ? (
          <figure className="aspect-video w-full overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </figure>
        ) : (
          // Placeholder for posts without any images
          <figure className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <BookOpen className="w-16 h-16 mx-auto mb-3 text-primary/40" />
                <p className="text-sm text-base-content/40 font-medium">No Image</p>
              </div>
            </div>
          </figure>
        )}
      </Link>

      <div className="card-body p-6">
        {post.category && (
          <div className="mb-3">
            <span className="badge badge-primary badge-sm font-medium px-3 py-2">
              {post.category.name}
            </span>
          </div>
        )}

        <Link to={`/posts/${post.slug}`}>
          <h2 className="card-title text-xl line-clamp-2 group-hover:text-primary transition-colors mb-3">
            {post.title}
          </h2>
        </Link>

        <p className="text-base-content/70 line-clamp-3 mb-4 leading-relaxed">
          {post.excerpt || ""}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-base-200">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-sm font-semibold">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">{post.author.name}</p>
              {post.publishedAt && (
                <p className="text-xs text-base-content/60">
                  {format(new Date(post.publishedAt), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 text-xs text-base-content/60 flex-wrap">
          <span className="flex items-center gap-1 bg-base-200 px-3 py-1.5 rounded-full">
            <Clock className="w-3 h-3" />
            {post.readingTime}m
          </span>
          <span className="flex items-center gap-1 bg-base-200 px-3 py-1.5 rounded-full">
            <Eye className="w-3 h-3" />
            {post.views}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onLike && currentUserId) {
                onLike(post._id);
              }
            }}
            disabled={!currentUserId || isLiking}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
              isLiked
                ? "bg-error/20 text-error"
                : "bg-base-200 hover:bg-error/10 hover:text-error"
            } ${!currentUserId ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Heart className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} />
            {post.likes.length}
          </button>
          {onBookmark && currentUserId && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmark(post._id);
              }}
              disabled={isBookmarking}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors bg-base-200 hover:bg-primary/10 hover:text-primary cursor-pointer"
              title="Save for later"
            >
              <Bookmark className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
