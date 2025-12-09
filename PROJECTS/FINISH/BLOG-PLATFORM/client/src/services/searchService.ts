import api from "./api";
import type { Post } from "../types";

interface SearchResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  query: string;
}

export const searchPosts = async (query: string, page: number = 1, limit: number = 10) => {
  const response = await api.get<SearchResponse>("/search", {
    params: { q: query, page, limit },
  });
  return response.data;
};
