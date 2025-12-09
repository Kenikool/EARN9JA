// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  createdAt?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  token: string;
}

// Media file type
export interface MediaFile {
  url: string;
  type: "image" | "video";
  publicId: string;
}

// Post types
export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  mediaFiles?: MediaFile[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  status: "draft" | "published";
  readingTime: number;
  views: number;
  likes: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: string;
}

// Comment types
export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  post: string;
  parentComment?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  mediaFiles?: MediaFile[];
  category?: string;
  tags?: string[];
  status: "draft" | "published";
}
