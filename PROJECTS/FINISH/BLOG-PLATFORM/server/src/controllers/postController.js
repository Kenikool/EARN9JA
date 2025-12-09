import Post from "../models/Post.js";
import Category from "../models/Category.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { ensureUniqueSlug } from "../utils/slugify.js";
import { calculateReadingTime, generateExcerpt } from "../utils/readingTime.js";

// @desc    Get all published posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { status: "published" };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by tag
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Sort options
    let sort = { publishedAt: -1 }; // Default: newest first

    if (req.query.sort === "popular") {
      sort = { views: -1 };
    } else if (req.query.sort === "trending") {
      sort = { likes: -1, views: -1 };
    }

    const posts = await Post.find(query)
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post by slug or ID
// @route   GET /api/posts/:slug
// @access  Public
export const getPost = async (req, res) => {
  try {
    const identifier = req.params.slug;
    let post;

    // Check if identifier is a valid MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ID
      post = await Post.findById(identifier)
        .populate("author", "name avatar bio")
        .populate("category", "name slug");
    } else {
      // It's a slug
      post = await Post.findOne({ slug: identifier })
        .populate("author", "name avatar bio")
        .populate("category", "name slug");
    }

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count only for slug access (not for edit page)
    if (!identifier.match(/^[0-9a-fA-F]{24}$/)) {
      post.views += 1;
      await post.save();
    }

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, featuredImage, mediaFiles, category, tags, status } = req.body;

    // Generate slug
    const slug = await ensureUniqueSlug(title);

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    // Generate excerpt if not provided
    const excerpt = req.body.excerpt || generateExcerpt(content);

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      mediaFiles: mediaFiles || [],
      author: req.user._id,
      category,
      tags: tags || [],
      status: status || "draft",
      readingTime,
      publishedAt: status === "published" ? new Date() : null,
    });

    // Update category post count
    if (category) {
      await Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } });
    }

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name avatar")
      .populate("category", "name slug");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const { title, content, featuredImage, mediaFiles, category, tags, status } = req.body;

    // Update slug if title changed
    if (title && title !== post.title) {
      post.slug = await ensureUniqueSlug(title, post._id);
    }

    // Update fields
    if (title) post.title = title;
    if (content) {
      post.content = content;
      post.readingTime = calculateReadingTime(content);
      post.excerpt = req.body.excerpt || generateExcerpt(content);
    }
    if (featuredImage !== undefined) post.featuredImage = featuredImage;
    if (mediaFiles !== undefined) post.mediaFiles = mediaFiles;
    if (category !== undefined) {
      // Update category post counts
      if (post.category && post.category.toString() !== category) {
        await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });
        await Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } });
      }
      post.category = category;
    }
    if (tags !== undefined) post.tags = tags;
    if (status !== undefined) {
      post.status = status;
      if (status === "published" && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    const updatedPost = await post.save();

    const populatedPost = await Post.findById(updatedPost._id)
      .populate("author", "name avatar")
      .populate("category", "name slug");

    res.json(populatedPost);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Update category post count
    if (post.category) {
      await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      isLiked: likeIndex === -1,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's posts
// @route   GET /api/posts/my/posts
// @access  Private
export const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { author: req.user._id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const posts = await Post.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Bookmark/Unbookmark post
// @route   POST /api/posts/:id/bookmark
// @access  Private
export const bookmarkPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user._id);
    const bookmarkIndex = user.savedPosts.indexOf(req.params.id);

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.savedPosts.splice(bookmarkIndex, 1);
    } else {
      // Add bookmark
      user.savedPosts.push(req.params.id);
    }

    await user.save();

    res.json({
      isBookmarked: bookmarkIndex === -1,
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    console.error("Bookmark post error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's saved posts
// @route   GET /api/posts/saved
// @access  Private
export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      populate: [
        { path: "author", select: "name avatar" },
        { path: "category", select: "name slug" },
      ],
    });

    res.json({
      posts: user.savedPosts,
      totalPosts: user.savedPosts.length,
    });
  } catch (error) {
    console.error("Get saved posts error:", error);
    res.status(500).json({ message: error.message });
  }
};
