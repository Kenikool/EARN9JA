import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, createComment, deleteComment } from "../services/commentService";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
  });

  const createMutation = useMutation({
    mutationFn: ({ content, parentComment }: { content: string; parentComment?: string }) =>
      createComment(postId, content, parentComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setNewComment("");
      setReplyTo(null);
      setReplyContent("");
      toast.success("Comment added!");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!newComment.trim()) return;

    createMutation.mutate({ content: newComment });
  };

  const handleReply = (commentId: string) => {
    if (!user) {
      toast.error("Please login to reply");
      return;
    }
    if (!replyContent.trim()) return;

    createMutation.mutate({ content: replyContent, parentComment: commentId });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6" />
        <h2 className="text-2xl font-bold">
          Comments ({comments?.length || 0})
        </h2>
      </div>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="form-control">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="textarea textarea-bordered h-24"
              required
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary mt-2 ${createMutation.isPending ? "loading" : ""}`}
            disabled={createMutation.isPending || !newComment.trim()}
          >
            {!createMutation.isPending && <Send className="w-4 h-4 mr-2" />}
            Post Comment
          </button>
        </form>
      ) : (
        <div className="alert alert-info mb-8">
          <span>Please login to leave a comment</span>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments?.map((comment) => (
          <div key={comment._id} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{comment.author.name}</p>
                    <p className="text-xs text-base-content/60">
                      {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                {user && user._id === comment.author._id && (
                  <button
                    onClick={() => deleteMutation.mutate(comment._id)}
                    className="btn btn-ghost btn-sm text-error"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="mt-3">{comment.content}</p>

              {/* Reply Button */}
              {user && (
                <button
                  onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                  className="btn btn-ghost btn-sm mt-2"
                >
                  Reply
                </button>
              )}

              {/* Reply Form */}
              {replyTo === comment._id && (
                <div className="mt-4 pl-4 border-l-2 border-base-300">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="textarea textarea-bordered w-full h-20"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleReply(comment._id)}
                      className={`btn btn-primary btn-sm ${
                        createMutation.isPending ? "loading" : ""
                      }`}
                      disabled={createMutation.isPending || !replyContent.trim()}
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent("");
                      }}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 pl-8 space-y-4 border-l-2 border-base-300">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="card bg-base-200">
                      <div className="card-body p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="avatar">
                              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                                {reply.author.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{reply.author.name}</p>
                              <p className="text-xs text-base-content/60">
                                {format(new Date(reply.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>

                          {user && user._id === reply.author._id && (
                            <button
                              onClick={() => deleteMutation.mutate(reply._id)}
                              className="btn btn-ghost btn-xs text-error"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-sm">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {comments?.length === 0 && (
          <div className="text-center py-8 text-base-content/60">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
