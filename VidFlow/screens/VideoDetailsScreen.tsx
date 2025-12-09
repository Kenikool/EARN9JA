import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Badge,
  Avatar,
  BottomSheet,
  QualitySelector,
  useTheme,
  Icon,
} from "../components/ui";
import { useAppStore, Video, DownloadedVideo } from "../store/appStore";
import { videoService } from "../services/videoService";
import { spacing } from "../components/ui/theme/spacing";
import { typography } from "../components/ui/theme/typography";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";

interface VideoDetailsScreenProps {
  route?: {
    params?: {
      video: Video;
      isDownloaded?: boolean;
    };
  };
  navigation?: any;
}

export function VideoDetailsScreen({
  route,
  navigation,
}: VideoDetailsScreenProps) {
  const { colors } = useTheme();
  const { video, isDownloaded = false } = route?.params || {
    video: {} as Video,
  };
  const { downloads, addDownload, downloadQuality } = useAppStore();

  const [showQualitySheet, setShowQualitySheet] = useState(false);
  const [qualities, setQualities] = useState<any[]>([]);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const { addFavorite, removeFavorite, isFavorite } = useAppStore();

  const loadVideoQualities = React.useCallback(async () => {
    try {
      // If video has a URL, load real qualities from backend
      if (video.url) {
        const realQualities = await videoService.getAvailableQualities(
          video.url
        );
        const formattedQualities = realQualities.map((q: string) => ({
          id: q,
          resolution: q,
          quality: q.includes("1080") || q.includes("best") ? "HD" : "SD",
          fileSize: "Unknown",
          isPremium: false,
        }));
        setQualities(formattedQualities);
        setSelectedQuality(formattedQualities[0]?.id || "best");
      } else {
        // Fallback to mock qualities
        const videoQualities = await videoService.getVideoQualities(video.id);
        setQualities(videoQualities);
        if (downloadQuality === "auto") {
          setSelectedQuality(videoQualities[1]?.id || "720p");
        } else {
          const preferredQuality = videoQualities.find(
            (q) => q.id === downloadQuality
          );
          setSelectedQuality(preferredQuality?.id || videoQualities[0]?.id);
        }
      }
    } catch (error) {
      console.error("Error loading qualities:", error);
    }
  }, [video.id, video.url, downloadQuality]);

  useEffect(() => {
    loadVideoQualities();
    loadRelatedVideos();
  }, [loadVideoQualities]);

  const loadRelatedVideos = async () => {
    try {
      const related = await videoService.getTrendingVideos("trending");
      setRelatedVideos(related.slice(0, 5));
    } catch {
      // Error loading related
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite(video.id)) {
      removeFavorite(video.id);
    } else {
      addFavorite(video.id);
    }
  };

  const handleDownload = () => {
    if (qualities.length === 0) {
      Alert.alert("Error", "No download qualities available");
      return;
    }
    setShowQualitySheet(true);
  };

  const handleQualitySelect = (quality: any) => {
    setSelectedQuality(quality.id);
  };

  const formatQualitiesForSelector = () => {
    return qualities.map((q) => ({
      id: q.id,
      resolution: q.resolution || q.id,
      quality: q.quality || "SD",
      fileSize: q.fileSize || "Unknown",
      isPremium: q.isPremium || false,
    }));
  };

  const startDownload = () => {
    const selectedQualityData = qualities.find((q) => q.id === selectedQuality);
    if (!selectedQualityData) return;

    const downloadVideo: DownloadedVideo = {
      ...video,
      downloadedAt: new Date().toISOString(),
      filePath: `/storage/VidFlow/${video.id}.mp4`,
      fileSize: selectedQualityData.fileSize,
      quality: selectedQualityData.quality,
      progress: 0,
      status: "downloading",
    };

    addDownload(downloadVideo);
    setShowQualitySheet(false);

    Alert.alert(
      "Download Started",
      `${video.title} has been added to your downloads.`,
      [
        { text: "OK" },
        {
          text: "View Downloads",
          onPress: () => navigation.navigate("Downloads"),
        },
      ]
    );
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const isAlreadyDownloaded = downloads.some((d) => d.id === video.id);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={styles.content}>
        {/* Video Thumbnail */}
        <TouchableOpacity
          style={styles.thumbnailContainer}
          onPress={() => {
            if (video.url) {
              // Open video in browser for streaming
              import("react-native").then(({ Linking }) => {
                Linking.openURL(video.url);
              });
            }
          }}
          activeOpacity={0.9}
        >
          <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />

          {/* Play Button Overlay */}
          {video.url && (
            <View style={styles.playButtonOverlay}>
              <View style={styles.playButton}>
                <Icon name="play" size={40} color="white" />
              </View>
            </View>
          )}

          <View style={styles.durationBadge}>
            <Badge variant="info">{video.duration}</Badge>
          </View>
        </TouchableOpacity>

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {video.title}
          </Text>

          <View style={styles.metadata}>
            <Text style={[styles.views, { color: colors.text.secondary }]}>
              {formatViews(video.views)} • {video.publishedAt}
            </Text>
          </View>

          {/* Channel Info */}
          <View style={styles.channelInfo}>
            <Avatar
              source={{
                uri: `https://picsum.photos/100/100?random=${video.channelName}`,
              }}
              size="md"
              fallback={video.channelName.charAt(0)}
            />
            <View style={styles.channelDetails}>
              <Text
                style={[styles.channelName, { color: colors.text.primary }]}
              >
                {video.channelName}
              </Text>
              <Text
                style={[
                  styles.subscriberCount,
                  { color: colors.text.secondary },
                ]}
              >
                1.2M subscribers
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {!isDownloaded && (
              <Button
                variant={isAlreadyDownloaded ? "outline" : "primary"}
                onPress={handleDownload}
                disabled={isAlreadyDownloaded}
                style={styles.actionButton}
              >
                {isAlreadyDownloaded ? "Downloaded" : "Download"}
              </Button>
            )}

            <Button
              variant="outline"
              onPress={handleFavoriteToggle}
              style={styles.actionButton}
            >
              {isFavorite(video.id) ? "Saved" : "Save"}
            </Button>

            <Button
              variant="outline"
              onPress={() => {
                if (video.url) {
                  import("react-native").then(({ Share }) => {
                    Share.share({
                      message: `Check out this video: ${video.title}\n${video.url}`,
                      url: video.url,
                    });
                  });
                }
              }}
              style={styles.actionButton}
            >
              Share
            </Button>
          </View>

          {/* Description */}
          {video.description && (
            <View style={styles.descriptionContainer}>
              <Text
                style={[styles.description, { color: colors.text.secondary }]}
                numberOfLines={isDescriptionExpanded ? undefined : 3}
              >
                {video.description}
              </Text>
              <Button
                variant="ghost"
                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                style={styles.expandButton}
              >
                {isDescriptionExpanded ? "Show less" : "Show more"}
              </Button>
            </View>
          )}

          {/* Related Videos */}
          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, { color: colors.text.primary }]}>
              Related Videos
            </Text>
            <FlatList
              horizontal
              data={relatedVideos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.relatedCard}
                  onPress={() =>
                    navigation.push("VideoDetails", { video: item })
                  }
                >
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.relatedThumbnail}
                  />
                  <Text
                    style={[
                      styles.relatedVideoTitle,
                      { color: colors.text.primary },
                    ]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.relatedChannel,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {item.channelName}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            />
          </View>
        </View>
      </ScrollView>

      {/* Quality Selection Bottom Sheet */}
      <BottomSheet
        visible={showQualitySheet}
        onClose={() => setShowQualitySheet(false)}
      >
        <View style={styles.qualityContainer}>
          <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>
            Select Quality
          </Text>
          <QualitySelector
            options={formatQualitiesForSelector()}
            selectedId={selectedQuality}
            onSelect={handleQualitySelect}
          />
          <Button
            variant="primary"
            onPress={startDownload}
            style={styles.confirmButton}
          >
            Start Download
          </Button>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  thumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
  },
  videoInfo: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.sm,
  },
  metadata: {
    marginBottom: spacing.lg,
  },
  views: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  channelInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  channelDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  channelName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
  },
  subscriberCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
  descriptionContainer: {
    marginTop: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 22,
  },
  expandButton: {
    marginTop: spacing.sm,
  },
  relatedSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  relatedTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  qualityContainer: {
    padding: spacing.lg,
  },
  confirmButton: {
    marginTop: spacing.lg,
  },
  sheetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  relatedList: {
    gap: spacing.md,
  },
  relatedCard: {
    width: 160,
    marginRight: spacing.sm,
  },
  relatedThumbnail: {
    width: 160,
    height: 90,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  relatedVideoTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  relatedChannel: {
    fontSize: typography.fontSize.xs,
  },
});
