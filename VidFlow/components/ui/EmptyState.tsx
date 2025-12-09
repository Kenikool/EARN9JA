import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Text
        style={[
          styles.title,
          {
            color: colors.text.primary,
            fontFamily: typography.fontFamily.semibold,
          },
        ]}
      >
        {title}
      </Text>

      {description && (
        <Text
          style={[
            styles.description,
            {
              color: colors.text.secondary,
              fontFamily: typography.fontFamily.regular,
            },
          ]}
        >
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    textAlign: "center",
    marginBottom: spacing.lg,
    maxWidth: 300,
  },
  button: {
    marginTop: spacing.md,
  },
});
