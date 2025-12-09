import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  thickness?: number;
  spacing?: "none" | "sm" | "md" | "lg";
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  thickness = 1,
  spacing: spacingProp = "md",
  style,
}) => {
  const { colors } = useTheme();

  const spacingMap = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  const marginValue = spacingMap[spacingProp];

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.border,
          ...(orientation === "horizontal"
            ? {
                height: thickness,
                width: "100%",
                marginVertical: marginValue,
              }
            : {
                width: thickness,
                height: "100%",
                marginHorizontal: marginValue,
              }),
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {},
});
