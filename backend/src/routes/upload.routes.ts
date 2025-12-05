import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import {
  upload,
  validateImageSize,
} from "../middleware/imageUpload.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Upload images (with or without taskId)
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
