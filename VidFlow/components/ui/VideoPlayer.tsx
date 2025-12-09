import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface VideoPlayerProps {
  source: string;
  thumbnail?: string;
  onFullscreen?: () => void;
  onQualityChange?: () => void;
  onSubtitleToggle?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  thumbnail,
  onFullscreen,
  onQualityChange,
  onSubtitleToggle,
}) => {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number) => {
    setProgress(value);
    setCurrentTime((value / 100) * duration);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Video Container */}
      <View style={styles.videoContainer}>
        <TouchableOpacity
          style={styles.videoTouchable}
          onPress={() => setShowControls(!showControls)}
          activeOpacity={1}
        >
          {/* Placeholder for actual video */}
          <View
            style={[
              styles.videoPlaceholder,
              { backgroundColor: colors.border },
            ]}
          >
            {isLoading && (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
          </View>

          {/* Controls Overlay */}
          {showControls && (
            <View style={styles.controlsOverlay}>
              {/* Top Controls */}
              <View style={styles.topControls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    { backgroundColor: "rgba(0,0,0,0.5)" },
                  ]}
                  onPress={onQualityChange}
                >
                  <Text style={[styles.controlText, { color: "#fff" }]}>
                    HD
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    { backgroundColor: "rgba(0,0,0,0.5)" },
                  ]}
                  onPress={onSubtitleToggle}
                >
                  <Text style={[styles.controlText, { color: "#fff" }]}>
                    CC
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Center Play/Pause */}
              <TouchableOpacity
                style={styles.centerControl}
                onPress={handlePlayPause}
              >
                <View
                  style={[
                    styles.playButton,
                    { backgroundColor: "rgba(0,0,0,0.6)" },
                  ]}
                >
                  <Text style={[styles.playIcon, { color: "#fff" }]}>
                    {isPlaying ? "❚❚" : "▶"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Bottom Controls */}
              <View
                style={[
                  styles.bottomControls,
                  { backgroundColor: "rgba(0,0,0,0.7)" },
                ]}
              >
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: "rgba(255,255,255,0.3)" },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${progress}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Time and Controls */}
                <View style={styles.bottomRow}>
                  <Text style={[styles.timeText, { color: "#fff" }]}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                  <TouchableOpacity
                    style={styles.fullscreenButton}
                    onPress={onFullscreen}
                  >
                    <Text style={[styles.controlText, { color: "#fff" }]}>
                      ⛶
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  videoTouchable: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: spacing.md,
    gap: spacing.sm,
  },
  controlButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  controlText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  centerControl: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
  },
  bottomControls: {
    padding: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  fullscreenButton: {
    padding: spacing.sm,
  },
});
