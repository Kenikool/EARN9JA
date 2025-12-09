import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import type { Review } from '../types';

interface ProductReviewsProps {
  reviews: Review[];
  isLoading?: boolean;
  onWriteReview?: () => void;
  onMarkHelpful?: (reviewId: string) => void;
  className?: string;
}

export default function ProductReviews({
  reviews,
  isLoading = false,
  onWriteReview,
  onMarkHelpful,
  className = ''
}: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          <div className="skeleton h-8 w-32"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-base-300 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="skeleton w-8 h-8 rounded-full"></div>
              <div className="space-y-1">
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-3 w-16"></div>
              </div>
            </div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'helpful':
        return (b.helpful || 0) - (a.helpful || 0);
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Reviews ({reviews.length})
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-base-content/60">
                {averageRating.toFixed(1)} out of 5
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {reviews.length > 1 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'helpful' | 'rating')}
              className="select select-bordered select-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rated</option>
            </select>
          )}

          {onWriteReview && (
            <button onClick={onWriteReview} className="btn btn-primary btn-sm">
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <div className="bg-base-200 rounded-lg p-4">
          <h4 className="font-medium mb-3">Rating Breakdown</h4>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-base-300 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-base-content/60 w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h4 className="text-lg font-semibold mb-2">No reviews yet</h4>
          <p className="text-base-content/60 mb-4">
            Be the first to share your thoughts about this product!
          </p>
          {onWriteReview && (
            <button onClick={onWriteReview} className="btn btn-primary">
              Write the First Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <div key={review._id} className="border border-base-300 rounded-lg p-4">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                      <span className="text-sm">
                        {typeof review.user === 'object' && review.user?.name
                          ? review.user.name.charAt(0).toUpperCase()
                          : 'U'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">
                      {typeof review.user === 'object' && review.user?.name
                        ? review.user.name
                        : 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.verified && (
                        <span className="badge badge-success badge-xs">Verified Purchase</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-base-content/60">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-medium mb-2">{review.title}</h4>
              )}

              <p className="text-base-content/80 mb-3 leading-relaxed">{review.comment}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        // TODO: Open image modal
                        console.log('Open image modal:', image);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-base-content/60">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {review.helpful || 0} found this helpful
                  </span>
                </div>
                {onMarkHelpful && (
                  <button
                    onClick={() => onMarkHelpful(review._id)}
                    className="btn btn-ghost btn-xs"
                  >
                    Helpful
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}