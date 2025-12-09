import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "./theme/ThemeProvider";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius: customBorderRadius,
  style,
}) => {
  const { theme, borderRadius } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return { opacity };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: theme.surface,
          borderRadius: customBorderRadius ?? borderRadius.md,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.border },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export const SkeletonVideoCard: React.FC = () => {
  const { spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Skeleton width="100%" height={200} borderRadius={12} />
      <View style={{ marginTop: spacing.sm, flexDirection: "row" }}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Skeleton
            width="80%"
            height={16}
            style={{ marginBottom: spacing.xs }}
          />
          <Skeleton width="60%" height={14} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
