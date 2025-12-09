import React from "react";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useAuthStore } from "../../stores/authStore";
import { reviewAPI } from "../../services/api";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: number[];
}

interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalReviews: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ReviewSectionProps {
  recipeId: string;
  recipeSlug?: string;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest";

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  recipeId,
  recipeSlug,
}) => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [reviewStats, setReviewStats] = React.useState<ReviewStats | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);

  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);
  const [sortBy, setSortBy] = React.useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNext: false,
    hasPrev: false,
  });

  const reviewsPerPage = 10;

  // Load reviews and stats
  const loadReviews = async (page: number = 1, sort: SortOption = sortBy) => {
    try {
      setIsLoading(true);

      // Load reviews
      const reviewsResponse = await reviewAPI.getRecipeReviews(recipeId, {
        page,
        limit: reviewsPerPage,
        sortBy: sort === "newest" || sort === "oldest" ? "createdAt" : "rating",
        sortOrder: sort === "newest" || sort === "highest" ? "desc" : "asc",
      });

      // Load stats
      const statsResponse = await reviewAPI.getReviewStats(recipeId);

      setReviews(reviewsResponse.data.data || []);
      setReviewStats(statsResponse.data.data);
      setPagination(
        reviewsResponse.data.pagination || {
          currentPage: page,
          totalPages:
            Math.ceil(reviewsResponse.data.results / reviewsPerPage) || 1,
          totalReviews: reviewsResponse.data.results || 0,
          hasNext: reviewsResponse.data.pagination?.hasNext || false,
          hasPrev: reviewsResponse.data.pagination?.hasPrev || false,
        }
      );
    } catch (error: unknown) {
      console.error("Error loading reviews:", error);

      if (error instanceof Error && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          toast.error("Recipe not found");
        } else if (axiosError.response?.status === 500) {
          toast.error("Failed to load reviews. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load reviews on component mount
  React.useEffect(() => {
    if (recipeId) {
      loadReviews(currentPage, sortBy);
    }
  }, [recipeId, currentPage, sortBy]);

  // Check if user has already reviewed this recipe
  const userReview = user
    ? reviews.find((review: Review) => review.user._id === user._id)
    : null;

  const handleReviewSubmit = (review: Review) => {
    if (editingReview) {
      // Update existing review in the list
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? review : r))
      );
      setEditingReview(null);
    } else {
      // Add new review to the list
      setReviews((prev) => [review, ...prev]);
      setShowReviewForm(false);
    }

    // Reload reviews to update stats
    loadReviews(currentPage, sortBy);
  };

  const handleReviewEdit = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewDelete = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));

    // Reload reviews to update stats
    loadReviews(currentPage, sortBy);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
    loadReviews(1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadReviews(newPage, sortBy);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowReviewForm(false);
  };

  const formatRatingPercentage = (count: number) => {
    if (!reviewStats?.totalReviews) return 0;
    return Math.round((count / reviewStats.totalReviews) * 100);
  };

  if (isLoading) {
    return React.createElement(
      "div",
      { className: "flex justify-center py-8" },
      React.createElement(LoadingSpinner)
    );
  }

  return React.createElement(
    "div",
    { className: "space-y-8" },

    // Review Stats Section
    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow-sm border" },
      React.createElement(
        "h2",
        { className: "text-2xl font-bold text-gray-900 mb-6" },
        "Reviews & Ratings"
      ),

      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },

        // Rating Overview
        React.createElement(
          "div",
          { className: "text-center" },
          React.createElement(
            "div",
            { className: "text-4xl font-bold text-gray-900 mb-2" },
            reviewStats?.averageRating
              ? reviewStats.averageRating.toFixed(1)
              : "0.0"
          ),
          React.createElement(
            "div",
            { className: "flex items-center justify-center mb-2" },
            React.createElement(Star, {
              className: "w-6 h-6 fill-yellow-400 text-yellow-400",
            })
          ),
          React.createElement(
            "p",
            { className: "text-gray-600" },
            `Based on ${reviewStats?.totalReviews || 0} review${
              (reviewStats?.totalReviews || 0) !== 1 ? "s" : ""
            }`
          )
        ),

        // Rating Distribution
        React.createElement(
          "div",
          { className: "space-y-3" },
          React.createElement(
            "h3",
            { className: "font-semibold text-gray-900 mb-4" },
            "Rating Distribution"
          ),

          reviewStats?.ratingDistribution &&
            React.createElement(
              "div",
              { className: "space-y-2" },

              // 5 stars to 1 star
              [5, 4, 3, 2, 1].map((starRating) => {
                const count =
                  reviewStats.ratingDistribution[starRating - 1] || 0;
                const percentage = formatRatingPercentage(count);

                return React.createElement(
                  "div",
                  { key: starRating, className: "flex items-center gap-3" },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-1 w-20" },
                    React.createElement(
                      "span",
                      { className: "text-sm text-gray-600" },
                      `${starRating}`
                    ),
                    React.createElement(Star, {
                      className: "w-4 h-4 fill-yellow-400 text-yellow-400",
                    })
                  ),
                  React.createElement(
                    "div",
                    { className: "flex-1 bg-gray-200 rounded-full h-2" },
                    React.createElement("div", {
                      className: "bg-orange-500 h-2 rounded-full",
                      style: { width: `${percentage}%` },
                    })
                  ),
                  React.createElement(
                    "span",
                    { className: "text-sm text-gray-500 w-8" },
                    percentage > 0 ? `${percentage}%` : ""
                  )
                );
              })
            )
        )
      )
    ),

    // Add Review Section
    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow-sm border" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between mb-6" },
        React.createElement(
          "h3",
          { className: "text-xl font-bold text-gray-900" },
          "Add Your Review"
        ),
        user &&
          !userReview &&
          !showReviewForm &&
          !editingReview &&
          React.createElement(
            "button",
            {
              onClick: () => setShowReviewForm(true),
              className:
                "px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors",
            },
            React.createElement(MessageSquare, {
              className: "w-4 h-4 mr-2 inline",
            }),
            "Write Review"
          )
      ),

      // Review Form or existing review message
      showReviewForm || editingReview
        ? React.createElement(ReviewForm, {
            recipeId,
            existingReview: editingReview || undefined,
            onSubmit: handleReviewSubmit,
            onCancel: handleCancelEdit,
            isEditing: !!editingReview,
          })
        : userReview
        ? React.createElement(
            "div",
            { className: "text-center py-6" },
            React.createElement(
              "p",
              { className: "text-gray-600 mb-4" },
              "You have already reviewed this recipe."
            ),
            React.createElement(
              "button",
              {
                onClick: () => handleReviewEdit(userReview),
                className: "text-orange-600 hover:text-orange-700 font-medium",
              },
              "Edit Your Review"
            )
          )
        : !user
        ? React.createElement(
            "div",
            { className: "text-center py-6 text-gray-600" },
            React.createElement("p", null, "Please log in to leave a review.")
          )
        : null
    ),

    // Reviews List Section
    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow-sm border" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between mb-6" },
        React.createElement(
          "h3",
          { className: "text-xl font-bold text-gray-900" },
          `Reviews (${pagination.totalReviews})`
        ),

        // Sort Options
        React.createElement(
          "select",
          {
            value: sortBy,
            onChange: (e) =>
              handleSortChange(
                (e.target as HTMLSelectElement).value as SortOption
              ),
            className:
              "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500",
          },
          React.createElement("option", { value: "newest" }, "Newest First"),
          React.createElement("option", { value: "oldest" }, "Oldest First"),
          React.createElement("option", { value: "highest" }, "Highest Rated"),
          React.createElement("option", { value: "lowest" }, "Lowest Rated")
        )
      ),

      // Reviews List
      reviews.length > 0
        ? React.createElement(
            "div",
            { className: "space-y-6" },
            reviews.map((review) =>
              React.createElement(ReviewCard, {
                key: review._id,
                review,
                onEdit: handleReviewEdit,
                onDelete: handleReviewDelete,
                showActions: true,
              })
            )
          )
        : React.createElement(
            "div",
            { className: "text-center py-8 text-gray-500" },
            React.createElement(MessageSquare, {
              className: "w-12 h-12 mx-auto mb-4 text-gray-300",
            }),
            React.createElement(
              "p",
              null,
              "No reviews yet. Be the first to review this recipe!"
            )
          ),

      // Pagination
      pagination.totalPages > 1 &&
        React.createElement(
          "div",
          {
            className:
              "flex items-center justify-between mt-8 pt-6 border-t border-gray-200",
          },
          React.createElement(
            "div",
            null,
            React.createElement(
              "p",
              { className: "text-sm text-gray-600" },
              `Showing ${
                (pagination.currentPage - 1) * reviewsPerPage + 1
              }-${Math.min(
                pagination.currentPage * reviewsPerPage,
                pagination.totalReviews
              )} of ${pagination.totalReviews} reviews`
            )
          ),
          React.createElement(
            "div",
            { className: "flex items-center gap-2" },
            React.createElement(
              "button",
              {
                onClick: () => handlePageChange(currentPage - 1),
                disabled: !pagination.hasPrev,
                className:
                  "px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
              },
              "Previous"
            ),

            // Page numbers
            Array.from(
              { length: Math.min(pagination.totalPages, 5) },
              (_, i) => {
                const pageNum = Math.max(
                  1,
                  Math.min(
                    pagination.currentPage - 2 + i,
                    pagination.totalPages
                  )
                );

                return React.createElement(
                  "button",
                  {
                    key: pageNum,
                    onClick: () => handlePageChange(pageNum),
                    className: `px-3 py-1 text-sm rounded-md ${
                      pageNum === currentPage
                        ? "bg-orange-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`,
                  },
                  pageNum
                );
              }
            ),

            React.createElement(
              "button",
              {
                onClick: () => handlePageChange(currentPage + 1),
                disabled: !pagination.hasNext,
                className:
                  "px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
              },
              "Next"
            )
          )
        )
    )
  );
};

export default ReviewSection;
