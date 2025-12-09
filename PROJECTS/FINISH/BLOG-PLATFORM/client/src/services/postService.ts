import api from "./api";
import type { Post, PostsResponse, CreatePostData } from "../types";

export const getPosts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  sort?: string;
}) => {
  const response = await api.get<PostsResponse>("/posts", { params });
  return response.data;
};

export const getPost = async (slug: string) => {
  const response = await api.get<Post>(`/posts/${slug}`);
  return response.data;
};

export const createPost = async (data: CreatePostData) => {
  const response = await api.post<Post>("/posts", data);
  return response.data;
};

export const updatePost = async (id: string, data: Partial<CreatePostData>) => {
  const response = await api.put<Post>(`/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id: string) => {
  await api.delete(`/posts/${id}`);
};

export const likePost = async (id: string) => {
  const response = await api.post<{ likes: number; isLiked: boolean }>(`/posts/${id}/like`);
  return response.data;
};

export const getMyPosts = async (params?: { page?: number; limit?: number; status?: string }) => {
  const response = await api.get<PostsResponse>("/posts/my/posts", { params });
  return response.data;
};

export const bookmarkPost = async (id: string) => {
  const response = await api.post<{ isBookmarked: boolean; savedPosts: string[] }>(`/posts/${id}/bookmark`);
  return response.data;
};

export const getSavedPosts = async () => {
  const response = await api.get<PostsResponse>("/posts/saved/posts");
  return response.data;
};
