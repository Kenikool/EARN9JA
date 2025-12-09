import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "./theme/ThemeProvider";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "primary",
  size = "md",
  children,
  style,
}) => {
  const { theme, spacing, typography, borderRadius } = useTheme();

  const getVariantColor = () => {
    switch (variant) {
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.secondary;
      case "success":
        return theme.success;
      case "warning":
        return theme.warning;
      case "error":
        return theme.error;
      case "info":
        return theme.info;
    }
  };

  const getSizeStyles = (): ViewStyle & TextStyle => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: spacing.xs / 2,
          paddingHorizontal: spacing.xs,
          fontSize: typography.fontSize.xs,
        };
      case "md":
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          fontSize: typography.fontSize.sm,
        };
      case "lg":
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: typography.fontSize.base,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getVariantColor() + "20",
          borderRadius: borderRadius.sm,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getVariantColor(),
            fontSize: sizeStyles.fontSize,
            fontWeight: typography.fontWeight.semibold,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
  text: {},
});
