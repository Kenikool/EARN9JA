import express from "express";
import { uploadImage, deleteImage, uploadMultiple as uploadMultipleFiles } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, uploadMultiple, handleMulterError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Upload single image/video (protected)
router.post("/image", protect, upload.single("image"), handleMulterError, uploadImage);

// Upload multiple images/videos (protected)
router.post("/multiple", protect, uploadMultiple.array("files", 10), handleMulterError, uploadMultipleFiles);

// Delete image (protected)
router.delete("/image", protect, deleteImage);

export default router;
