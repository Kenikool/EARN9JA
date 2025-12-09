import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTheme } from "./theme/ThemeProvider";

interface VideoCardProps {
  thumbnail: string;
  title: string;
  channelName: string;
  views: number;
  duration: string;
  publishedAt: string;
  onPress: () => void;
  onDownload?: () => void;
  showDownloadButton?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  thumbnail,
  title,
  channelName,
  views,
  duration,
  publishedAt,
  onPress,
  onDownload,
  showDownloadButton = true,
}) => {
  const { theme, spacing, typography, borderRadius, shadows } = useTheme();

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.md,
          ...shadows.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: thumbnail }}
          style={[styles.thumbnail, { borderRadius: borderRadius.lg }]}
        />
        <View
          style={[
            styles.durationBadge,
            {
              backgroundColor: "rgba(0,0,0,0.8)",
              borderRadius: borderRadius.sm,
              padding: spacing.xs,
            },
          ]}
        >
          <Text
            style={[
              styles.duration,
              {
                color: "#FFFFFF",
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold,
              },
            ]}
          >
            {duration}
          </Text>
        </View>
        {showDownloadButton && onDownload && (
          <TouchableOpacity
            style={[
              styles.downloadButton,
              {
                backgroundColor: theme.primary,
                borderRadius: borderRadius.full,
                padding: spacing.sm,
              },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onDownload();
            }}
          >
            <Text style={styles.downloadIcon}>⬇</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.info, { padding: spacing.md }]}>
        <Text
          style={[
            styles.title,
            {
              color: theme.text.primary,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.xs,
            },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.channel,
            {
              color: theme.text.secondary,
              fontSize: typography.fontSize.sm,
              marginBottom: spacing.xs / 2,
            },
          ]}
        >
          {channelName}
        </Text>
        <Text
          style={[
            styles.metadata,
            {
              color: theme.text.secondary,
              fontSize: typography.fontSize.xs,
            },
          ]}
        >
          {formatViews(views)} views • {publishedAt}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  duration: {},
  downloadButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  downloadIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  info: {},
  title: {},
  channel: {},
  metadata: {},
});
