import express from "express";
import {
  getCollections,
  getCollection,
  getUserCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addRecipeToCollection,
  removeRecipeFromCollection,
} from "../controllers/collectionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(protect);

router.route("/").get(getCollections).post(createCollection);

router.route("/user/:userId").get(getUserCollections);

router
  .route("/:id")
  .get(getCollection)
  .put(updateCollection)
  .delete(deleteCollection);

router.route("/:id/recipes").post(addRecipeToCollection);

router.route("/:id/recipes/:recipeId").delete(removeRecipeFromCollection);

export default router;
