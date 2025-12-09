import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

interface SettingsRowProps {
  label: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightElement?: "arrow" | "toggle" | "value" | React.ReactNode;
  value?: string | boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  description,
  leftIcon,
  rightElement = "arrow",
  value,
  onPress,
  onToggle,
}) => {
  const { colors } = useTheme();

  const renderRightElement = () => {
    if (React.isValidElement(rightElement)) {
      return rightElement;
    }

    switch (rightElement) {
      case "toggle":
        return (
          <Switch
            value={value as boolean}
            onValueChange={onToggle}
            trackColor={{
              false: colors.border,
              true: colors.primary + "80",
            }}
            thumbColor={value ? colors.primary : colors.text.secondary}
          />
        );
      case "value":
        return (
          <Text style={[styles.valueText, { color: colors.text.secondary }]}>
            {value as string}
          </Text>
        );
      case "arrow":
        return (
          <Text style={[styles.arrow, { color: colors.text.secondary }]}>
            ›
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.leftSection}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text.primary,
                fontFamily: typography.fontFamily.medium,
              },
            ]}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={[styles.description, { color: colors.text.secondary }]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>{renderRightElement()}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xs / 2,
  },
  description: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  rightSection: {
    marginLeft: spacing.md,
  },
  valueText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  arrow: {
    fontSize: 24,
    fontFamily: typography.fontFamily.regular,
  },
});
