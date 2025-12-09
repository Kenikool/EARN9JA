import React from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "./theme/ThemeProvider";

type CardVariant = "elevated" | "outlined" | "filled";

interface CardProps {
  variant?: CardVariant;
  padding?: keyof typeof import("./theme/spacing").spacing;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  variant = "elevated",
  padding = "md",
  children,
  onPress,
  style,
}) => {
  const { theme, spacing, borderRadius, shadows } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: theme.card,
          ...shadows.md,
        };
      case "outlined":
        return {
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case "filled":
        return {
          backgroundColor: theme.surface,
        };
    }
  };

  const cardStyles: ViewStyle = {
    ...getVariantStyles(),
    padding: spacing[padding],
    borderRadius: borderRadius.lg,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, cardStyles, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, cardStyles, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
});
