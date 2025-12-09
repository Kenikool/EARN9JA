import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
}) => {
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(null);
    }
  };

  const getStarFill = (starNumber: number) => {
    const currentRating = hoveredRating ?? rating;
    if (currentRating >= starNumber) {
      return "fill-yellow-400 text-yellow-400";
    } else if (currentRating >= starNumber - 0.5) {
      return "fill-yellow-200 text-yellow-400";
    } else {
      return "text-gray-300";
    }
  };

  return React.createElement(
    "div",
    {
      className: "flex items-center gap-1",
      onMouseLeave: handleMouseLeave,
    },

    // Render 5 stars
    Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      return React.createElement(
        "button",
        {
          key: starNumber,
          type: "button",
          onClick: () => handleStarClick(starNumber),
          onMouseEnter: () => handleStarHover(starNumber),
          disabled: readonly,
          className: readonly
            ? "cursor-default"
            : "cursor-pointer hover:scale-110 transition-transform",
        },
        React.createElement(Star, {
          className: `${sizeClasses[size]} ${getStarFill(
            starNumber
          )} transition-colors`,
        })
      );
    }),

    // Show rating value
    showValue &&
      React.createElement(
        "span",
        { className: "ml-2 text-sm text-gray-600" },
        `${rating.toFixed(1)}/5`
      )
  );
};

export default RatingStars;
