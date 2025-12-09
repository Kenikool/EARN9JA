import React from "react";
import { Edit3, Trash2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";
import { RatingStars } from "./RatingStars";
import { useAuthStore } from "../../stores/authStore";
import { reviewAPI } from "../../services/api";

interface ReviewCardProps {
  review: any;
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { user } = useAuthStore();
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Check if current user is the author of this review
  const isOwner = user && review.user && review.user._id === user._id;

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this review? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await reviewAPI.deleteReview(review._id);
      toast.success("Review deleted successfully!");
      if (onDelete) {
        onDelete(review._id);
      }
    } catch (error: any) {
      console.error("Error deleting review:", error);

      if (error.response?.status === 401) {
        toast.error("You must be logged in to delete reviews");
      } else if (error.response?.status === 403) {
        toast.error("You can only delete your own reviews");
      } else if (error.response?.status === 404) {
        toast.error("Review not found");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to delete review. Please try again."
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  return React.createElement(
    "div",
    { className: "bg-white p-6 rounded-lg shadow-sm border" },

    // Header with user info
    React.createElement(
      "div",
      { className: "flex items-start justify-between mb-4" },

      React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        // User Avatar
        React.createElement(
          "div",
          {
            className:
              "w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center",
          },
          review.user?.avatar
            ? React.createElement("img", {
                src: review.user.avatar,
                alt: review.user.name,
                className: "w-10 h-10 rounded-full object-cover",
              })
            : React.createElement(User, { className: "w-5 h-5 text-gray-500" })
        ),

        // User info and rating
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "font-medium text-gray-900" },
            review.user?.name || "Anonymous"
          ),
          React.createElement(RatingStars, {
            rating: review.rating,
            readonly: true,
            size: "sm",
          })
        )
      ),

      // Date and Actions
      React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        React.createElement(
          "span",
          { className: "text-sm text-gray-500" },
          formatDate(review.createdAt)
        ),

        // Action buttons (only for owner)
        showActions &&
          isOwner &&
          React.createElement(
            "div",
            { className: "flex items-center gap-2" },
            React.createElement(
              "button",
              {
                onClick: () => onEdit && onEdit(review),
                className:
                  "p-1 text-gray-400 hover:text-orange-600 transition-colors",
                title: "Edit review",
              },
              React.createElement(Edit3, { className: "w-4 h-4" })
            ),
            React.createElement(
              "button",
              {
                onClick: handleDelete,
                disabled: isDeleting,
                className:
                  "p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50",
                title: "Delete review",
              },
              React.createElement(Trash2, { className: "w-4 h-4" })
            )
          )
      )
    ),

    // Review content
    React.createElement(
      "div",
      { className: "mb-4" },
      React.createElement(
        "p",
        { className: "text-gray-700 leading-relaxed" },
        review.comment
      )
    ),

    // Review images (if any)
    review.images &&
      review.images.length > 0 &&
      React.createElement(
        "div",
        { className: "mt-4" },
        React.createElement(
          "div",
          { className: "flex gap-2 overflow-x-auto" },
          review.images.map((imageUrl: string, index: number) =>
            React.createElement("img", {
              key: index,
              src: imageUrl,
              alt: `Review image ${index + 1}`,
              className: "w-20 h-20 object-cover rounded-md flex-shrink-0",
              loading: "lazy",
            })
          )
        )
      ),

    // Rating summary (bottom)
    React.createElement(
      "div",
      {
        className:
          "flex items-center justify-between pt-3 border-t border-gray-100",
      },
      React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement(RatingStars, {
          rating: review.rating,
          readonly: true,
          size: "sm",
          showValue: true,
        })
      ),
      React.createElement(
        "span",
        { className: "text-xs text-gray-400 uppercase tracking-wide" },
        `${review.rating}/5 stars`
      )
    )
  );
};

export default ReviewCard;

