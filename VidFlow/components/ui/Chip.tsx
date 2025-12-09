import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";

type ChipVariant = "filled" | "outlined";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  leftIcon?: React.ReactNode;
  variant?: ChipVariant;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  leftIcon,
  variant = "filled",
  style,
}) => {
  const { theme, spacing, typography, borderRadius } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    if (variant === "outlined") {
      return {
        backgroundColor: selected ? theme.primary + "20" : "transparent",
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
      };
    }
    return {
      backgroundColor: selected ? theme.primary : theme.surface,
    };
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        getVariantStyles(),
        {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: borderRadius.full,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {leftIcon && <View>{leftIcon}</View>}
      <Text
        style={[
          styles.label,
          {
            color: selected
              ? variant === "filled"
                ? theme.text.inverse
                : theme.primary
              : theme.text.primary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            marginLeft: leftIcon ? spacing.xs : 0,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  label: {
    flexShrink: 0,
    flexWrap: "nowrap",
  },
});
