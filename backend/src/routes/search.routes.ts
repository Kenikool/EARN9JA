import express from "express";
import searchController from "../controllers/search.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Global search (admin only)
router.get(
  "/",
  authenticate,
  requireRole("admin"),
  searchController.globalSearch
);

export default router;
