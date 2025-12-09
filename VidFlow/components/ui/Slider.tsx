import React from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  ViewStyle,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  style?: ViewStyle;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  style,
}) => {
  const { colors } = useTheme();
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const position = React.useRef(new Animated.Value(0)).current;

  const normalizedValue = ((value - min) / (max - min)) * 100;

  React.useEffect(() => {
    position.setValue((normalizedValue / 100) * sliderWidth);
  }, [normalizedValue, sliderWidth]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        updateValue(gestureState.x0);
      },
      onPanResponderMove: (_, gestureState) => {
        updateValue(gestureState.moveX);
      },
    })
  ).current;

  const updateValue = (x: number) => {
    if (sliderWidth === 0) return;

    const percentage = Math.max(0, Math.min(1, x / sliderWidth));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    onValueChange(clampedValue);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.medium,
              },
            ]}
          >
            {label}
          </Text>
          {showValue && (
            <Text
              style={[
                styles.value,
                {
                  color: colors.primary,
                  fontFamily: typography.fontFamily.semibold,
                },
              ]}
            >
              {value}
            </Text>
          )}
        </View>
      )}

      <View
        style={styles.sliderContainer}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.trackFill,
              {
                backgroundColor: colors.primary,
                width: `${normalizedValue}%`,
              },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.primary,
              left: position,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.base,
  },
  value: {
    fontSize: typography.fontSize.base,
  },
  sliderContainer: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
  },
  thumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
