import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updatePost, deletePost } from "../services/postService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import api from "../services/api";
import type { Category } from "../types";

const EditPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post-edit", id],
    queryFn: async () => {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<Category[]>("/categories");
      return response.data;
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // Initialize form when post data loads
  if (post && !title) {
    setTitle(post.title);
    setContent(post.content);
    setExcerpt(post.excerpt || "");
    setFeaturedImage(post.featuredImage || "");
    setCategory(post.category?._id || "");
    setTags(post.tags.join(", "));
    setStatus(post.status);
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updatePost(id!, {
        title,
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        category: category || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        status,
      }),
    onSuccess: (data) => {
      toast.success("Post updated successfully! Reading time recalculated.");
      navigate(`/posts/${data.slug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update post");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id!),
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      navigate("/posts");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFeaturedImage(response.data.url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      handleImageUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    updateMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (postLoading) {
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
          <button onClick={() => navigate("/posts")} className="btn btn-primary">
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  if (!user || (post.author._id !== user._id && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Not authorized</h2>
          <p className="mb-4">You don't have permission to edit this post</p>
          <button onClick={() => navigate("/posts")} className="btn btn-primary">
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="btn btn-ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <button onClick={handleDelete} className="btn btn-error btn-outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Title *</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Content *</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here... (HTML supported)"
                  className="textarea textarea-bordered w-full"
                  rows={15}
                  required
                />
                <label className="label">
                  <span className="label-text-alt">You can use HTML tags for formatting</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Excerpt (optional)</span>
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of your post"
                  className="textarea textarea-bordered h-24"
                  maxLength={300}
                />
                <label className="label">
                  <span className="label-text-alt">{excerpt.length}/300 characters</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Featured Image (optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered w-full"
                  disabled={uploadingImage}
                />
                <label className="label">
                  <span className="label-text-alt">Max size: 5MB. Supported: JPG, PNG, GIF</span>
                </label>
                {uploadingImage && (
                  <div className="mt-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="ml-2 text-sm">Uploading image...</span>
                  </div>
                )}
                {featuredImage && !uploadingImage && (
                  <div className="mt-2">
                    <img src={featuredImage} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Category (optional)</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="select select-bordered w-full"
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? "Loading categories..." : "Select a category"}
                  </option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Tags (optional)</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="javascript, react, tutorial (comma separated)"
                  className="input input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt">Separate tags with commas</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Status</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="status"
                      className="radio radio-primary"
                      checked={status === "draft"}
                      onChange={() => setStatus("draft")}
                    />
                    <span className="label-text">Save as Draft</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="status"
                      className="radio radio-primary"
                      checked={status === "published"}
                      onChange={() => setStatus("published")}
                    />
                    <span className="label-text">Publish Now</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className={`btn btn-primary flex-1 ${updateMutation.isPending ? "loading" : ""}`}
                  disabled={updateMutation.isPending}
                >
                  {!updateMutation.isPending && <Save className="w-4 h-4 mr-2" />}
                  Update Post
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
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

export default EditPostPage;
