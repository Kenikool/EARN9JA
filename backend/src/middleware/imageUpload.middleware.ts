import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ImageService } from "../services/ImageService.js";

const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!ImageService.validateImageFormat(file.mimetype)) {
    cb(new Error("Invalid file format. Only JPG, PNG, and WebP are allowed."));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Max 5 files
  },
});

export const validateImageSize = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file && !req.files) {
    return res.status(400).json({ error: "No image file provided" });
  }

  const files = (req.files as Express.Multer.File[]) || [
    req.file as Express.Multer.File,
  ];

  for (const file of files) {
    if (!ImageService.validateImageSize(file.size)) {
      return res.status(400).json({
        error: `File ${file.originalname} exceeds 5MB limit`,
      });
    }
  }

  next();
};
