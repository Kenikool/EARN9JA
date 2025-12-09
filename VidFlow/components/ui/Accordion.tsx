import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon,
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotateAnim = React.useRef(
    new Animated.Value(defaultExpanded ? 1 : 0)
  ).current;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);

    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        {icon && (
          <Text style={[styles.icon, { color: colors.primary }]}>{icon}</Text>
        )}
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.semibold,
            },
          ]}
        >
          {title}
        </Text>
        <Animated.Text
          style={[
            styles.chevron,
            {
              color: colors.textSecondary,
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          ⌄
        </Animated.Text>
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.content, { borderTopColor: colors.border }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.base,
  },
  chevron: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
});
