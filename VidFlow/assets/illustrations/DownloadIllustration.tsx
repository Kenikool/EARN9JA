import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

interface Props {
  size?: number;
}

export const DownloadIllustration: React.FC<Props> = ({ size = 300 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <Defs>
          <LinearGradient id="downloadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#2196F3" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1976D2" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Cloud */}
        <Path
          d="M 100 80 Q 80 60 100 50 Q 120 40 150 50 Q 180 40 200 50 Q 220 60 200 80 L 100 80 Z"
          fill="#E3F2FD"
          stroke="#2196F3"
          strokeWidth="3"
        />

        {/* Large download arrow */}
        <Path
          d="M 150 90 L 150 180"
          stroke="url(#downloadGrad)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <Path
          d="M 120 150 L 150 180 L 180 150"
          stroke="url(#downloadGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Device/folder at bottom */}
        <Rect
          x="80"
          y="200"
          width="140"
          height="80"
          rx="12"
          fill="#BBDEFB"
          stroke="#2196F3"
          strokeWidth="3"
        />

        {/* Progress bars inside folder */}
        <Rect x="100" y="220" width="100" height="8" rx="4" fill="#E3F2FD" />
        <Rect x="100" y="220" width="60" height="8" rx="4" fill="#2196F3" />

        <Rect x="100" y="240" width="100" height="8" rx="4" fill="#E3F2FD" />
        <Rect x="100" y="240" width="80" height="8" rx="4" fill="#2196F3" />

        <Rect x="100" y="260" width="100" height="8" rx="4" fill="#E3F2FD" />
        <Rect x="100" y="260" width="40" height="8" rx="4" fill="#2196F3" />

        {/* Checkmark */}
        <Circle cx="250" cy="100" r="20" fill="#4CAF50" />
        <Path
          d="M 242 100 L 248 106 L 258 94"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
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
