import React from "react";
import Svg, {
  Rect,
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
} from "react-native-svg";

interface AppIconProps {
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 1024 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id="appGradient" x1="0" y1="0" x2="1024" y2="1024">
          <Stop offset="0%" stopColor="#2196F3" />
          <Stop offset="100%" stopColor="#E91E63" />
        </LinearGradient>
      </Defs>

      {/* Rounded square background */}
      <Rect width="1024" height="1024" rx="180" fill="url(#appGradient)" />

      {/* Play button triangle */}
      <Polygon points="350,300 350,724 724,512" fill="white" />

      {/* Download arrow */}
      <Path
        d="M 512 550 L 512 750"
        stroke="white"
        strokeWidth="60"
        strokeLinecap="round"
      />
      <Path
        d="M 420 660 L 512 750 L 604 660"
        stroke="white"
        strokeWidth="60"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Accent circles */}
      <Circle cx="800" cy="224" r="40" fill="white" opacity="0.3" />
      <Circle cx="224" cy="800" r="35" fill="white" opacity="0.25" />
    </Svg>
  );
};
