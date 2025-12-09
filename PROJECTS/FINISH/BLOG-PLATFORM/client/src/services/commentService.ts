import api from "./api";
import type { Comment } from "../types";

export const getComments = async (postId: string) => {
  const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (postId: string, content: string, parentComment?: string) => {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, {
    content,
    parentComment,
  });
  return response.data;
};

export const updateComment = async (id: string, content: string) => {
  const response = await api.put<Comment>(`/comments/${id}`, { content });
  return response.data;
};

export const deleteComment = async (id: string) => {
  await api.delete(`/comments/${id}`);
};
