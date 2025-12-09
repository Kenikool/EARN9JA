import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Path, Circle, G } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  size?: number;
}

export const EmptyDownloadsIllustration: React.FC<Props> = ({ size = 200 }) => {
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const glassAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Arrow bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glass pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glassAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glassAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [arrowAnim, glassAnim]);

  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* Folder */}
        <Path
          d="M 40 60 L 40 160 L 160 160 L 160 80 L 120 80 L 110 60 Z"
          fill="#E3F2FD"
          stroke="#2196F3"
          strokeWidth="3"
        />

        {/* Download arrow in center - animated */}
        <AnimatedG opacity="0.6" translateY={arrowTranslate}>
          <Path
            d="M 100 90 L 100 130"
            stroke="#2196F3"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <Path
            d="M 85 115 L 100 130 L 115 115"
            stroke="#2196F3"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </AnimatedG>

        {/* Magnifying glass - animated */}
        <AnimatedCircle
          cx="140"
          cy="140"
          r="18"
          stroke="#2196F3"
          strokeWidth="4"
          fill="none"
          scale={glassAnim}
          origin="140, 140"
        />
        <Path
          d="M 152 152 L 170 170"
          stroke="#2196F3"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.title}>No Downloads Yet</Text>
      <Text style={styles.subtitle}>
        Start downloading videos to watch offline
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
