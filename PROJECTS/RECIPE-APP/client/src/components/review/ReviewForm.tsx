import React from "react";
import { Send, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { RatingStars } from "./RatingStars";
import { useAuthStore } from "../../stores/authStore";
import { reviewAPI } from "../../services/api";

interface ReviewFormProps {
  recipeId: string;
  existingReview?: any;
  onSubmit?: (review: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  recipeId,
  existingReview,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { user } = useAuthStore();
  const [rating, setRating] = React.useState(existingReview?.rating || 0);
  const [comment, setComment] = React.useState(existingReview?.comment || "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form when switching between create/edit modes
  React.useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(0);
      setComment("");
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        rating,
        comment: comment.trim(),
      };

      let response;
      if (isEditing && existingReview) {
        response = await reviewAPI.updateReview(existingReview._id, reviewData);
        toast.success("Review updated successfully!");
      } else {
        response = await reviewAPI.createReview(recipeId, reviewData);
        toast.success("Review added successfully!");
      }

      if (onSubmit) {
        onSubmit(response.data.data);
      }

      // Reset form if not editing
      if (!isEditing) {
        setRating(0);
        setComment("");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);

      if (error.response?.status === 400) {
        toast.error(
          error.response.data?.message || "Please check your review data"
        );
      } else if (error.response?.status === 401) {
        toast.error("You must be logged in to submit a review");
      } else if (error.response?.status === 403) {
        toast.error("You can only review each recipe once");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to submit review. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (!isEditing) {
      setRating(0);
      setComment("");
    }
  };

  return React.createElement(
    "form",
    {
      onSubmit: handleSubmit,
      className: "bg-white p-6 rounded-lg shadow-sm border",
    },

    // Header
    React.createElement(
      "div",
      { className: "flex items-center justify-between mb-6" },
      React.createElement(
        "h3",
        { className: "text-lg font-semibold text-gray-900" },
        isEditing ? "Edit Your Review" : "Add a Review"
      ),
      React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        React.createElement(
          "span",
          { className: "text-sm text-gray-600" },
          "Your rating:"
        ),
        React.createElement(RatingStars, {
          rating,
          onRatingChange: setRating,
          size: "lg",
        })
      )
    ),

    // Rating Display (for non-interactive view)
    React.createElement(
      "div",
      { className: "mb-4" },
      React.createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-2" },
        "Your Rating *"
      ),
      React.createElement(RatingStars, {
        rating,
        onRatingChange: setRating,
        readonly: false,
        size: "lg",
      })
    ),

    // Comment Input
    React.createElement(
      "div",
      { className: "mb-6" },
      React.createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-2" },
        "Your Review *"
      ),
      React.createElement("textarea", {
        value: comment,
        onChange: (e) => setComment(e.target.value),
        rows: 4,
        className:
          "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
        placeholder: "Share your thoughts about this recipe...",
        required: true,
        disabled: isSubmitting,
      }),
      React.createElement(
        "div",
        { className: "mt-1 text-sm text-gray-500" },
        `${comment.length}/500 characters`
      )
    ),

    // Action Buttons
    React.createElement(
      "div",
      { className: "flex justify-end space-x-3" },
      React.createElement(
        "button",
        {
          type: "button",
          onClick: handleCancel,
          disabled: isSubmitting,
          className:
            "px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50",
        },
        React.createElement(X, { className: "w-4 h-4 mr-1 inline" }),
        "Cancel"
      ),
      React.createElement(
        "button",
        {
          type: "submit",
          disabled: isSubmitting || rating === 0 || comment.trim().length < 10,
          className:
            "px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed",
        },
        React.createElement(Send, { className: "w-4 h-4 mr-2 inline" }),
        isSubmitting
          ? "Submitting..."
          : isEditing
          ? "Update Review"
          : "Submit Review"
      )
    )
  );
};

export default ReviewForm;
