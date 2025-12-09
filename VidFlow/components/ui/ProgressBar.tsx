import React, { useEffect } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "./theme/ThemeProvider";

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 8,
  showPercentage = false,
  animated = true,
  style,
}) => {
  const { theme, borderRadius, spacing, typography } = useTheme();
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = animated
      ? withTiming(Math.min(Math.max(progress, 0), 100), { duration: 300 })
      : Math.min(Math.max(progress, 0), 100);
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  const progressColor = color || theme.primary;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.surface,
            borderRadius: borderRadius.full,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: progressColor,
              borderRadius: borderRadius.full,
            },
            animatedStyle,
          ]}
        />
      </View>
      {showPercentage && (
        <Text
          style={[
            styles.percentage,
            {
              color: theme.text.secondary,
              fontSize: typography.fontSize.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  track: {
    overflow: "hidden",
  },
  fill: {},
  percentage: {
    textAlign: "right",
  },
});
