import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onValueChange,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = option.value === value;
        const isDisabled = option.disabled || false;

        return (
          <TouchableOpacity
            key={option.value}
            style={styles.option}
            onPress={() => !isDisabled && onValueChange(option.value)}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.radio,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  opacity: isDisabled ? 0.5 : 1,
                },
              ]}
            >
              {isSelected && (
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isDisabled
                    ? colors.text.secondary
                    : colors.text.primary,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: typography.fontSize.base,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
