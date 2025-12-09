import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { ProgressBar } from "./ProgressBar";

interface DownloadCardProps {
  thumbnail: string;
  title: string;
  progress: number;
  downloadSpeed?: string;
  eta?: string;
  status: "downloading" | "paused" | "completed" | "error";
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  thumbnail,
  title,
  progress,
  downloadSpeed,
  eta,
  status,
  onPause,
  onResume,
  onCancel,
}) => {
  const { theme, spacing, typography, borderRadius, shadows } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case "downloading":
        return theme.primary;
      case "paused":
        return theme.warning;
      case "completed":
        return theme.success;
      case "error":
        return theme.error;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.md,
          ...shadows.sm,
        },
      ]}
    >
      <View style={styles.content}>
        <Image
          source={{ uri: thumbnail }}
          style={[
            styles.thumbnail,
            {
              borderRadius: borderRadius.md,
              width: 80,
              height: 60,
            },
          ]}
        />
        <View style={[styles.info, { marginLeft: spacing.md, flex: 1 }]}>
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
          <ProgressBar
            progress={progress}
            color={getStatusColor()}
            height={6}
          />
          <View style={[styles.metadata, { marginTop: spacing.xs }]}>
            <Text
              style={[
                styles.metadataText,
                {
                  color: theme.text.secondary,
                  fontSize: typography.fontSize.xs,
                },
              ]}
            >
              {status === "downloading" &&
                downloadSpeed &&
                `${downloadSpeed} • ${eta}`}
              {status === "paused" && "Paused"}
              {status === "completed" && "Completed"}
              {status === "error" && "Error"}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.actions, { marginTop: spacing.sm }]}>
        {status === "downloading" && onPause && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.warning + "20",
                borderRadius: borderRadius.md,
                padding: spacing.sm,
                marginRight: spacing.sm,
              },
            ]}
            onPress={onPause}
          >
            <Text style={{ color: theme.warning }}>⏸ Pause</Text>
          </TouchableOpacity>
        )}
        {status === "paused" && onResume && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.primary + "20",
                borderRadius: borderRadius.md,
                padding: spacing.sm,
                marginRight: spacing.sm,
              },
            ]}
            onPress={onResume}
          >
            <Text style={{ color: theme.primary }}>▶ Resume</Text>
          </TouchableOpacity>
        )}
        {onCancel && status !== "completed" && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.error + "20",
                borderRadius: borderRadius.md,
                padding: spacing.sm,
              },
            ]}
            onPress={onCancel}
          >
            <Text style={{ color: theme.error }}>✕ Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {},
  content: {
    flexDirection: "row",
  },
  thumbnail: {},
  info: {},
  title: {},
  metadata: {},
  metadataText: {},
  actions: {
    flexDirection: "row",
  },
  actionButton: {},
});
