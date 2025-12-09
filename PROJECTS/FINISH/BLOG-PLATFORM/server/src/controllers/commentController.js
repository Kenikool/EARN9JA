import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId,
      parentComment: null 
    })
      .populate("author", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "author", select: "name avatar" },
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create comment
// @route   POST /api/posts/:postId/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    // Check if post exists
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // If replying to a comment, check if parent exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: req.params.postId,
      parentComment: parentComment || null,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name avatar");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    comment.content = req.body.content;
    const updatedComment = await comment.save();

    const populatedComment = await Comment.findById(updatedComment._id)
      .populate("author", "name avatar");

    res.json(populatedComment);
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Delete child comments (cascade)
    await Comment.deleteMany({ parentComment: comment._id });

    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: error.message });
  }
};
