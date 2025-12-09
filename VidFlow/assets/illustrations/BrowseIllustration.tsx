import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle, G, Polygon } from "react-native-svg";

interface Props {
  size?: number;
}

export const BrowseIllustration: React.FC<Props> = ({ size = 300 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        {/* Search bar */}
        <Rect
          x="50"
          y="50"
          width="200"
          height="40"
          rx="20"
          fill="#E3F2FD"
          stroke="#2196F3"
          strokeWidth="3"
        />
        <Circle cx="220" cy="70" r="12" fill="#2196F3" />
        <Path
          d="M 215 65 L 225 75"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Video grid */}
        <G>
          {/* Row 1 */}
          <Rect x="50" y="110" width="85" height="60" rx="8" fill="#BBDEFB" />
          <Polygon points="70,130 70,150 85,140" fill="#2196F3" />

          <Rect x="155" y="110" width="85" height="60" rx="8" fill="#F8BBD0" />
          <Polygon points="175,130 175,150 190,140" fill="#E91E63" />

          {/* Row 2 */}
          <Rect x="50" y="185" width="85" height="60" rx="8" fill="#C5CAE9" />
          <Polygon points="70,205 70,225 85,215" fill="#5C6BC0" />

          <Rect x="155" y="185" width="85" height="60" rx="8" fill="#FFE0B2" />
          <Polygon points="175,205 175,225 190,215" fill="#FF9800" />
        </G>

        {/* Floating icons */}
        <Circle cx="260" cy="120" r="8" fill="#4CAF50" opacity="0.6" />
        <Circle cx="40" cy="200" r="6" fill="#9C27B0" opacity="0.6" />
        <Circle cx="270" cy="230" r="7" fill="#FF5722" opacity="0.6" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
