import fs from "fs";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, "blog-platform/images");

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Image uploaded successfully",
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload multiple images/videos to Cloudinary
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadPromises = req.files.map(async (file) => {
      const folder = file.mimetype.startsWith('video/') 
        ? "blog-platform/videos" 
        : "blog-platform/images";
      
      const result = await uploadToCloudinary(file.path, folder);
      
      // Delete temporary file
      fs.unlinkSync(file.path);
      
      return {
        url: result.url,
        publicId: result.publicId,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      };
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      message: "Files uploaded successfully",
      files: results,
    });
  } catch (error) {
    // Clean up temporary files if they exist
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: "Public ID is required" });
    }

    await deleteFromCloudinary(publicId);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
