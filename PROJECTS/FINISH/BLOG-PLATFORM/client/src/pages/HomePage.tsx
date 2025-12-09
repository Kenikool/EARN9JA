import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, likePost, bookmarkPost } from "../services/postService";
import { BookOpen, PenTool, Users, Clock, Eye, Heart, Bookmark } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import SearchBar from "../components/SearchBar";

const HomePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts({ limit: 6 }), // Limit to 6 posts on homepage
    enabled: !!user,
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

  // If user is logged in, show posts feed
  if (user) {
    return (
      <>
        {/* Welcome Header with Gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8 mb-8 border border-primary/20 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-3xl font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-base-content/70 text-lg mt-1">Ready to share your thoughts with the world?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/create" className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-all">
                <PenTool className="w-5 h-5" />
                Write Post
              </Link>
              <Link to="/posts" className="btn btn-outline btn-lg gap-2">
                <BookOpen className="w-5 h-5" />
                Browse
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Posts Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            <h2 className="text-3xl font-bold">Latest Posts</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : postsData?.posts.length === 0 ? (
          <div className="text-center py-16 bg-base-100 rounded-3xl border-2 border-dashed border-base-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <PenTool className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No posts yet</h3>
            <p className="text-base-content/60 mb-6 text-lg">Be the first to share your thoughts!</p>
            <Link to="/create" className="btn btn-primary btn-lg gap-2">
              <PenTool className="w-5 h-5" />
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData?.posts.map((post) => (
              <Link
                key={post._id}
                to={`/posts/${post.slug}`}
                className="group card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-200 hover:border-primary/30 hover:-translate-y-1"
              >
                {/* Media Grid Preview - Facebook Style */}
                {post.mediaFiles && post.mediaFiles.length > 0 ? (
                  <figure className="w-full overflow-hidden">
                    {post.mediaFiles.length === 1 ? (
                      // Single media - full width
                      <div className="w-full">
                        {post.mediaFiles[0].type === "image" ? (
                          <img
                            src={post.mediaFiles[0].url}
                            alt={post.title}
                            className="w-full h-auto group-hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <video
                            src={post.mediaFiles[0].url}
                            className="w-full h-auto"
                          />
                        )}
                      </div>
                    ) : post.mediaFiles.length === 2 ? (
                      // Two media - side by side
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
                              <video
                                src={media.url}
                                className="w-full h-auto"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : post.mediaFiles.length === 3 ? (
                      // Three media - 1 large + 2 stacked
                      <div className="grid grid-cols-2 gap-2">
                        <div className="row-span-2">
                          {post.mediaFiles[0].type === "image" ? (
                            <img
                              src={post.mediaFiles[0].url}
                              alt={post.title}
                              className="w-full h-auto group-hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <video
                              src={post.mediaFiles[0].url}
                              className="w-full h-auto"
                            />
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
                              <video
                                src={media.url}
                                className="w-full h-auto"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // 4+ media - 2x2 grid with "+X more" overlay
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
                              <video
                                src={media.url}
                                className="w-full h-auto"
                              />
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
                  // Fallback to featured image if no mediaFiles
                  <figure className="aspect-video w-full overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </figure>
                ) : (
                  // Placeholder for posts without any images
                  <figure className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 mx-auto mb-2 text-primary/40" />
                      <p className="text-sm text-base-content/40 font-medium">No Image</p>
                    </div>
                  </figure>
                )}
                <div className="card-body p-6">
                  {post.category && (
                    <div className="mb-3">
                      <span className="badge badge-primary badge-sm font-medium px-3 py-2">
                        {post.category.name}
                      </span>
                    </div>
                  )}
                  
                  <h2 className="card-title text-xl line-clamp-2 group-hover:text-primary transition-colors mb-3">
                    {post.title}
                  </h2>

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
                        if (user) {
                          likeMutation.mutate(post._id);
                        }
                      }}
                      disabled={!user || likeMutation.isPending}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                        post.likes.includes(user?._id || "")
                          ? "bg-error/20 text-error"
                          : "bg-base-200 hover:bg-error/10 hover:text-error"
                      } ${!user ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          post.likes.includes(user?._id || "") ? "fill-current" : ""
                        }`}
                      />
                      {post.likes.length}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (user) {
                          bookmarkMutation.mutate(post._id);
                        }
                      }}
                      disabled={!user || bookmarkMutation.isPending}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors bg-base-200 hover:bg-primary/10 hover:text-primary ${!user ? "cursor-not-allowed" : "cursor-pointer"}`}
                      title="Save for later"
                    >
                      <Bookmark className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* View All Posts Button */}
        {postsData && postsData.posts.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/posts" className="btn btn-primary btn-lg gap-2">
              <BookOpen className="w-5 h-5" />
              View All Posts
            </Link>
          </div>
        )}
      </>
    );
  }

  // Landing page for non-logged in users
  return (
    <div className="min-h-screen">
      {/* Hero Section with Modern Gradient */}
      <div className="hero min-h-[80vh] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="hero-content text-center relative z-10">
          <div className="max-w-4xl">
            {/* Logo/Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform">
                <PenTool className="w-12 h-12 text-primary-content" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Share Your Story
              </span>
              <br />
              <span className="text-base-content">With The World</span>
            </h1>

            <p className="text-xl md:text-2xl text-base-content/70 mb-10 leading-relaxed max-w-2xl mx-auto">
              Join our vibrant community of writers and readers. Create, discover, and engage with amazing content.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-10">
              <SearchBar />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/register" className="btn btn-primary btn-lg gap-2 shadow-xl hover:shadow-2xl transition-all text-lg px-8">
                <Users className="w-5 h-5" />
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg gap-2 text-lg px-8">
                Sign In
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="card-body items-center text-center p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <PenTool className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="card-title text-2xl mb-2">Write</h3>
                  <p className="text-base-content/70">
                    Create beautiful posts with our powerful rich text editor and media support
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="card-body items-center text-center p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="card-title text-2xl mb-2">Discover</h3>
                  <p className="text-base-content/70">
                    Explore diverse content from talented writers across the globe
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="card-body items-center text-center p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="card-title text-2xl mb-2">Connect</h3>
                  <p className="text-base-content/70">
                    Engage with authors through comments, likes, and meaningful discussions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats/Social Proof Section */}
      <div className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-xl text-base-content/70">Thousands of writers and readers trust our platform</p>
          </div>
          
          <div className="stats stats-vertical lg:stats-horizontal shadow-2xl w-full max-w-4xl mx-auto border border-base-200">
            <div className="stat place-items-center">
              <div className="stat-figure text-primary">
                <BookOpen className="w-10 h-10" />
              </div>
              <div className="stat-title text-lg">Published Posts</div>
              <div className="stat-value text-primary text-5xl">10K+</div>
              <div className="stat-desc text-base">Stories shared</div>
            </div>
            
            <div className="stat place-items-center">
              <div className="stat-figure text-secondary">
                <Users className="w-10 h-10" />
              </div>
              <div className="stat-title text-lg">Active Writers</div>
              <div className="stat-value text-secondary text-5xl">500+</div>
              <div className="stat-desc text-base">Creative minds</div>
            </div>
            
            <div className="stat place-items-center">
              <div className="stat-figure text-accent">
                <Heart className="w-10 h-10" />
              </div>
              <div className="stat-title text-lg">Monthly Readers</div>
              <div className="stat-value text-accent text-5xl">50K+</div>
              <div className="stat-desc text-base">Engaged audience</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
