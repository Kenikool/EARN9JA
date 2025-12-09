import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";
import { IconButton } from "./IconButton";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  onClose?: () => void;
  style?: ViewStyle;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  message,
  onClose,
  style,
}) => {
  const { colors } = useTheme();

  const variantColors = {
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  const variantIcons = {
    info: "ℹ",
    success: "✓",
    warning: "⚠",
    error: "✕",
  };

  const backgroundColor = variantColors[variant] + "15";
  const borderColor = variantColors[variant];
  const icon = variantIcons[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderLeftColor: borderColor,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color: borderColor }]}>{icon}</Text>
      </View>

      <View style={styles.content}>
        {title && (
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semibold,
              },
            ]}
          >
            {title}
          </Text>
        )}
        <Text
          style={[
            styles.message,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.regular,
            },
          ]}
        >
          {message}
        </Text>
      </View>

      {onClose && (
        <IconButton
          icon="✕"
          onPress={onClose}
          size="sm"
          variant="ghost"
          style={styles.closeButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: spacing.sm,
  },
});
