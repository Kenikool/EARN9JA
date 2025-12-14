import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  User,
  FileText,
  CreditCard,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";
import searchService, {
  type SearchResult,
  type SearchResponse,
} from "../services/searchService";

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || "";

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(typeFilter);

  useEffect(() => {
    if (query) {
      performSearch(query, selectedType);
    }
  }, [query, selectedType]);

  const performSearch = async (searchQuery: string, type?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchService.search(searchQuery, type || undefined);
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to perform search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="w-5 h-5" />;
      case "task":
        return <FileText className="w-5 h-5" />;
      case "transaction":
        return <CreditCard className="w-5 h-5" />;
      case "withdrawal":
        return <DollarSign className="w-5 h-5" />;
      case "dispute":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <SearchIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "user":
        return "badge-primary";
      case "task":
        return "badge-secondary";
      case "transaction":
        return "badge-accent";
      case "withdrawal":
        return "badge-success";
      case "dispute":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "user":
        navigate(`/dashboard/users?id=${result.id}`);
        break;
      case "task":
        navigate(`/dashboard/tasks?id=${result.id}`);
        break;
      case "transaction":
        navigate(`/dashboard/revenue?id=${result.id}`);
        break;
      case "withdrawal":
        navigate(`/dashboard/withdrawals?id=${result.id}`);
        break;
      case "dispute":
        navigate(`/dashboard/disputes?id=${result.id}`);
        break;
    }
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type === selectedType ? "" : type);
  };

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <SearchIcon className="w-16 h-16 text-base-content/30 mb-4" />
        <h2 className="text-2xl font-bold text-base-content mb-2">Search</h2>
        <p className="text-base-content/60">
          Enter a search query to find users, tasks, transactions, and more
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          Search Results
        </h1>
        <p className="text-base-content/60">Showing results for "{query}"</p>
      </div>

      {/* Type Filters */}
      {results && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleTypeFilter("")}
            className={`btn btn-sm ${
              !selectedType ? "btn-primary" : "btn-ghost"
            }`}
          >
            All ({results.totalResults})
          </button>
          <button
            onClick={() => handleTypeFilter("users")}
            className={`btn btn-sm ${
              selectedType === "users" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Users ({results.resultsByType.users})
          </button>
          <button
            onClick={() => handleTypeFilter("tasks")}
            className={`btn btn-sm ${
              selectedType === "tasks" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Tasks ({results.resultsByType.tasks})
          </button>
          <button
            onClick={() => handleTypeFilter("transactions")}
            className={`btn btn-sm ${
              selectedType === "transactions" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Transactions ({results.resultsByType.transactions})
          </button>
          <button
            onClick={() => handleTypeFilter("withdrawals")}
            className={`btn btn-sm ${
              selectedType === "withdrawals" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Withdrawals ({results.resultsByType.withdrawals})
          </button>
          <button
            onClick={() => handleTypeFilter("disputes")}
            className={`btn btn-sm ${
              selectedType === "disputes" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Disputes ({results.resultsByType.disputes})
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results && (
        <>
          {results.results.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-base-content mb-2">
                No results found
              </h3>
              <p className="text-base-content/60">
                Try adjusting your search query or filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="card bg-base-100 border border-base-300 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="card-body">
                    <div className="flex items-start gap-4">
                      <div className="avatar placeholder">
                        <div className="bg-primary/10 text-primary rounded-lg w-12 h-12 flex items-center justify-center">
                          {getTypeIcon(result.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="card-title text-lg text-base-content">
                            {result.title}
                          </h3>
                          <span
                            className={`badge badge-sm ${getTypeColor(
                              result.type
                            )}`}
                          >
                            {result.type}
                          </span>
                        </div>
                        <p className="text-base-content/70 mb-3">
                          {result.description}
                        </p>
                        {result.metadata && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(result.metadata)
                              .filter(([, value]) => value)
                              .map(([key, value]) => (
                                <div
                                  key={key}
                                  className="badge badge-outline badge-sm"
                                >
                                  {key}: {String(value)}
                                </div>
                              ))}
                          </div>
                        )}
                        <p className="text-xs text-base-content/50 mt-2">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {results.pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                {Array.from(
                  { length: results.pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`join-item btn btn-sm ${
                      page === results.pagination.currentPage
                        ? "btn-active"
                        : ""
                    }`}
                    onClick={() => {
                      // Implement pagination
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
