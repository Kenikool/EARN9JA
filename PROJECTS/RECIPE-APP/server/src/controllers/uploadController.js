import cloudinary from "../config/cloudinary.js";

// Upload single image to Cloudinary
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image file provided",
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "recipe-app/general",
      resource_type: "auto",
    });

    res.status(200).json({
      status: "success",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

// Upload multiple images and videos to Cloudinary
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No media files provided",
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      return cloudinary.uploader.upload(dataURI, {
        folder: "recipe-app/general",
        resource_type: "auto",
      });
    });

    const results = await Promise.all(uploadPromises);

    const media = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      type: result.resource_type,
    }));

    res.status(200).json({
      status: "success",
      data: {
        media,
        count: media.length,
      },
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({
      message: "Media upload failed",
      error: error.message,
    });
  }
};

// Upload recipe media (images required, video optional)
export const uploadRecipeImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No recipe media provided",
      });
    }

    // Check if at least one image is present
    const hasImage = req.files.some((file) =>
      file.mimetype.startsWith("image/")
    );
    if (!hasImage) {
      return res.status(400).json({
        message: "At least one image is required for recipes",
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const isVideo = file.mimetype.startsWith("video/");

      return cloudinary.uploader.upload(dataURI, {
        folder: "recipe-app/recipes",
        resource_type: "auto",
        transformation: isVideo
          ? []
          : [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }],
      });
    });

    const results = await Promise.all(uploadPromises);

    const media = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      type: result.resource_type,
    }));

    res.status(200).json({
      status: "success",
      data: {
        media,
        count: media.length,
      },
    });
  } catch (error) {
    console.error("Recipe upload error:", error);
    res.status(500).json({
      message: "Recipe media upload failed",
      error: error.message,
    });
  }
};

// Upload user avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No avatar image provided",
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary with avatar-specific settings
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "recipe-app/avatars",
      resource_type: "auto",
      transformation: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
        { quality: "auto" },
      ],
    });

    res.status(200).json({
      status: "success",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({
      message: "Avatar upload failed",
      error: error.message,
    });
  }
};

// Delete image from Cloudinary
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        message: "Public ID is required",
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      message: "Image deletion failed",
      error: error.message,
    });
  }
};
