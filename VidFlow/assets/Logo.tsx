import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, {
  Path,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
  Polygon,
} from "react-native-svg";

interface Props {
  size?: number;
  showText?: boolean;
  animate?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

export const Logo: React.FC<Props> = ({
  size = 100,
  showText = true,
  animate = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate play button
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Download arrow bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animate, pulseAnim, rotateAnim, arrowAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  return (
    <Svg
      width={size}
      height={showText ? size * 1.3 : size}
      viewBox="0 0 100 130"
      fill="none"
    >
      <Defs>
        <LinearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2196F3" stopOpacity="1" />
          <Stop offset="100%" stopColor="#E91E63" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2196F3" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#E91E63" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>

      {/* Outer glow */}
      <AnimatedCircle
        cx="50"
        cy="50"
        r="48"
        fill="url(#glowGrad)"
        opacity={pulseAnim}
      />

      {/* Main circle */}
      <Circle cx="50" cy="50" r="45" fill="url(#primaryGrad)" />

      {/* Play button (triangle) */}
      <AnimatedPolygon
        points="38,35 38,65 65,50"
        fill="white"
        rotation={rotation}
        origin="50, 50"
      />

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

      {/* Accent sparkles */}
      <Circle cx="70" cy="30" r="3" fill="white" opacity="0.8" />
      <Circle cx="75" cy="36" r="2" fill="white" opacity="0.6" />
      <Circle cx="30" cy="70" r="2.5" fill="white" opacity="0.7" />

      {showText && (
        <>
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
        </>
      )}
    </Svg>
  );
};
