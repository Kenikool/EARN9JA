import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../services/postService";
import { PenTool, BookOpen, Eye, Heart, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";

const DashboardPage = () => {
  const { user } = useAuth();

  // Get user's posts
  const { data: userPosts, isLoading } = useQuery({
    queryKey: ["user-posts", user?._id],
    queryFn: () => getPosts({ author: user?._id }),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to view your dashboard</p>
      </div>
    );
  }

  const totalViews = userPosts?.posts.reduce((sum, post) => sum + post.views, 0) || 0;
  const totalLikes = userPosts?.posts.reduce((sum, post) => sum + post.likes.length, 0) || 0;
  const publishedPosts = userPosts?.posts.filter(p => p.status === "published").length || 0;
  const draftPosts = userPosts?.posts.filter(p => p.status === "draft").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
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
                  Welcome, {user.name}!
                </h1>
                <p className="text-base-content/70 text-lg mt-1">Your personal dashboard</p>
              </div>
            </div>
            <Link to="/create" className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-all">
              <PenTool className="w-5 h-5" />
              Write New Post
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold text-primary">{userPosts?.totalPosts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-xs text-base-content/60 mt-2">
                {publishedPosts} published • {draftPosts} drafts
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60 text-sm">Total Views</p>
                  <p className="text-3xl font-bold text-secondary">{totalViews}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="text-xs text-base-content/60 mt-2">
                Across all your posts
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60 text-sm">Total Likes</p>
                  <p className="text-3xl font-bold text-accent">{totalLikes}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-xs text-base-content/60 mt-2">
                Community engagement
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60 text-sm">Avg. Views</p>
                  <p className="text-3xl font-bold text-info">
                    {userPosts?.totalPosts ? Math.round(totalViews / userPosts.totalPosts) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-info" />
                </div>
              </div>
              <div className="text-xs text-base-content/60 mt-2">
                Per post average
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/create" className="card bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-xl transition-all border border-primary/20">
            <div className="card-body items-center text-center">
              <PenTool className="w-12 h-12 text-primary mb-2" />
              <h3 className="card-title text-lg">Create Post</h3>
              <p className="text-sm text-base-content/70">Write a new blog post</p>
            </div>
          </Link>

          <Link to="/posts" className="card bg-gradient-to-br from-secondary/10 to-secondary/5 hover:shadow-xl transition-all border border-secondary/20">
            <div className="card-body items-center text-center">
              <BookOpen className="w-12 h-12 text-secondary mb-2" />
              <h3 className="card-title text-lg">My Posts</h3>
              <p className="text-sm text-base-content/70">View all your posts</p>
            </div>
          </Link>

          <Link to="/profile" className="card bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-xl transition-all border border-accent/20">
            <div className="card-body items-center text-center">
              <div className="avatar mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/70 text-accent-content flex items-center justify-center text-xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h3 className="card-title text-lg">Profile</h3>
              <p className="text-sm text-base-content/70">Edit your profile</p>
            </div>
          </Link>
        </div>

        {/* Recent Posts */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-2xl">Your Recent Posts</h2>
              <Link to="/posts" className="btn btn-ghost btn-sm">
                View All →
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : userPosts?.posts.length === 0 ? (
              <div className="text-center py-12">
                <PenTool className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-lg text-base-content/60 mb-4">You haven't created any posts yet</p>
                <Link to="/create" className="btn btn-primary">
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPosts?.posts.slice(0, 5).map((post) => (
                      <tr key={post._id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            {post.mediaFiles && post.mediaFiles.length > 0 ? (
                              <div className="avatar">
                                <div className="w-12 h-12 rounded">
                                  <img src={post.mediaFiles[0].url} alt={post.title} />
                                </div>
                              </div>
                            ) : post.featuredImage ? (
                              <div className="avatar">
                                <div className="w-12 h-12 rounded">
                                  <img src={post.featuredImage} alt={post.title} />
                                </div>
                              </div>
                            ) : null}
                            <div>
                              <div className="font-bold line-clamp-1">{post.title}</div>
                              <div className="text-sm opacity-50 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.readingTime}m read
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${post.status === "published" ? "badge-success" : "badge-warning"}`}>
                            {post.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes.length}
                          </div>
                        </td>
                        <td>
                          {post.publishedAt
                            ? format(new Date(post.publishedAt), "MMM d, yyyy")
                            : format(new Date(post.createdAt), "MMM d, yyyy")}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Link to={`/posts/${post.slug}`} className="btn btn-ghost btn-xs">
                              View
                            </Link>
                            <Link to={`/edit/${post._id}`} className="btn btn-ghost btn-xs">
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
