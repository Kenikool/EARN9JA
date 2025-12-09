import express from "express";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadRecipeImages,
  uploadAvatar,
  deleteImage,
} from "../controllers/uploadController.js";
import {
  uploadSingle,
  uploadMultiple,
  uploadRecipeImages as uploadRecipeMiddleware,
  uploadAvatar as uploadAvatarMiddleware,
  handleMulterError,
} from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Single image upload
router.post(
  "/single",
  protect,
  uploadSingle,
  handleMulterError,
  uploadSingleImage
);

// Multiple images upload
router.post(
  "/multiple",
  protect,
  uploadMultiple,
  handleMulterError,
  uploadMultipleImages
);

// Recipe images upload
router.post(
  "/recipe",
  protect,
  uploadRecipeMiddleware,
  handleMulterError,
  uploadRecipeImages
);

// Avatar upload
router.post(
  "/avatar",
  protect,
  uploadAvatarMiddleware,
  handleMulterError,
  uploadAvatar
);

// Delete image
router.delete("/:publicId", protect, deleteImage);

export default router;
