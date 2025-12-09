import express from "express";
import { searchPosts } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", searchPosts);

export default router;
