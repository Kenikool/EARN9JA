import React from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  message,
  fullScreen = false,
  style,
}) => {
  const { colors } = useTheme();

  const Container = fullScreen ? View : React.Fragment;
  const containerProps = fullScreen
    ? {
        style: [
          styles.fullScreenContainer,
          { backgroundColor: colors.background },
        ],
      }
    : {};

  return (
    <Container {...containerProps}>
      <View style={[styles.container, style]}>
        <ActivityIndicator size={size} color={colors.primary} />
        {message && (
          <Text
            style={[
              styles.message,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
              },
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    textAlign: "center",
  },
});
