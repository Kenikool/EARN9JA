import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Tag, Folder, Clock, Home, BookOpen, PenTool, Bookmark } from "lucide-react";
import api from "../services/api";
import { format } from "date-fns";
import type { Category, Post } from "../types";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<Category[]>("/categories");
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ["recent-posts"],
    queryFn: async () => {
      const response = await api.get<{ posts: Post[] }>("/posts?limit=5");
      return response.data.posts;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const { data: popularTags } = useQuery({
    queryKey: ["popular-tags"],
    queryFn: async () => {
      const response = await api.get<{ posts: Post[] }>("/posts?limit=50");
      const allTags: string[] = [];
      response.data.posts.forEach((post) => {
        allTags.push(...post.tags);
      });
      const tagCounts = allTags.reduce((acc: Record<string, number>, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([tag, count]) => ({ tag, count }));
    },
  });

  return (
    <div className="space-y-6">
      {/* Navigation Links - Mobile Only */}
      <div className="lg:hidden card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg mb-2">Navigation</h3>
          <ul className="menu menu-compact">
            <li>
              <Link to="/">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </li>
            <li>
              <Link to="/posts">
                <BookOpen className="w-4 h-4" />
                All Posts
              </Link>
            </li>
            {user && (
              <>
                <li>
                  <Link to="/create">
                    <PenTool className="w-4 h-4" />
                    Write Post
                  </Link>
                </li>
                <li>
                  <Link to="/saved">
                    <Bookmark className="w-4 h-4" />
                    Saved Posts
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      {/* Search */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">Search</h3>
          <SearchBar />
        </div>
      </div>

      {/* Categories */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">
            <Folder className="w-5 h-5" />
            Categories
          </h3>
          <div className="space-y-2">
            {categories?.map((category) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="flex items-center justify-between p-2 rounded hover:bg-base-200 transition-colors"
              >
                <span className="text-sm">{category.name}</span>
                <span className="badge badge-sm">{category.postCount}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">
            <Tag className="w-5 h-5" />
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTags?.map(({ tag, count }) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="badge badge-outline hover:badge-primary transition-colors"
              >
                {tag} ({count})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">
            <Clock className="w-5 h-5" />
            Recent Posts
          </h3>
          <div className="space-y-4">
            {recentPosts?.map((post) => (
              <Link
                key={post._id}
                to={`/posts/${post.slug}`}
                className="block hover:bg-base-200 p-2 rounded transition-colors"
              >
                <h4 className="font-semibold text-sm line-clamp-2 mb-1">{post.title}</h4>
                <p className="text-xs text-base-content/60">
                  {post.publishedAt
                    ? format(new Date(post.publishedAt), "MMM d, yyyy")
                    : format(new Date(post.createdAt), "MMM d, yyyy")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
