import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle, G, Polygon } from "react-native-svg";

interface Props {
  size?: number;
}

export const WatchIllustration: React.FC<Props> = ({ size = 300 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        {/* TV/Monitor */}
        <Rect
          x="50"
          y="60"
          width="200"
          height="140"
          rx="12"
          fill="#1a1a1a"
          stroke="#2196F3"
          strokeWidth="4"
        />

        {/* Screen */}
        <Rect x="65" y="75" width="170" height="110" rx="6" fill="#E3F2FD" />

        {/* Play button on screen */}
        <Circle cx="150" cy="130" r="30" fill="#2196F3" opacity="0.9" />
        <Polygon points="140,115 140,145 165,130" fill="white" />

        {/* Stand */}
        <Rect x="130" y="200" width="40" height="30" rx="4" fill="#2196F3" />
        <Rect x="100" y="230" width="100" height="10" rx="5" fill="#2196F3" />

        {/* Popcorn */}
        <G>
          <Path
            d="M 240 180 L 250 240 L 280 240 L 290 180 Z"
            fill="#FFE0B2"
            stroke="#FF9800"
            strokeWidth="3"
          />
          <Circle cx="250" cy="175" r="8" fill="#FFCC80" />
          <Circle cx="265" cy="172" r="8" fill="#FFCC80" />
          <Circle cx="280" cy="175" r="8" fill="#FFCC80" />
          <Circle cx="258" cy="165" r="7" fill="#FFCC80" />
          <Circle cx="272" cy="165" r="7" fill="#FFCC80" />
        </G>

        {/* Remote control */}
        <G>
          <Rect
            x="20"
            y="180"
            width="40"
            height="80"
            rx="8"
            fill="#424242"
            stroke="#2196F3"
            strokeWidth="2"
          />
          <Circle cx="40" cy="200" r="8" fill="#2196F3" />
          <Rect x="28" y="220" width="24" height="8" rx="4" fill="#666" />
          <Rect x="28" y="235" width="24" height="8" rx="4" fill="#666" />
          <Rect x="28" y="250" width="24" height="8" rx="4" fill="#666" />
        </G>

        {/* Stars/sparkles */}
        <Circle cx="30" cy="50" r="4" fill="#FFD700" />
        <Circle cx="270" cy="50" r="5" fill="#FFD700" />
        <Circle cx="280" cy="150" r="4" fill="#FFD700" />
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
