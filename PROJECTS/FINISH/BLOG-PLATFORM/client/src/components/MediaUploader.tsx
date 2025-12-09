import { useState } from "react";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

interface MediaFile {
  url: string;
  type: "image" | "video";
  publicId: string;
}

interface MediaUploaderProps {
  onFilesUploaded: (files: MediaFile[]) => void;
  maxFiles?: number;
}

const MediaUploader = ({ onFilesUploaded, maxFiles = 10 }: MediaUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post("/upload/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newFiles = response.data.files;
      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      onFilesUploaded(updatedFiles);
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFilesUploaded(updatedFiles);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="form-control">
        <label className="label cursor-pointer border-2 border-dashed border-base-300 rounded-lg p-8 hover:border-primary transition-colors">
          <div className="flex flex-col items-center gap-2 w-full">
            <Upload className="w-8 h-8 text-base-content/50" />
            <span className="text-sm text-base-content/70">
              {uploading ? "Uploading..." : "Click to upload images or videos"}
            </span>
            <span className="text-xs text-base-content/50">
              Max {maxFiles} files, 50MB each
            </span>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden bg-base-300">
                {file.type === "image" ? (
                  <img src={file.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <video src={file.url} className="w-full h-full object-cover" controls />
                )}
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 btn btn-circle btn-sm btn-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 badge badge-sm">
                {file.type === "image" ? <ImageIcon className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                {file.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
