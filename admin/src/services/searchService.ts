import api from "./authService";

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  resultsByType: {
    users: number;
    tasks: number;
    transactions: number;
    withdrawals: number;
    disputes: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
}

class SearchService {
  async search(
    query: string,
    type?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    const params: Record<string, string | number> = {
      q: query,
      page,
      limit,
    };

    if (type) {
      params.type = type;
    }

    const response = await api.get("/search", { params });
    return response.data.data;
  }
}

export default new SearchService();
