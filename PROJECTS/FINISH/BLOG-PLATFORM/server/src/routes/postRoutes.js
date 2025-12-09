import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getMyPosts,
  bookmarkPost,
  getSavedPosts,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:slug", getPost);

// Protected routes
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);
router.post("/:id/bookmark", protect, bookmarkPost);
router.get("/my/posts", protect, getMyPosts);
router.get("/saved/posts", protect, getSavedPosts);

export default router;
