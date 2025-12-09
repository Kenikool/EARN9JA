import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  size?: AvatarSize;
  fallback?: string;
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = "md",
  fallback,
  onPress,
}) => {
  const { theme, typography, borderRadius } = useTheme();

  const getSizeValue = () => {
    switch (size) {
      case "sm":
        return 32;
      case "md":
        return 48;
      case "lg":
        return 64;
      case "xl":
        return 96;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return typography.fontSize.sm;
      case "md":
        return typography.fontSize.lg;
      case "lg":
        return typography.fontSize.xl;
      case "xl":
        return typography.fontSize["3xl"];
    }
  };

  const sizeValue = getSizeValue();

  const content = (
    <View
      style={[
        styles.avatar,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: borderRadius.full,
          backgroundColor: theme.primary,
          borderWidth: 2,
          borderColor: theme.border,
        },
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: borderRadius.full,
            },
          ]}
        />
      ) : (
        <Text
          style={[
            styles.fallback,
            {
              color: theme.text.inverse,
              fontSize: getFontSize(),
              fontWeight: typography.fontWeight.semibold,
            },
          ]}
        >
          {fallback || "?"}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {},
  fallback: {},
});
