import React, { useEffect, useRef } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { shadows } from "./theme/shadows";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentages of screen height (e.g., [0.3, 0.6, 0.9])
  initialSnapPoint?: number; // Index of initial snap point
  enableBackdropPress?: boolean;
  showHandle?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [0.5, 0.9],
  initialSnapPoint = 0,
  enableBackdropPress = true,
  showHandle = true,
}) => {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const currentSnapIndex = useRef(initialSnapPoint);
  const sheetHeight = useRef(
    SCREEN_HEIGHT * snapPoints[initialSnapPoint]
  ).current;

  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      closeSheet();
    }
  }, [visible]);

  const openSheet = () => {
    const targetHeight = SCREEN_HEIGHT * snapPoints[currentSnapIndex.current];
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT - targetHeight,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const snapToPoint = (index: number) => {
    if (index < 0 || index >= snapPoints.length) return;

    currentSnapIndex.current = index;
    const targetHeight = SCREEN_HEIGHT * snapPoints[index];

    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT - targetHeight,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const currentHeight =
          SCREEN_HEIGHT * snapPoints[currentSnapIndex.current];
        const newY = SCREEN_HEIGHT - currentHeight + gestureState.dy;

        if (
          newY >=
            SCREEN_HEIGHT - SCREEN_HEIGHT * snapPoints[snapPoints.length - 1] &&
          newY <= SCREEN_HEIGHT
        ) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        const currentHeight =
          SCREEN_HEIGHT * snapPoints[currentSnapIndex.current];
        const draggedY = gestureState.dy;

        // Close if dragged down significantly
        if (draggedY > 100 && velocity > 0.5) {
          onClose();
          return;
        }

        // Find nearest snap point
        let nearestIndex = currentSnapIndex.current;
        let minDistance = Infinity;

        snapPoints.forEach((point, index) => {
          const snapHeight = SCREEN_HEIGHT * point;
          const distance = Math.abs(currentHeight - draggedY - snapHeight);

          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        });

        snapToPoint(nearestIndex);
      },
    })
  ).current;

  const handleBackdropPress = () => {
    if (enableBackdropPress) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              transform: [{ translateY }],
            },
            shadows.large,
          ]}
          {...panResponder.panHandlers}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View
                style={[styles.handle, { backgroundColor: colors.border }]}
              />
            </View>
          )}

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
