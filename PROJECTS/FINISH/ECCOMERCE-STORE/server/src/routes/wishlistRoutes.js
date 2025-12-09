import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/")
  .get(authenticate, getWishlist)
  .post(authenticate, addToWishlist)
  .delete(authenticate, clearWishlist);

router.route("/:productId").delete(authenticate, removeFromWishlist);

export default router;
