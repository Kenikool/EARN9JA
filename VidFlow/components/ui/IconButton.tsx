import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = "md",
  variant = "default",
  disabled = false,
  loading = false,
  style,
}) => {
  const { colors } = useTheme();

  const sizeMap = {
    sm: { button: 32, icon: 16 },
    md: { button: 40, icon: 20 },
    lg: { button: 48, icon: 24 },
  };

  const dimensions = sizeMap[size];

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "ghost":
        return "transparent";
      default:
        return colors.card;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: dimensions.button,
          height: dimensions.button,
          backgroundColor: getBackgroundColor(),
          borderRadius: dimensions.button / 2,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text.primary} />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
});
