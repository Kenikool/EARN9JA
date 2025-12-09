import { Router } from "express";
import { UploadController } from "../controllers/upload.controller.js";
import {
  upload,
  validateImageSize,
} from "../middleware/imageUpload.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Upload images via base64 (preferred method)
router.post(
  "/images/base64",
  authenticate,
  UploadController.uploadImagesBase64
);

// Upload images (with or without taskId) - legacy multipart
router.post(
  "/images",
  authenticate,
  upload.array("images", 5),
  validateImageSize,
  UploadController.uploadImages
);

// Get task images
router.get("/images/:taskId", authenticate, UploadController.getTaskImages);

// Delete image
router.delete("/images/:imageId", authenticate, UploadController.deleteImage);

export default router;
