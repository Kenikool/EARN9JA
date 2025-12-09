import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { shadows } from "./theme/shadows";

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  size?: "md" | "lg";
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  position = "bottom-right",
  size = "lg",
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();
  };

  const sizeMap = {
    md: { button: 56, icon: 24 },
    lg: { button: 64, icon: 28 },
  };

  const dimensions = sizeMap[size];

  const positionStyles = {
    "bottom-right": { bottom: 20, right: 20 },
    "bottom-left": { bottom: 20, left: 20 },
    "bottom-center": { bottom: 20, alignSelf: "center" as const },
  };

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyles[position],
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: dimensions.button,
            height: dimensions.button,
            borderRadius: dimensions.button / 2,
            backgroundColor: colors.primary,
          },
          shadows.large,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text
          style={[
            styles.icon,
            {
              fontSize: dimensions.icon,
              color: "#FFFFFF",
            },
          ]}
        >
          {icon}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontWeight: "bold",
  },
});
