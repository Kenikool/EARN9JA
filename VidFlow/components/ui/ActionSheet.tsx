import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ActionSheetOption {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
  message?: string;
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  options,
  title,
  message,
  cancelLabel = "Cancel",
}) => {
  const { colors } = useTheme();
  const translateY = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const handleOptionPress = (option: ActionSheetOption) => {
    if (!option.disabled) {
      option.onPress();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              transform: [{ translateY }],
            },
          ]}
        >
          {(title || message) && (
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              {title && (
                <Text
                  style={[
                    styles.title,
                    {
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.semibold,
                    },
                  ]}
                >
                  {title}
                </Text>
              )}
              {message && (
                <Text
                  style={[
                    styles.message,
                    {
                      color: colors.text.secondary,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  {message}
                </Text>
              )}
            </View>
          )}

          <View style={styles.options}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  {
                    borderBottomColor: colors.border,
                    opacity: option.disabled ? 0.5 : 1,
                  },
                  index === options.length - 1 && styles.lastOption,
                ]}
                onPress={() => handleOptionPress(option)}
                disabled={option.disabled}
                activeOpacity={0.7}
              >
                {option.icon && (
                  <View style={styles.optionIcon}>{option.icon}</View>
                )}
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: option.destructive
                        ? colors.error
                        : colors.text.primary,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
              },
            ]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.cancelText,
                {
                  color: colors.text.primary,
                  fontFamily: typography.fontFamily.semibold,
                },
              ]}
            >
              {cancelLabel}
            </Text>
          </TouchableOpacity>
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
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.lg,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  message: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
  options: {
    paddingTop: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    marginRight: spacing.md,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    flex: 1,
  },
  cancelButton: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderTopWidth: 1,
    alignItems: "center",
  },
  cancelText: {
    fontSize: typography.fontSize.base,
  },
});
