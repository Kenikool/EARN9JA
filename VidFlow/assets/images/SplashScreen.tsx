import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Svg, {
  Circle,
  Polygon,
  Path,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface Props {
  onAnimationComplete?: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Pulse effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ),
    ]).start(() => {
      // Animation complete
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 500);
      }
    });

    // Arrow bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <View style={styles.container}>
      <AnimatedSvg
        width="200"
        height="260"
        viewBox="0 0 100 130"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Defs>
          <LinearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2196F3" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E91E63" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2196F3" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#E91E63" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        {/* Outer glow */}
        <AnimatedCircle
          cx="50"
          cy="50"
          r="48"
          fill="url(#glowGrad)"
          scale={pulseAnim}
          origin="50, 50"
        />

        {/* Main circle */}
        <Circle cx="50" cy="50" r="45" fill="url(#splashGrad)" />

        {/* Play button */}
        <Polygon points="38,35 38,65 65,50" fill="white" />

        {/* Download arrow */}
        <G>
          <AnimatedCircle
            cx="50"
            cy="65"
            r="2"
            fill="white"
            translateY={arrowTranslate}
          />
          <Path
            d="M 50 55 L 50 70"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Path
            d="M 44 64 L 50 70 L 56 64"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>

        {/* Sparkles */}
        <Circle cx="70" cy="30" r="3" fill="white" opacity="0.8" />
        <Circle cx="75" cy="36" r="2" fill="white" opacity="0.6" />
        <Circle cx="30" cy="70" r="2.5" fill="white" opacity="0.7" />

        {/* Text */}
        <SvgText
          x="50"
          y="110"
          fontSize="22"
          fontWeight="bold"
          fill="#2196F3"
          textAnchor="middle"
        >
          VidFlow
        </SvgText>
        <SvgText x="50" y="125" fontSize="10" fill="#666" textAnchor="middle">
          Video Downloader
        </SvgText>
      </AnimatedSvg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
