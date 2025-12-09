import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle, G } from "react-native-svg";

interface Props {
  size?: number;
}

export const ErrorIllustration: React.FC<Props> = ({ size = 200 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* Alert triangle */}
        <Path
          d="M 100 40 L 160 150 L 40 150 Z"
          fill="#FFEBEE"
          stroke="#F44336"
          strokeWidth="4"
        />

        {/* Exclamation mark */}
        <Path
          d="M 100 70 L 100 110"
          stroke="#F44336"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <Circle cx="100" cy="130" r="5" fill="#F44336" />

        {/* Broken video icon */}
        <G opacity="0.4">
          <Rect x="60" y="160" width="40" height="30" rx="4" fill="#F44336" />
          <Path d="M 100 165 L 115 175 L 100 185 Z" fill="#F44336" />
          <Path
            d="M 55 160 L 120 190"
            stroke="#F44336"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <Text style={styles.title}>Something Went Wrong</Text>
      <Text style={styles.subtitle}>
        We couldn't complete your request. Please try again
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
