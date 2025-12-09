import React from "react";
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polyline,
  Polygon,
} from "react-native-svg";
import { ViewStyle } from "react-native";

export type IconName =
  | "download"
  | "play"
  | "pause"
  | "delete"
  | "share"
  | "settings"
  | "search"
  | "filter"
  | "sort"
  | "home"
  | "trending"
  | "music"
  | "gaming"
  | "news"
  | "sports"
  | "education"
  | "hd"
  | "4k"
  | "8k"
  | "check"
  | "close"
  | "chevron-right"
  | "chevron-left"
  | "chevron-up"
  | "chevron-down"
  | "heart"
  | "heart-filled"
  | "star"
  | "star-filled"
  | "user"
  | "menu"
  | "more"
  | "info"
  | "warning"
  | "error"
  | "success"
  | "clock"
  | "fire"
  | "folder"
  | "wifi"
  | "bell"
  | "moon"
  | "lock"
  | "document"
  | "video"
  | "refresh"
  | "inbox"
  | "chart";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "#000",
  style,
}) => {
  const renderIcon = () => {
    switch (name) {
      case "download":
        return (
          <>
            <Path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Polyline
              points="7 10 12 15 17 10"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "play":
        return <Polygon points="5 3 19 12 5 21 5 3" fill={color} />;
      case "pause":
        return (
          <>
            <Rect x="6" y="4" width="4" height="16" fill={color} />
            <Rect x="14" y="4" width="4" height="16" fill={color} />
          </>
        );
      case "delete":
        return (
          <>
            <Polyline
              points="3 6 5 6 21 6"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "share":
        return (
          <>
            <Circle
              cx="18"
              cy="5"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Circle
              cx="6"
              cy="12"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Circle
              cx="18"
              cy="19"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Line
              x1="8.59"
              y1="13.51"
              x2="15.42"
              y2="17.49"
              stroke={color}
              strokeWidth="2"
            />
            <Line
              x1="15.41"
              y1="6.51"
              x2="8.59"
              y2="10.49"
              stroke={color}
              strokeWidth="2"
            />
          </>
        );
      case "settings":
        return (
          <>
            <Circle
              cx="12"
              cy="12"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "search":
        return (
          <>
            <Circle
              cx="11"
              cy="11"
              r="8"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "filter":
        return (
          <Polygon
            points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "sort":
        return (
          <>
            <Line
              x1="12"
              y1="5"
              x2="12"
              y2="19"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Polyline
              points="19 12 12 19 5 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Polyline
              points="5 12 12 5 19 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "home":
        return (
          <>
            <Path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Polyline
              points="9 22 9 12 15 12 15 22"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "trending":
        return (
          <Polyline
            points="23 6 13.5 15.5 8.5 10.5 1 18"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "music":
        return (
          <>
            <Path
              d="M9 18V5l12-2v13"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle
              cx="6"
              cy="18"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Circle
              cx="18"
              cy="16"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </>
        );
      case "gaming":
        return (
          <>
            <Rect
              x="2"
              y="7"
              width="20"
              height="10"
              rx="2"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Circle cx="8" cy="12" r="1" fill={color} />
            <Circle cx="16" cy="10" r="1" fill={color} />
            <Circle cx="18" cy="12" r="1" fill={color} />
          </>
        );
      case "news":
        return (
          <>
            <Path
              d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Line
              x1="10"
              y1="6"
              x2="18"
              y2="6"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Line
              x1="10"
              y1="10"
              x2="18"
              y2="10"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Line
              x1="10"
              y1="14"
              x2="18"
              y2="14"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "sports":
        return (
          <>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M12 2a10 10 0 0 0 0 20M2 12h20"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M12 2c-2.5 3-2.5 9 0 12m0-12c2.5 3 2.5 9 0 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "education":
        return (
          <>
            <Path
              d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "check":
        return (
          <Polyline
            points="20 6 9 17 4 12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "close":
        return (
          <>
            <Line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "chevron-right":
        return (
          <Polyline
            points="9 18 15 12 9 6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "chevron-left":
        return (
          <Polyline
            points="15 18 9 12 15 6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "chevron-up":
        return (
          <Polyline
            points="18 15 12 9 6 15"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "chevron-down":
        return (
          <Polyline
            points="6 9 12 15 18 9"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "heart":
        return (
          <Path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "heart-filled":
        return (
          <Path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill={color}
          />
        );
      case "star":
        return (
          <Polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "star-filled":
        return (
          <Polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={color}
          />
        );
      case "user":
        return (
          <>
            <Path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle
              cx="12"
              cy="7"
              r="4"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </>
        );
      case "menu":
        return (
          <>
            <Line
              x1="3"
              y1="12"
              x2="21"
              y2="12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Line
              x1="3"
              y1="18"
              x2="21"
              y2="18"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "more":
        return (
          <>
            <Circle cx="12" cy="12" r="1" fill={color} />
            <Circle cx="19" cy="12" r="1" fill={color} />
            <Circle cx="5" cy="12" r="1" fill={color} />
          </>
        );
      case "info":
        return (
          <>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Line
              x1="12"
              y1="16"
              x2="12"
              y2="12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Circle cx="12" cy="8" r="1" fill={color} />
          </>
        );
      case "warning":
        return (
          <>
            <Path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Line
              x1="12"
              y1="9"
              x2="12"
              y2="13"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Circle cx="12" cy="17" r="1" fill={color} />
          </>
        );
      case "error":
        return (
          <>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Line
              x1="15"
              y1="9"
              x2="9"
              y2="15"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Line
              x1="9"
              y1="9"
              x2="15"
              y2="15"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "success":
        return (
          <>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Polyline
              points="16 8 10 14 8 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "clock":
        return (
          <>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Polyline
              points="12 6 12 12 16 14"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "fire":
        return (
          <Path
            d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "folder":
        return (
          <Path
            d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "wifi":
        return (
          <>
            <Path
              d="M5 12.55a11 11 0 0 1 14.08 0"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M1.42 9a16 16 0 0 1 21.16 0"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M8.53 16.11a6 6 0 0 1 6.95 0"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx="12" cy="20" r="1" fill={color} />
          </>
        );
      case "bell":
        return (
          <>
            <Path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "moon":
        return (
          <Path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "lock":
        return (
          <>
            <Rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              ry="2"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M7 11V7a5 5 0 0 1 10 0v4"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "document":
        return (
          <>
            <Path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Polyline
              points="14 2 14 8 20 8"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "video":
        return (
          <>
            <Polygon
              points="23 7 16 12 23 17 23 7"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Rect
              x="1"
              y="5"
              width="15"
              height="14"
              rx="2"
              ry="2"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </>
        );
      case "refresh":
        return (
          <>
            <Polyline
              points="23 4 23 10 17 10"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "inbox":
        return (
          <>
            <Polyline
              points="22 12 16 12 14 15 10 15 8 12 2 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "chart":
        return (
          <Polyline
            points="22 12 18 12 15 21 9 3 6 12 2 12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "hd":
      case "4k":
      case "8k":
        return (
          <>
            <Rect
              x="2"
              y="6"
              width="20"
              height="12"
              rx="2"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M7 10v4m0-2h2m0-2v4M15 10h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2v-4z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {renderIcon()}
    </Svg>
  );
};
