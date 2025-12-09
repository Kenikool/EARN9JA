import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPost } from "../services/postService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import api from "../services/api";
import type { Category, MediaFile } from "../types";
import MediaUploader from "../components/MediaUploader";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<Category[]>("/categories");
      return response.data;
    },
  });

  if (categoriesError) {
    console.error("Categories error:", categoriesError);
  }

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      toast.success("Post created successfully!");
      navigate(`/posts/${data.slug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    createMutation.mutate({
      title,
      content,
      excerpt: excerpt || undefined,
      featuredImage: featuredImage || undefined,
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
      category: category || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      status,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to create a post</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 py-4 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-ghost btn-sm md:btn-md gap-2 mb-3 md:mb-4 hover:bg-base-200"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-3 md:gap-4 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Save className="w-5 h-5 md:w-6 md:h-6 text-primary-content" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent break-words">
                Create New Post
              </h1>
              <p className="text-base-content/60 text-sm md:text-lg mt-1">Share your story with the world</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Main Content Card */}
          <div className="card bg-base-100 shadow-2xl border border-base-200">
            <div className="card-body space-y-4 md:space-y-6 p-4 sm:p-6 md:p-8">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base md:text-lg flex items-center gap-2 flex-wrap">
                    Title
                    <span className="badge badge-error badge-sm">Required</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an engaging title..."
                  className="input input-bordered md:input-lg w-full focus:input-primary transition-all"
                  required
                />
              </div>

              {/* Content - Simple Textarea for now */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base md:text-lg flex items-center gap-2 flex-wrap">
                    Content
                    <span className="badge badge-error badge-sm">Required</span>
                  </span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here... (HTML supported)"
                  className="textarea textarea-bordered w-full text-sm md:text-base leading-relaxed focus:textarea-primary transition-all"
                  rows={12}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60 text-xs">
                    💡 Tip: Use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt; for formatting
                  </span>
                </label>
              </div>

              {/* Excerpt */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base md:text-lg">Excerpt</span>
                  <span className="label-text-alt text-base-content/60 text-xs">{excerpt.length}/300</span>
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary (shown in previews)"
                  className="textarea textarea-bordered h-24 md:h-28 text-sm md:text-base focus:textarea-primary transition-all"
                  maxLength={300}
                />
              </div>

              {/* Media Upload - Multiple Files */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base md:text-lg">Media Files (Images & Videos)</span>
                </label>
                <MediaUploader 
                  onFilesUploaded={(files) => {
                    setMediaFiles(files);
                    // Set first image as featured image if not already set
                    if (!featuredImage && files.length > 0 && files[0].type === "image") {
                      setFeaturedImage(files[0].url);
                    }
                  }}
                  maxFiles={10}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60 text-xs">
                    📸 Upload up to 10 images/videos • First image will be the featured image
                  </span>
                </label>
              </div>

              {/* Category & Tags Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Category */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base md:text-lg">Category</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select select-bordered md:select-lg w-full focus:select-primary transition-all"
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? "Loading..." : "Choose a category"}
                    </option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categoriesError && (
                    <label className="label">
                      <span className="label-text-alt text-error text-xs">⚠️ Failed to load</span>
                    </label>
                  )}
                </div>

                {/* Tags */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base md:text-lg">Tags</span>
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="javascript, react, tutorial"
                    className="input input-bordered md:input-lg w-full focus:input-primary transition-all"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60 text-xs">🏷️ Separate with commas</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base md:text-lg">Publication Status</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 bg-base-200/50 p-3 md:p-4 rounded-xl">
                  <label className="label cursor-pointer gap-2 md:gap-3 flex-1 bg-base-100 p-3 md:p-4 rounded-lg border-2 border-base-300 hover:border-primary transition-all">
                    <input
                      type="radio"
                      name="status"
                      className="radio radio-primary radio-sm md:radio-md"
                      checked={status === "draft"}
                      onChange={() => setStatus("draft")}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="label-text font-semibold text-sm md:text-base block">Save as Draft</span>
                      <p className="text-xs text-base-content/60 mt-1">Keep private, publish later</p>
                    </div>
                  </label>
                  <label className="label cursor-pointer gap-2 md:gap-3 flex-1 bg-base-100 p-3 md:p-4 rounded-lg border-2 border-base-300 hover:border-primary transition-all">
                    <input
                      type="radio"
                      name="status"
                      className="radio radio-primary radio-sm md:radio-md"
                      checked={status === "published"}
                      onChange={() => setStatus("published")}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="label-text font-semibold text-sm md:text-base block">Publish Now</span>
                      <p className="text-xs text-base-content/60 mt-1">Make it live immediately</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="divider my-2 md:my-0"></div>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                <button
                  type="submit"
                  className={`btn btn-primary md:btn-lg flex-1 gap-2 shadow-lg hover:shadow-xl transition-all ${createMutation.isPending ? "loading" : ""}`}
                  disabled={createMutation.isPending}
                >
                  {!createMutation.isPending && <Save className="w-4 h-4 md:w-5 md:h-5" />}
                  <span className="text-sm md:text-base">
                    {createMutation.isPending 
                      ? "Processing..." 
                      : status === "published" 
                      ? "🚀 Publish Post" 
                      : "💾 Save Draft"}
                  </span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline md:btn-lg gap-2" 
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
