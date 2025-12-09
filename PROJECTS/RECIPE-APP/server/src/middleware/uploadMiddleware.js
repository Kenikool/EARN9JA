import multer from "multer";
import path from "path";

// Memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|webm/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isImage =
    allowedImageTypes.test(extname) && mimetype.startsWith("image/");
  const isVideo =
    allowedVideoTypes.test(extname) && mimetype.startsWith("video/");

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

// Upload middleware for single image
export const uploadSingle = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
}).single("image");

// Upload middleware for multiple images and videos
export const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file (for videos)
    files: 10, // Maximum 10 files
  },
  fileFilter: fileFilter,
}).array("media", 10);

// Upload middleware for recipe media (images required, video optional, up to 5 files)
export const uploadRecipeImages = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file (for videos)
    files: 5, // Maximum 5 files for recipes
  },
  fileFilter: fileFilter,
}).array("media", 5);

// Upload middleware for profile avatar
export const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
  },
  fileFilter: fileFilter,
}).single("avatar");

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Maximum size allowed is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files. Maximum 10 files allowed.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Unexpected field name for file upload.",
      });
    }
  }

  if (error.message === "Only image and video files are allowed!") {
    return res.status(400).json({
      message: error.message,
    });
  }

  next(error);
};
