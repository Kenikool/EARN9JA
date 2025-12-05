// @ts-ignore - cloudinary types may not be installed
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import TaskImage from "../models/TaskImage.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class ImageService {
  private static readonly MAX_SIZE = 1024 * 1024; // 1MB
  private static readonly MAX_WIDTH = 1200;
  private static readonly ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];

  static async compressImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(this.MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  static async uploadToCloudinary(
    buffer: Buffer,
    filename: string
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "task-images",
          resource_type: "image",
          format: "jpg",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed"));

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  static async saveTaskImage(
    taskId: string,
    url: string,
    filename: string,
    size: number,
    order: number
  ) {
    const taskImage = new TaskImage({
      taskId,
      url,
      filename,
      size,
      order,
    });

    return taskImage.save();
  }

  static async getTaskImages(taskId: string) {
    return TaskImage.find({ taskId }).sort({ order: 1 });
  }

  static async deleteTaskImage(imageId: string) {
    const image = await TaskImage.findById(imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Extract public_id from URL
    const urlParts = image.url.split("/");
    const publicIdWithExt = urlParts.slice(-2).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete from database
    await TaskImage.findByIdAndDelete(imageId);

    return { success: true };
  }

  static validateImageFormat(mimetype: string): boolean {
    const format = mimetype.split("/")[1];
    return this.ALLOWED_FORMATS.includes(format);
  }

  static validateImageSize(size: number): boolean {
    return size <= 5 * 1024 * 1024; // 5MB original size limit
  }
}
