import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ViewStyle,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  style?: ViewStyle;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  style,
}) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  return (
    <>
      <TouchableOpacity
        style={style}
        onPress={() => setVisible(!visible)}
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          setLayout({ x, y, width, height });
        }}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.tooltip,
              {
                backgroundColor: colors.text,
                top: layout.y - 40,
                left: layout.x + layout.width / 2 - 50,
              },
            ]}
          >
            <Text
              style={[
                styles.tooltipText,
                {
                  color: colors.background,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              {content}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  tooltip: {
    position: "absolute",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    maxWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
});
