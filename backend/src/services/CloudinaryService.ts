// @ts-ignore - cloudinary types may not be installed
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

class CloudinaryService {
  // Lazy-load credentials when needed, not in constructor
  private getCredentials() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log("🔧 Loading Cloudinary credentials:", {
      cloud_name: cloudName,
      api_key_length: apiKey?.length || 0,
      api_secret_length: apiSecret?.length || 0,
      env_keys: Object.keys(process.env).filter((k) =>
        k.includes("CLOUDINARY")
      ),
    });

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Missing Cloudinary credentials in environment variables"
      );
    }

    return { cloudName, apiKey, apiSecret };
  }

  async uploadImage(
    base64Image: string,
    folder: string = "avatars"
  ): Promise<string> {
    try {
      // Get credentials at runtime, not at module load time
      const { cloudName, apiKey, apiSecret } = this.getCredentials();

      console.log("☁️ Configuring Cloudinary with:", {
        cloud_name: cloudName,
        api_key_length: apiKey.length,
        api_secret_length: apiSecret.length,
      });

      // Configure Cloudinary with explicit credentials
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });

      console.log("📤 Uploading to folder:", `earn9ja/${folder}`);
      console.log("📏 Base64 length:", base64Image.length);

      // Different transformations based on folder
      const uploadOptions: any = {
        folder: `earn9ja/${folder}`,
        quality: "auto",
      };

      // Only apply face crop for avatars
      if (folder === "avatars") {
        uploadOptions.transformation = [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
        ];
      }

      const result: UploadApiResponse = await cloudinary.uploader.upload(
        base64Image,
        uploadOptions
      );

      console.log("✅ Cloudinary upload successful:", result.secure_url);
      return result.secure_url;
    } catch (error: any) {
      console.error("❌ Cloudinary upload error:", error);
      console.error("❌ Error details:", error.message, error.http_code);
      throw new Error(error.message || "Failed to upload image to Cloudinary");
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const { cloudName, apiKey, apiSecret } = this.getCredentials();

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
    }
  }
}

export const cloudinaryService = new CloudinaryService();
