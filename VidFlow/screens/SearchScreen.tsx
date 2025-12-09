import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SearchBar,
  VideoCard,
  LoadingSpinner,
  EmptyState,
  IconButton,
  Chip,
  useTheme,
  Icon,
} from "../components/ui";
import { useAppStore, Video } from "../store/appStore";
import { videoService } from "../services/videoService";
import { spacing } from "../components/ui/theme/spacing";
import { typography } from "../components/ui/theme/typography";

const popularSearches = [
  "JavaScript course",
  "Workout routine",
  "Movie trailers",
  "Tech reviews",
  "DIY projects",
];

const durationFilters = [
  { id: "all", label: "All" },
  { id: "short", label: "< 4 min" },
  { id: "medium", label: "4-20 min" },
  { id: "long", label: "> 20 min" },
];

export function SearchScreen({ navigation }: any) {
  const { colors } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
  } = useAppStore();
  const [hasSearched, setHasSearched] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [durationFilter, setDurationFilter] = useState("all");

  const isValidUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleSearch = React.useCallback(
    async (query?: string) => {
      const searchTerm = query || searchQuery;
      if (!searchTerm.trim()) return;

      try {
        setIsSearching(true);
        setHasSearched(true);
        addSearchHistory(searchTerm);

        // Check if the query is a URL
        if (isValidUrl(searchTerm.trim())) {
          // Handle URL search
          const videoInfo = await videoService.getVideoInfoFromUrl(
            searchTerm.trim()
          );

          // Format duration from seconds to MM:SS
          const formatDuration = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, "0")}`;
          };

          const videoResult = {
            id: videoInfo.id,
            title: videoInfo.title,
            description: videoInfo.description || "No description available",
            thumbnail: videoInfo.thumbnail,
            duration: formatDuration(videoInfo.duration),
            channelName: videoInfo.uploader,
            publishedAt: videoInfo.uploadDate,
            views: videoInfo.viewCount || 0,
            url: searchTerm.trim(),
          };
          setSearchResults([videoResult]);
        } else {
          // Handle regular text search
          const results = await videoService.searchVideos(searchTerm);
          setSearchResults(results);
        }
      } catch (error: any) {
        console.error("Search failed:", error);
        Alert.alert(
          "Search Failed",
          error.message || "Failed to search videos"
        );
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, setIsSearching, setSearchResults, addSearchHistory]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.trim() && localQuery !== searchQuery) {
        setSearchQuery(localQuery);
        handleSearch(localQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, setSearchQuery, handleSearch]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickSearch = (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleVideoPress = (video: Video) => {
    navigation.navigate("VideoDetails", { video });
  };

  const handleDownload = async (video: Video) => {
    // Navigate to video details for download
    navigation.navigate("VideoDetails", { video });
  };

  const clearSearch = () => {
    setLocalQuery("");
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderSuggestionItem = (item: string, type: string) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleQuickSearch(item)}
    >
      <View style={styles.suggestionContent}>
        <Icon
          name={type === "recent" ? "clock" : "fire"}
          size={16}
          color={colors.text.secondary}
        />
        <Text style={[styles.suggestionText, { color: colors.text.secondary }]}>
          {item}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleClearHistory = () => {
    clearSearchHistory();
  };

  const filteredResults = React.useMemo(() => {
    if (durationFilter === "all") return searchResults;

    return searchResults.filter((video) => {
      const duration = video.duration
        .split(":")
        .reduce((acc, time) => 60 * acc + +time, 0);
      switch (durationFilter) {
        case "short":
          return duration < 240;
        case "medium":
          return duration >= 240 && duration <= 1200;
        case "long":
          return duration > 1200;
        default:
          return true;
      }
    });
  }, [searchResults, durationFilter]);

  const renderSearchSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      {searchHistory.length > 0 && (
        <View style={styles.suggestionSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Recent Searches
            </Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={[styles.clearText, { color: colors.primary }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchHistory}
            keyExtractor={(item, index) => `recent-${index}`}
            renderItem={({ item }) => renderSuggestionItem(item, "recent")}
          />
        </View>
      )}

      <View style={styles.suggestionSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Popular Searches
        </Text>
        <FlatList
          data={popularSearches}
          keyExtractor={(item, index) => `popular-${index}`}
          renderItem={({ item }) => renderSuggestionItem(item, "popular")}
        />
      </View>
    </View>
  );

  const renderSearchResults = () => {
    if (isSearching) {
      return <LoadingSpinner message="Searching videos..." />;
    }

    if (searchResults.length === 0) {
      return (
        <EmptyState
          icon={<Icon name="search" size={64} color={colors.text.secondary} />}
          title="No Results Found"
          description="No videos found for your search"
          actionLabel="Clear Search"
          onAction={clearSearch}
        />
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsHeader, { color: colors.text.primary }]}>
          {filteredResults.length} results for {searchQuery}
        </Text>

        {/* Duration Filter */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={durationFilters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Chip
                label={item.label}
                selected={durationFilter === item.id}
                onPress={() => setDurationFilter(item.id)}
                style={{ marginRight: spacing.sm }}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
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
          )}
          contentContainerStyle={styles.videoList}
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={localQuery}
            onChangeText={setLocalQuery}
            placeholder="Search videos..."
            autoFocus
          />
        </View>
        {localQuery.length > 0 && (
          <IconButton
            icon="✕"
            onPress={clearSearch}
            size="sm"
            variant="ghost"
          />
        )}
      </View>

      {/* Content */}
      {!hasSearched ? renderSearchSuggestions() : renderSearchResults()}
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
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  suggestionSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  suggestionItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  suggestionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  videoList: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  clearText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
