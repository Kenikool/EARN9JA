import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalImages?: number;
}

const ImageLightbox = ({ 
  src, 
  alt, 
  onClose, 
  onPrevious, 
  onNext,
  currentIndex,
  totalImages 
}: ImageLightboxProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrevious) onPrevious();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    document.addEventListener("keydown", handleKeyPress);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "unset";
    };
  }, [onClose, onPrevious, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 btn btn-circle btn-ghost text-white hover:bg-white/20 z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image Counter */}
      {currentIndex !== undefined && totalImages !== undefined && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
          {currentIndex + 1} / {totalImages}
        </div>
      )}

      {/* Previous Button */}
      {onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 btn btn-circle btn-lg bg-black/60 text-white hover:bg-black/80 border-none"
          aria-label="Previous"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Image - Full Width */}
      <div className="relative w-full h-full flex items-center justify-center px-20" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[95vh] object-contain"
        />
      </div>

      {/* Next Button */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 btn btn-circle btn-lg bg-black/60 text-white hover:bg-black/80 border-none"
          aria-label="Next"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default ImageLightbox;
