import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle, G } from "react-native-svg";

interface Props {
  size?: number;
}

export const EmptySearchIllustration: React.FC<Props> = ({ size = 200 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* Large magnifying glass */}
        <Circle
          cx="80"
          cy="80"
          r="50"
          stroke="#2196F3"
          strokeWidth="6"
          fill="none"
        />
        <Path
          d="M 118 118 L 160 160"
          stroke="#2196F3"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Question mark inside */}
        <Path
          d="M 70 65 Q 80 55 90 65 Q 95 75 80 85 L 80 95"
          stroke="#E91E63"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx="80" cy="105" r="3" fill="#E91E63" />

        {/* Floating video icons */}
        <G opacity="0.3">
          <Rect x="140" y="40" width="30" height="20" rx="4" fill="#2196F3" />
          <Path d="M 170 45 L 180 50 L 170 55 Z" fill="#2196F3" />
        </G>
        <G opacity="0.3">
          <Rect x="30" y="140" width="30" height="20" rx="4" fill="#E91E63" />
          <Path d="M 60 145 L 70 150 L 60 155 Z" fill="#E91E63" />
        </G>
      </Svg>
      <Text style={styles.title}>No Results Found</Text>
      <Text style={styles.subtitle}>Try searching with different keywords</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});
