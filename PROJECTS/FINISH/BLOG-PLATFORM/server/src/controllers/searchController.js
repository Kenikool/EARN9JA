import Post from "../models/Post.js";

// @desc    Search posts
// @route   GET /api/search
// @access  Public
export const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Text search
    const posts = await Post.find(
      {
        $text: { $search: q },
        status: "published",
      },
      { score: { $meta: "textScore" } }
    )
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({
      $text: { $search: q },
      status: "published",
    });

    res.json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalPosts: total,
      query: q,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message });
  }
};
