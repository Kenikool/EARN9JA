import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Mail, Edit2, Save, X, Clock, Eye, Heart, Calendar, FileText, PenTool } from "lucide-react";
import { format } from "date-fns";
import api from "../services/api";
import toast from "react-hot-toast";
import type { Post } from "../types";
import ImageLightbox from "../components/ImageLightbox";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");
  const [showAvatarLightbox, setShowAvatarLightbox] = useState(false);

  const { data: myPosts, isLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn: async () => {
      const response = await api.get("/posts/my/posts");
      return response.data;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; bio: string; avatar?: string }) => {
      const response = await api.put("/auth/profile", data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAvatar(response.data.url);
      toast.success("Avatar uploaded! Click Save to update your profile.");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      handleAvatarUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, bio, avatar });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-xl mb-4">Please login to view your profile</p>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const publishedPosts = myPosts?.posts.filter((p: Post) => p.status === "published") || [];
  const draftPosts = myPosts?.posts.filter((p: Post) => p.status === "draft") || [];
  
  const totalViews = myPosts?.posts.reduce((sum: number, post: Post) => sum + post.views, 0) || 0;
  const totalLikes = myPosts?.posts.reduce((sum: number, post: Post) => sum + post.likes.length, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <div className="card bg-base-100 shadow-2xl border border-base-200 overflow-hidden">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-primary via-secondary to-accent"></div>
              
              <div className="card-body relative -mt-16">
                <div className="flex justify-end mb-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary btn-sm gap-2 shadow-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="flex flex-col items-center -mt-8">
                  <div className="avatar mb-4 relative group">
                    <div 
                      className="w-32 h-32 rounded-full ring-4 ring-base-100 shadow-xl cursor-pointer"
                      onClick={() => {
                        if ((avatar || user.avatar) && !isEditing) {
                          setShowAvatarLightbox(true);
                        }
                      }}
                    >
                      {avatar || user.avatar ? (
                        <img src={avatar || user.avatar} alt={user.name} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-4xl font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="text-center">
                          <Edit2 className="w-8 h-8 text-white mx-auto mb-1" />
                          <span className="text-white text-xs font-semibold">Change</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                      </label>
                    )}
                  </div>
                  {uploadingAvatar && (
                    <div className="text-sm text-base-content/60 mb-4 flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                      <span className="loading loading-spinner loading-sm"></span>
                      Uploading avatar...
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="w-full space-y-5 mt-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Profile Picture</span>
                        </label>
                        <label className="btn btn-outline btn-sm w-full gap-2 hover:btn-primary">
                          <Edit2 className="w-4 h-4" />
                          Change Avatar
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            disabled={uploadingAvatar}
                          />
                        </label>
                        <label className="label">
                          <span className="label-text-alt text-base-content/60">Max 5MB • JPG, PNG, GIF</span>
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Name</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input input-bordered focus:input-primary"
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Bio</span>
                          <span className="label-text-alt text-base-content/60">{bio.length}/500</span>
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="textarea textarea-bordered h-28 focus:textarea-primary"
                          placeholder="Tell us about yourself..."
                          maxLength={500}
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="btn btn-primary flex-1 gap-2 shadow-lg"
                          disabled={updateProfileMutation.isPending || uploadingAvatar}
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setName(user.name);
                            setBio(user.bio || "");
                            setAvatar(user.avatar || "");
                          }}
                          className="btn btn-ghost gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold mb-2 text-center">{user.name}</h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-base-content/60 mb-4">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {user.bio ? (
                        <p className="text-sm text-center text-base-content/70 leading-relaxed px-4">{user.bio}</p>
                      ) : (
                        <p className="text-sm text-center text-base-content/40 italic">No bio yet</p>
                      )}
                      <div className="flex items-center justify-center gap-2 text-xs text-base-content/50 mt-4">
                        <Calendar className="w-3 h-3" />
                        Joined {format(new Date(user.createdAt || Date.now()), "MMMM yyyy")}
                      </div>
                    </>
                  )}
                </div>

                <div className="divider my-2"></div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <div className="stat-figure text-primary">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-xs">Published</div>
                    <div className="stat-value text-primary text-3xl">{publishedPosts.length}</div>
                  </div>
                  <div className="stat bg-secondary/5 rounded-xl p-4 border border-secondary/20">
                    <div className="stat-figure text-secondary">
                      <PenTool className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-xs">Drafts</div>
                    <div className="stat-value text-secondary text-3xl">{draftPosts.length}</div>
                  </div>
                  <div className="stat bg-accent/5 rounded-xl p-4 border border-accent/20">
                    <div className="stat-figure text-accent">
                      <Eye className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-xs">Total Views</div>
                    <div className="stat-value text-accent text-3xl">{totalViews}</div>
                  </div>
                  <div className="stat bg-error/5 rounded-xl p-4 border border-error/20">
                    <div className="stat-figure text-error">
                      <Heart className="w-8 h-8" />
                    </div>
                    <div className="stat-title text-xs">Total Likes</div>
                    <div className="stat-value text-error text-3xl">{totalLikes}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="lg:col-span-2">
            {/* Header with Tabs */}
            <div className="card bg-base-100 shadow-2xl border border-base-200 mb-6">
              <div className="card-body p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">My Posts</h2>
                  <Link to="/create" className="btn btn-primary btn-sm gap-2">
                    <PenTool className="w-4 h-4" />
                    New Post
                  </Link>
                </div>
                
                <div className="tabs tabs-boxed bg-base-200 p-1">
                  <button
                    onClick={() => setActiveTab("published")}
                    className={`tab gap-2 ${activeTab === "published" ? "tab-active" : ""}`}
                  >
                    <FileText className="w-4 h-4" />
                    Published ({publishedPosts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("drafts")}
                    className={`tab gap-2 ${activeTab === "drafts" ? "tab-active" : ""}`}
                  >
                    <PenTool className="w-4 h-4" />
                    Drafts ({draftPosts.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Posts List */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === "published" ? (
                  publishedPosts.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl border-2 border-dashed border-base-300">
                      <div className="card-body text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                          <FileText className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No published posts yet</h3>
                        <p className="text-base-content/60 mb-6">Share your first story with the world!</p>
                        <Link to="/create" className="btn btn-primary gap-2">
                          <PenTool className="w-5 h-5" />
                          Create Your First Post
                        </Link>
                      </div>
                    </div>
                  ) : (
                    publishedPosts.map((post: Post) => (
                      <div key={post._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200 hover:border-primary/30">
                        <div className="card-body">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <Link to={`/posts/${post.slug}`} className="card-title text-lg hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </Link>
                              {post.excerpt && (
                                <p className="text-sm text-base-content/70 line-clamp-2 mt-2 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 mt-4">
                                <span className="flex items-center gap-1 text-xs bg-base-200 px-3 py-1.5 rounded-full">
                                  <Clock className="w-3 h-3" />
                                  {post.readingTime}m
                                </span>
                                <span className="flex items-center gap-1 text-xs bg-base-200 px-3 py-1.5 rounded-full">
                                  <Eye className="w-3 h-3" />
                                  {post.views}
                                </span>
                                <span className="flex items-center gap-1 text-xs bg-base-200 px-3 py-1.5 rounded-full">
                                  <Heart className="w-3 h-3" />
                                  {post.likes.length}
                                </span>
                                {post.publishedAt && (
                                  <span className="flex items-center gap-1 text-xs text-base-content/60">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(post.publishedAt), "MMM d, yyyy")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link to={`/edit/${post._id}`} className="btn btn-ghost btn-sm btn-square">
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  draftPosts.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl border-2 border-dashed border-base-300">
                      <div className="card-body text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full flex items-center justify-center">
                          <PenTool className="w-10 h-10 text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No drafts</h3>
                        <p className="text-base-content/60 mb-6">All your posts are published!</p>
                      </div>
                    </div>
                  ) : (
                    draftPosts.map((post: Post) => (
                      <div key={post._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200 hover:border-secondary/30">
                        <div className="card-body">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-warning badge-sm">Draft</span>
                              </div>
                              <Link to={`/edit/${post._id}`} className="card-title text-lg hover:text-secondary transition-colors line-clamp-2">
                                {post.title}
                              </Link>
                              {post.excerpt && (
                                <p className="text-sm text-base-content/70 line-clamp-2 mt-2 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 mt-4">
                                <span className="flex items-center gap-1 text-xs bg-base-200 px-3 py-1.5 rounded-full">
                                  <Clock className="w-3 h-3" />
                                  {post.readingTime}m
                                </span>
                                <span className="flex items-center gap-1 text-xs text-base-content/60">
                                  <Calendar className="w-3 h-3" />
                                  Updated {format(new Date(post.updatedAt || post.createdAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </div>
                            <Link to={`/edit/${post._id}`} className="btn btn-secondary btn-sm gap-2">
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Avatar Lightbox */}
      {showAvatarLightbox && (avatar || user.avatar) && (
        <ImageLightbox
          src={avatar || user.avatar || ""}
          alt={`${user.name}'s profile picture`}
          onClose={() => setShowAvatarLightbox(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
