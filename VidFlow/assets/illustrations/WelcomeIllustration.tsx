import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Svg, {
  Rect,
  Circle,
  G,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface Props {
  size?: number;
}

export const WelcomeIllustration: React.FC<Props> = ({ size = 300 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const float1Y = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const float2Y = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.5, 1],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <Defs>
          <LinearGradient id="welcomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2196F3" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E91E63" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Rect
          x="80"
          y="40"
          width="140"
          height="220"
          rx="20"
          fill="white"
          stroke="#2196F3"
          strokeWidth="4"
        />
        <Rect x="100" y="60" width="100" height="180" rx="8" fill="#E3F2FD" />

        <AnimatedCircle
          cx="150"
          cy="150"
          r="35"
          fill="url(#welcomeGrad)"
          scale={pulseAnim}
          origin="150, 150"
        />
        <Polygon points="140,135 140,165 165,150" fill="white" />

        <AnimatedG opacity="0.7" translateY={float1Y}>
          <Rect x="20" y="80" width="50" height="35" rx="6" fill="#2196F3" />
          <Polygon points="70,90 70,110 85,100" fill="white" />
        </AnimatedG>

        <AnimatedG opacity="0.7" translateY={float2Y}>
          <Rect x="230" y="180" width="50" height="35" rx="6" fill="#E91E63" />
          <Polygon points="280,190 280,210 295,200" fill="white" />
        </AnimatedG>

        <AnimatedCircle
          cx="60"
          cy="50"
          r="4"
          fill="#FFD700"
          scale={sparkleScale}
          opacity={sparkleOpacity}
          origin="60, 50"
        />
        <AnimatedCircle
          cx="240"
          cy="70"
          r="5"
          fill="#FFD700"
          scale={sparkleScale}
          opacity={sparkleOpacity}
          origin="240, 70"
        />
        <AnimatedCircle
          cx="50"
          cy="240"
          r="4"
          fill="#FFD700"
          scale={sparkleScale}
          opacity={sparkleOpacity}
          origin="50, 240"
        />
        <AnimatedCircle
          cx="250"
          cy="250"
          r="5"
          fill="#FFD700"
          scale={sparkleScale}
          opacity={sparkleOpacity}
          origin="250, 250"
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
