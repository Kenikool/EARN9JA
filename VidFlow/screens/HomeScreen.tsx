import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SearchBar,
  VideoCard,
  Chip,
  LoadingSpinner,
  EmptyState,
  Skeleton,
  useTheme,
  Icon,
  FloatingActionButton,
  Modal,
  Input,
  Button,
} from "../components/ui";
import { Logo } from "../assets/Logo";
import { useAppStore, Video } from "../store/appStore";
import { videoService } from "../services/videoService";
import { spacing } from "../components/ui/theme/spacing";
import { typography } from "../components/ui/theme/typography";

const categories = [
  { id: "trending", label: "Trending", icon: "trending" },
  { id: "music", label: "Music", icon: "music" },
  { id: "gaming", label: "Gaming", icon: "gaming" },
  { id: "news", label: "News", icon: "news" },
  { id: "sports", label: "Sports", icon: "sports" },
  { id: "education", label: "Education", icon: "education" },
];

export function HomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    addFavorite,
    removeFavorite,
    isFavorite,
    addToHistory,
  } = useAppStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [sortBy, setSortBy] = useState<"views" | "date" | "duration">("views");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const loadTrendingVideos = React.useCallback(
    async (reset: boolean = false) => {
      try {
        if (reset) {
          setLoading(true);
        }
        const trendingVideos = await videoService.getTrendingVideos(
          selectedCategory
        );
        if (reset) {
          setVideos(trendingVideos);
        } else {
          setVideos((prev) => [...prev, ...trendingVideos]);
        }
      } catch (error) {
        // Error loading videos
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    setVideos([]);
    loadTrendingVideos(true);
  }, [selectedCategory, loadTrendingVideos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrendingVideos(true);
    setRefreshing(false);
  };

  const handleLoadMore = React.useCallback(() => {
    if (!loadingMore && !loading) {
      setLoadingMore(true);
      loadTrendingVideos(false);
    }
  }, [loadingMore, loading, loadTrendingVideos]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("Search");
    }
  };

  const handleVideoPress = (video: Video) => {
    addToHistory(video);
    navigation.navigate("VideoDetails", { video });
  };

  const handleFavoriteToggle = (video: Video) => {
    if (isFavorite(video.id)) {
      removeFavorite(video.id);
    } else {
      addFavorite(video.id);
    }
  };

  const sortedVideos = React.useMemo(() => {
    const sorted = [...videos];
    switch (sortBy) {
      case "views":
        return sorted.sort((a, b) => b.views - a.views);
      case "date":
        return sorted.sort((a, b) =>
          b.publishedAt.localeCompare(a.publishedAt)
        );
      case "duration":
        return sorted.sort((a, b) => {
          const aDur = a.duration
            .split(":")
            .reduce((acc, time) => 60 * acc + +time, 0);
          const bDur = b.duration
            .split(":")
            .reduce((acc, time) => 60 * acc + +time, 0);
          return bDur - aDur;
        });
      default:
        return sorted;
    }
  }, [videos, sortBy]);

  const handleDownload = async (video: Video) => {
    // Navigate to video details for download
    navigation.navigate("VideoDetails", { video });
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      Alert.alert("Invalid URL", "Please enter a valid video URL");
      return;
    }

    setUrlLoading(true);
    try {
      const videoInfo = await videoService.getVideoInfoFromUrl(urlInput.trim());

      // Format duration from seconds to MM:SS
      const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      };

      // Navigate to video details with the extracted info
      navigation.navigate("VideoDetails", {
        video: {
          id: videoInfo.id,
          title: videoInfo.title,
          description: videoInfo.description || "No description available",
          thumbnail: videoInfo.thumbnail,
          duration: formatDuration(videoInfo.duration),
          channelName: videoInfo.uploader,
          publishedAt: videoInfo.uploadDate,
          views: videoInfo.viewCount || 0,
          url: urlInput.trim(),
        },
      });

      setShowUrlModal(false);
      setUrlInput("");
    } catch (error: any) {
      console.error("Error processing URL:", error);
      Alert.alert("Error", error.message || "Failed to process video URL");
    } finally {
      setUrlLoading(false);
    }
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonItem}>
          <Skeleton width="100%" height={180} style={styles.skeletonThumb} />
          <Skeleton width="80%" height={20} style={styles.skeletonTitle} />
          <Skeleton width="60%" height={16} style={styles.skeletonMeta} />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Logo size={40} showText={false} animate={false} />
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          VidFlow
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search videos..."
          onFocus={handleSearch}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Chip
              label={item.label}
              leftIcon={
                <Icon
                  name={item.icon as any}
                  size={16}
                  color={
                    selectedCategory === item.id
                      ? colors.primary
                      : colors.text.secondary
                  }
                />
              }
              selected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
              style={{
                marginLeft: index === 0 ? spacing.lg : 0,
                marginRight: spacing.sm,
              }}
            />
          )}
        />
      </View>

      {/* Sort Options */}
      {videos.length > 0 && (
        <View style={styles.sortContainer}>
          <Text style={[styles.sortLabel, { color: colors.text.secondary }]}>
            Sort by:
          </Text>
          <View style={styles.sortChips}>
            <Chip
              label="Views"
              selected={sortBy === "views"}
              onPress={() => setSortBy("views")}
              style={{ marginRight: spacing.xs }}
            />
            <Chip
              label="Date"
              selected={sortBy === "date"}
              onPress={() => setSortBy("date")}
              style={{ marginRight: spacing.xs }}
            />
            <Chip
              label="Duration"
              selected={sortBy === "duration"}
              onPress={() => setSortBy("duration")}
            />
          </View>
        </View>
      )}

      {/* Content */}
      {loading && videos.length === 0 ? (
        renderSkeletonLoader()
      ) : videos.length === 0 ? (
        <EmptyState
          icon={<Icon name="video" size={64} color={colors.text.secondary} />}
          title="No Videos Found"
          description="Try selecting a different category"
          actionLabel="Refresh"
          onAction={handleRefresh}
        />
      ) : (
        <FlatList
          data={sortedVideos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <VideoCard
                thumbnail={item.thumbnail}
                title={item.title}
                channelName={item.channelName}
                views={item.views}
                duration={item.duration}
                publishedAt={item.publishedAt}
                onPress={() => handleVideoPress(item)}
                onDownload={() => handleDownload(item)}
              />
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => handleFavoriteToggle(item)}
              >
                <Text style={styles.favoriteIcon}>
                  {isFavorite(item.id) ? "❤️" : "🤍"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.videoList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <LoadingSpinner message="Loading more..." />
              </View>
            ) : null
          }
        />
      )}

      {/* Floating Action Button for URL Input */}
      <FloatingActionButton
        icon="⬇"
        onPress={() => setShowUrlModal(true)}
        style={styles.fab}
      />

      {/* URL Input Modal */}
      <Modal
        visible={showUrlModal}
        onClose={() => {
          setShowUrlModal(false);
          setUrlInput("");
        }}
        title="Download from URL"
      >
        <View style={styles.modalContent}>
          <Text
            style={[styles.modalDescription, { color: colors.text.secondary }]}
          >
            Paste a video URL from YouTube, Instagram, TikTok, Twitter, or any
            supported platform
          </Text>

          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={urlInput}
            onChangeText={setUrlInput}
            multiline
            numberOfLines={3}
            style={styles.urlInput}
          />

          <View style={styles.modalButtons}>
            <Button
              variant="outline"
              onPress={() => {
                setShowUrlModal(false);
                setUrlInput("");
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>

            <Button
              onPress={handleUrlSubmit}
              loading={urlLoading}
              disabled={!urlInput.trim() || urlLoading}
              style={styles.modalButton}
            >
              {urlLoading ? "Processing..." : "Get Video"}
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoriesContainer: {
    marginBottom: spacing.lg,
  },
  videoList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skeletonItem: {
    marginBottom: spacing.lg,
  },
  skeletonThumb: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  skeletonTitle: {
    marginBottom: spacing.xs,
  },
  skeletonMeta: {
    marginBottom: spacing.sm,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
  },
  sortContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  sortLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.sm,
  },
  sortChips: {
    flexDirection: "row",
    flex: 1,
    flexWrap: "nowrap",
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: spacing.xs,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalDescription: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  urlInput: {
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
