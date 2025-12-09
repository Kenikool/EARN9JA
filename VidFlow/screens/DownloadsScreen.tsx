import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DownloadCard,
  EmptyState,
  IconButton,
  TabBar,
  ActionSheet,
  SearchBar,
  Chip,
  useTheme,
  Icon,
} from "../components/ui";
import { EmptyDownloadsIllustration } from "../assets/illustrations";
import { useAppStore, DownloadedVideo } from "../store/appStore";
import { spacing } from "../components/ui/theme/spacing";
import { typography } from "../components/ui/theme/typography";

const tabs = [
  { id: "all", label: "All" },
  { id: "downloading", label: "Downloading" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

export function DownloadsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { downloads, updateDownload, removeDownload } = useAppStore();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<DownloadedVideo | null>(
    null
  );
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const { sortBy, setSortBy } = useAppStore();

  const filteredDownloads = React.useMemo(() => {
    let filtered = downloads.filter((download) => {
      // Filter by tab
      let matchesTab = true;
      switch (activeTab) {
        case "downloading":
          matchesTab =
            download.status === "downloading" || download.status === "paused";
          break;
        case "completed":
          matchesTab = download.status === "completed";
          break;
        case "failed":
          matchesTab = download.status === "error";
          break;
      }

      // Filter by search query
      const matchesSearch =
        searchQuery.trim() === "" ||
        download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        download.channelName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });

    // Sort downloads
    switch (sortBy) {
      case "date":
        filtered.sort(
          (a, b) =>
            new Date(b.downloadedAt).getTime() -
            new Date(a.downloadedAt).getTime()
        );
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "size":
        filtered.sort((a, b) => {
          const aSize = parseInt(a.fileSize.match(/\d+/)?.[0] || "0");
          const bSize = parseInt(b.fileSize.match(/\d+/)?.[0] || "0");
          return bSize - aSize;
        });
        break;
    }

    return filtered;
  }, [downloads, activeTab, searchQuery, sortBy]);

  const handleVideoPress = (video: DownloadedVideo) => {
    if (multiSelectMode) {
      toggleVideoSelection(video.id);
    } else if (video.status === "completed") {
      navigation.navigate("VideoDetails", { video, isDownloaded: true });
    } else {
      setSelectedVideo(video);
      setShowActionSheet(true);
    }
  };

  const handleLongPress = (video: DownloadedVideo) => {
    if (!multiSelectMode) {
      setMultiSelectMode(true);
      setSelectedVideos(new Set([video.id]));
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      if (newSet.size === 0) {
        setMultiSelectMode(false);
      }
      return newSet;
    });
  };

  const handleBatchDelete = () => {
    Alert.alert(
      "Delete Videos",
      `Are you sure you want to delete ${selectedVideos.size} video(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            selectedVideos.forEach((id) => removeDownload(id));
            setSelectedVideos(new Set());
            setMultiSelectMode(false);
          },
        },
      ]
    );
  };

  const cancelMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedVideos(new Set());
  };

  const handlePause = (videoId: string) => {
    updateDownload(videoId, { status: "paused" });
  };

  const handleResume = (videoId: string) => {
    updateDownload(videoId, { status: "downloading" });
    simulateDownloadProgress(videoId);
  };

  const handleCancel = (videoId: string) => {
    Alert.alert(
      "Cancel Download",
      "Are you sure you want to cancel this download?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => removeDownload(videoId),
        },
      ]
    );
  };

  const handleRetry = (videoId: string) => {
    updateDownload(videoId, { status: "downloading", progress: 0 });
    simulateDownloadProgress(videoId);
  };

  const handleDelete = (videoId: string) => {
    Alert.alert("Delete Video", "Are you sure you want to delete this video?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeDownload(videoId),
      },
    ]);
  };

  const simulateDownloadProgress = (videoId: string) => {
    const interval = setInterval(() => {
      const download = downloads.find((d) => d.id === videoId);
      if (!download || download.status !== "downloading") {
        clearInterval(interval);
        return;
      }

      const newProgress = Math.min(download.progress + Math.random() * 10, 100);
      updateDownload(videoId, {
        progress: newProgress,
        status: newProgress >= 100 ? "completed" : "downloading",
      });

      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 1000);
  };

  const getActionSheetOptions = () => {
    if (!selectedVideo) return [];

    const options = [];

    switch (selectedVideo.status) {
      case "downloading":
        options.push(
          {
            label: "Pause Download",
            onPress: () => handlePause(selectedVideo.id),
            icon: "⏸",
          },
          {
            label: "Cancel Download",
            onPress: () => handleCancel(selectedVideo.id),
            icon: "✕",
            destructive: true,
          }
        );
        break;
      case "paused":
        options.push(
          {
            label: "Resume Download",
            onPress: () => handleResume(selectedVideo.id),
            icon: "▶",
          },
          {
            label: "Cancel Download",
            onPress: () => handleCancel(selectedVideo.id),
            icon: "✕",
            destructive: true,
          }
        );
        break;
      case "error":
        options.push(
          {
            label: "Retry Download",
            onPress: () => handleRetry(selectedVideo.id),
            icon: (
              <Icon name="refresh" size={20} color={colors.text.secondary} />
            ),
          },
          {
            label: "Remove from List",
            onPress: () => removeDownload(selectedVideo.id),
            icon: <Icon name="delete" size={20} color={colors.error} />,
            destructive: true,
          }
        );
        break;
      case "completed":
        options.push(
          {
            label: "Play Video",
            onPress: () => handleVideoPress(selectedVideo),
            icon: "▶",
          },
          {
            label: "Delete Video",
            onPress: () => handleDelete(selectedVideo.id),
            icon: <Icon name="delete" size={20} color={colors.error} />,
            destructive: true,
          }
        );
        break;
    }

    return options;
  };

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case "downloading":
        return downloads.filter(
          (d) => d.status === "downloading" || d.status === "paused"
        ).length;
      case "completed":
        return downloads.filter((d) => d.status === "completed").length;
      case "failed":
        return downloads.filter((d) => d.status === "error").length;
      default:
        return downloads.length;
    }
  };

  const getTotalStorage = () => {
    const totalBytes = downloads
      .filter((d) => d.status === "completed")
      .reduce((sum, d) => {
        const sizeMatch = d.fileSize.match(/(\d+)/);
        return sum + (sizeMatch ? parseInt(sizeMatch[1]) : 0);
      }, 0);
    return `${(totalBytes / 1024).toFixed(2)} GB`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        {multiSelectMode ? (
          <>
            <IconButton
              icon="✕"
              onPress={cancelMultiSelect}
              size="sm"
              variant="ghost"
            />
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              {selectedVideos.size} selected
            </Text>
            <IconButton
              icon={
                <Icon name="delete" size={20} color={colors.text.secondary} />
              }
              onPress={handleBatchDelete}
              size="sm"
              variant="ghost"
            />
          </>
        ) : (
          <>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              Downloads
            </Text>
            {downloads.length > 0 && (
              <IconButton
                icon="⋯"
                onPress={() => setMultiSelectMode(true)}
                size="sm"
                variant="ghost"
              />
            )}
          </>
        )}
      </View>

      {downloads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyDownloadsIllustration size={250} />
          <EmptyState
            icon={
              <Icon name="download" size={64} color={colors.text.secondary} />
            }
            title="No Downloads Yet"
            description="Start downloading videos to watch offline"
          />
        </View>
      ) : (
        <>
          {/* Storage Indicator */}
          <View style={styles.storageIndicator}>
            <Text
              style={[styles.storageText, { color: colors.text.secondary }]}
            >
              Storage: {getTotalStorage()} / 10 GB
            </Text>
          </View>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search downloads..."
            />
          </View>

          {/* Sort Options */}
          <View style={styles.sortContainer}>
            <Text style={[styles.sortLabel, { color: colors.text.secondary }]}>
              Sort:
            </Text>
            <View style={styles.sortChips}>
              <Chip
                label="Date"
                selected={sortBy === "date"}
                onPress={() => setSortBy("date")}
              />
              <Chip
                label="Name"
                selected={sortBy === "name"}
                onPress={() => setSortBy("name")}
              />
              <Chip
                label="Size"
                selected={sortBy === "size"}
                onPress={() => setSortBy("size")}
              />
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TabBar
              tabs={tabs.map((tab) => ({
                ...tab,
                label: `${tab.label} (${getTabCount(tab.id)})`,
              }))}
              activeTabId={activeTab}
              onTabChange={setActiveTab}
            />
          </View>

          {/* Downloads List */}
          {filteredDownloads.length === 0 ? (
            <EmptyState
              icon={
                <Icon name="inbox" size={64} color={colors.text.secondary} />
              }
              title={`No ${activeTab === "all" ? "" : activeTab} downloads`}
              description={`You don't have any ${
                activeTab === "all" ? "" : activeTab
              } downloads yet`}
            />
          ) : (
            <FlatList
              data={filteredDownloads}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.downloadCardWrapper}
                  onPress={() => handleVideoPress(item)}
                  onLongPress={() => handleLongPress(item)}
                  activeOpacity={0.9}
                >
                  {multiSelectMode && (
                    <View style={styles.checkbox}>
                      <IconButton
                        icon={selectedVideos.has(item.id) ? "☑" : "☐"}
                        onPress={() => toggleVideoSelection(item.id)}
                        size="md"
                        variant="ghost"
                      />
                    </View>
                  )}
                  <DownloadCard
                    thumbnail={item.thumbnail}
                    title={item.title}
                    progress={item.progress}
                    status={item.status}
                    downloadSpeed={
                      item.status === "downloading" ? "2.5 MB/s" : undefined
                    }
                    eta={item.status === "downloading" ? "2 min" : undefined}
                    onPause={() => handlePause(item.id)}
                    onResume={() => handleResume(item.id)}
                    onCancel={() => handleCancel(item.id)}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.downloadsList}
            />
          )}
        </>
      )}

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          setSelectedVideo(null);
        }}
        title={selectedVideo?.title}
        options={getActionSheetOptions()}
      />
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tabsContainer: {
    marginBottom: spacing.md,
  },
  downloadsList: {
    paddingHorizontal: spacing.lg,
  },
  downloadCardWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  checkbox: {
    marginRight: spacing.sm,
  },
  storageIndicator: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: "#f5f5f5",
    marginBottom: spacing.md,
  },
  storageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  sortContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sortLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  sortChips: {
    flexDirection: "row",
    gap: spacing.xs,
  },
});
