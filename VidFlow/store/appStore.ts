import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Video {
  id: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration: string;
  views: number;
  publishedAt: string;
  description?: string;
  url: string;
}

export interface DownloadedVideo extends Video {
  downloadedAt: string;
  filePath: string;
  fileSize: string;
  quality: string;
  progress: number;
  status: "downloading" | "completed" | "paused" | "error";
}

interface AppState {
  // Onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Video[];
  setSearchResults: (results: Video[]) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  // Downloads
  downloads: DownloadedVideo[];
  addDownload: (video: DownloadedVideo) => void;
  updateDownload: (id: string, updates: Partial<DownloadedVideo>) => void;
  removeDownload: (id: string) => void;
  sortBy: "date" | "name" | "size";
  setSortBy: (sort: AppState["sortBy"]) => void;

  // Favorites
  favorites: string[];
  addFavorite: (videoId: string) => void;
  removeFavorite: (videoId: string) => void;
  isFavorite: (videoId: string) => boolean;

  // Watch History
  watchHistory: Video[];
  addToHistory: (video: Video) => void;
  clearHistory: () => void;

  // Settings
  downloadQuality:
    | "auto"
    | "144p"
    | "240p"
    | "360p"
    | "480p"
    | "720p"
    | "1080p";
  setDownloadQuality: (quality: AppState["downloadQuality"]) => void;
  downloadLocation: string;
  setDownloadLocation: (location: string) => void;
  autoDownload: boolean;
  setAutoDownload: (auto: boolean) => void;
  wifiOnlyDownload: boolean;
  setWifiOnlyDownload: (wifiOnly: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // Theme
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

      // Search
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),
      isSearching: false,
      setIsSearching: (searching) => set({ isSearching: searching }),
      searchHistory: [],
      addSearchHistory: (query) => {
        const history = get().searchHistory;
        const newHistory = [query, ...history.filter((q) => q !== query)].slice(
          0,
          10
        );
        set({ searchHistory: newHistory });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),

      // Downloads
      downloads: [],
      addDownload: (video) => {
        const downloads = get().downloads;
        set({ downloads: [...downloads, video] });
      },
      updateDownload: (id, updates) => {
        const downloads = get().downloads;
        const updatedDownloads = downloads.map((download) =>
          download.id === id ? { ...download, ...updates } : download
        );
        set({ downloads: updatedDownloads });
      },
      removeDownload: (id) => {
        const downloads = get().downloads;
        set({ downloads: downloads.filter((d) => d.id !== id) });
      },
      sortBy: "date",
      setSortBy: (sort) => set({ sortBy: sort }),

      // Favorites
      favorites: [],
      addFavorite: (videoId) => {
        const favorites = get().favorites;
        set({ favorites: [...favorites, videoId] });
      },
      removeFavorite: (videoId) => {
        const favorites = get().favorites;
        set({ favorites: favorites.filter((id) => id !== videoId) });
      },
      isFavorite: (videoId) => {
        return get().favorites.includes(videoId);
      },

      // Watch History
      watchHistory: [],
      addToHistory: (video) => {
        const history = get().watchHistory;
        const newHistory = [
          video,
          ...history.filter((v) => v.id !== video.id),
        ].slice(0, 50);
        set({ watchHistory: newHistory });
      },
      clearHistory: () => set({ watchHistory: [] }),

      // Settings
      downloadQuality: "auto",
      setDownloadQuality: (quality) => set({ downloadQuality: quality }),
      downloadLocation: "/storage/emulated/0/VidFlow",
      setDownloadLocation: (location) => set({ downloadLocation: location }),
      autoDownload: false,
      setAutoDownload: (auto) => set({ autoDownload: auto }),
      wifiOnlyDownload: false,
      setWifiOnlyDownload: (wifiOnly) => set({ wifiOnlyDownload: wifiOnly }),
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      // Theme
      isDarkMode: false,
      setIsDarkMode: (dark) => set({ isDarkMode: dark }),
    }),
    {
      name: "vidflow-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
