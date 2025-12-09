import { Video } from "../store/appStore";
import Constants from "expo-constants";

// Backend API configuration - HARDCODED for now since config isn't loading properly
const API_URL = "http://10.107.148.25:3001";

console.log("🔧 VidFlow API URL (HARDCODED):", API_URL);
console.log("📦 Expo Config Extra:", Constants.expoConfig?.extra);

// Mock data for development
const mockVideos: Video[] = [
  {
    id: "1",
    title: "Amazing Nature Documentary - Wildlife in 4K",
    channelName: "Nature Explorer",
    thumbnail: "https://picsum.photos/320/180?random=1",
    duration: "15:30",
    views: 1250000,
    publishedAt: "2 days ago",
    description:
      "Explore the amazing world of wildlife in stunning 4K resolution.",
    url: "https://example.com/video1",
  },
  {
    id: "2",
    title: "Learn React Native in 30 Minutes",
    channelName: "Code Academy",
    thumbnail: "https://picsum.photos/320/180?random=2",
    duration: "32:15",
    views: 890000,
    publishedAt: "1 week ago",
    description: "Complete React Native tutorial for beginners.",
    url: "https://example.com/video2",
  },
  {
    id: "3",
    title: "Epic Gaming Moments Compilation",
    channelName: "Gaming Hub",
    thumbnail: "https://picsum.photos/320/180?random=3",
    duration: "8:45",
    views: 2100000,
    publishedAt: "3 days ago",
    description: "Best gaming moments from this month.",
    url: "https://example.com/video3",
  },
  {
    id: "4",
    title: "Cooking Masterclass: Italian Pasta",
    channelName: "Chef Masters",
    thumbnail: "https://picsum.photos/320/180?random=4",
    duration: "25:20",
    views: 567000,
    publishedAt: "5 days ago",
    description: "Learn to make authentic Italian pasta from scratch.",
    url: "https://example.com/video4",
  },
  {
    id: "5",
    title: "Latest Tech News & Reviews",
    channelName: "Tech Today",
    thumbnail: "https://picsum.photos/320/180?random=5",
    duration: "12:10",
    views: 445000,
    publishedAt: "1 day ago",
    description: "Stay updated with the latest technology trends.",
    url: "https://example.com/video5",
  },
  {
    id: "6",
    title: "Football Highlights - Champions League",
    channelName: "Sports Central",
    thumbnail: "https://picsum.photos/320/180?random=6",
    duration: "18:30",
    views: 3200000,
    publishedAt: "4 hours ago",
    description: "Best moments from last night's Champions League matches.",
    url: "https://example.com/video6",
  },
];

class VideoService {
  async getTrendingVideos(category: string = "trending"): Promise<Video[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Filter videos based on category (mock implementation)
    let filteredVideos = mockVideos;

    switch (category) {
      case "music":
        filteredVideos = mockVideos.filter(
          (v) => v.channelName.includes("Music") || v.title.includes("Music")
        );
        break;
      case "gaming":
        filteredVideos = mockVideos.filter(
          (v) =>
            v.title.toLowerCase().includes("gaming") ||
            v.title.toLowerCase().includes("game")
        );
        break;
      case "news":
        filteredVideos = mockVideos.filter(
          (v) =>
            v.title.toLowerCase().includes("news") ||
            v.channelName.includes("News")
        );
        break;
      case "sports":
        filteredVideos = mockVideos.filter(
          (v) =>
            v.title.toLowerCase().includes("football") ||
            v.title.toLowerCase().includes("sport")
        );
        break;
      case "education":
        filteredVideos = mockVideos.filter(
          (v) =>
            v.title.toLowerCase().includes("learn") ||
            v.title.toLowerCase().includes("tutorial")
        );
        break;
      default:
        filteredVideos = mockVideos;
    }

    return filteredVideos.length > 0 ? filteredVideos : mockVideos.slice(0, 3);
  }

  async searchVideos(query: string): Promise<Video[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!query.trim()) {
      return [];
    }

    // Filter videos based on search query
    const filteredVideos = mockVideos.filter(
      (video) =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.channelName.toLowerCase().includes(query.toLowerCase()) ||
        video.description?.toLowerCase().includes(query.toLowerCase())
    );

    return filteredVideos;
  }

  async getVideoDetails(videoId: string): Promise<Video | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const video = mockVideos.find((v) => v.id === videoId);
    return video || null;
  }

  async getVideoQualities(
    videoId: string
  ): Promise<
    { id: string; resolution: string; quality: string; fileSize: string }[]
  > {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      {
        id: "1080p",
        resolution: "1920x1080",
        quality: "HD",
        fileSize: "250 MB",
      },
      { id: "720p", resolution: "1280x720", quality: "HD", fileSize: "150 MB" },
      { id: "480p", resolution: "854x480", quality: "SD", fileSize: "80 MB" },
      { id: "360p", resolution: "640x360", quality: "SD", fileSize: "45 MB" },
      { id: "240p", resolution: "426x240", quality: "Low", fileSize: "25 MB" },
    ];
  }

  // Backend API Methods
  async getVideoInfoFromUrl(url: string): Promise<any> {
    const apiUrl = `${API_URL}/api/video/info?url=${encodeURIComponent(url)}`;
    console.log("🌐 Fetching video info from:", apiUrl);

    try {
      const response = await fetch(apiUrl);
      console.log("📡 Response status:", response.status);

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!data.success) {
        throw new Error(data.error || "Failed to get video info");
      }

      return data.data;
    } catch (error) {
      console.error("❌ Error getting video info:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async getDownloadUrl(url: string, quality: string = "best"): Promise<any> {
    try {
      const response = await fetch(
        `${API_URL}/api/video/download-url?url=${encodeURIComponent(
          url
        )}&quality=${quality}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get download URL");
      }

      return data.data;
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  }

  async getAvailableQualities(url: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/video/qualities?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get qualities");
      }

      return data.data.qualities;
    } catch (error) {
      console.error("Error getting qualities:", error);
      throw error;
    }
  }

  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      return data.status === "ok";
    } catch (error) {
      console.error("Backend health check failed:", error);
      return false;
    }
  }
}

export const videoService = new VideoService();
