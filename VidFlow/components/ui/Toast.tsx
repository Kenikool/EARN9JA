import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useTheme } from "./theme/ThemeProvider";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = "info",
  duration = 3000,
  onDismiss,
}) => {
  const { theme, spacing, typography, borderRadius, shadows } = useTheme();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    translateY.value = withSequence(
      withTiming(0, { duration: 300 }),
      withTiming(0, { duration }),
      withTiming(-100, { duration: 300 })
    );

    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration + 600);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getVariantColor = () => {
    switch (variant) {
      case "success":
        return theme.success;
      case "error":
        return theme.error;
      case "warning":
        return theme.warning;
      case "info":
        return theme.info;
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: theme.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: getVariantColor(),
          ...shadows.lg,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.icon,
          {
            color: getVariantColor(),
            fontSize: typography.fontSize.xl,
            marginRight: spacing.sm,
          },
        ]}
      >
        {getIcon()}
      </Text>
      <Text
        style={[
          styles.message,
          {
            color: theme.text.primary,
            fontSize: typography.fontSize.base,
            flex: 1,
          },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999,
  },
  icon: {},
  message: {},
});
