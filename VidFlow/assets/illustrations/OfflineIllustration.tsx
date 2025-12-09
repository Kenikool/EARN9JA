import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle, G } from "react-native-svg";

interface Props {
  size?: number;
}

export const OfflineIllustration: React.FC<Props> = ({ size = 200 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* Cloud */}
        <Path
          d="M 60 100 Q 50 80 70 70 Q 80 60 100 70 Q 120 60 130 70 Q 150 80 140 100 Z"
          fill="#E3F2FD"
          stroke="#2196F3"
          strokeWidth="3"
        />

        {/* WiFi symbol with X */}
        <G>
          <Path
            d="M 100 120 Q 80 110 70 120"
            stroke="#FF5252"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 100 120 Q 120 110 130 120"
            stroke="#FF5252"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 100 130 Q 75 115 60 130"
            stroke="#FF5252"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <Path
            d="M 100 130 Q 125 115 140 130"
            stroke="#FF5252"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <Circle cx="100" cy="145" r="5" fill="#FF5252" />
        </G>

        {/* X mark */}
        <Path
          d="M 85 155 L 115 175 M 115 155 L 85 175"
          stroke="#FF5252"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Device outline */}
        <Rect
          x="50"
          y="40"
          width="100"
          height="70"
          rx="8"
          fill="none"
          stroke="#2196F3"
          strokeWidth="3"
          opacity="0.3"
        />
      </Svg>
      <Text style={styles.title}>You're Offline</Text>
      <Text style={styles.subtitle}>
        Check your internet connection and try again
      </Text>
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
