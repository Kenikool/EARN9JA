import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";
import { Badge } from "./Badge";

export interface QualityOption {
  id: string;
  resolution: string;
  quality: string;
  fileSize: string;
  isPremium?: boolean;
}

interface QualitySelectorProps {
  options: QualityOption[];
  selectedId?: string;
  onSelect: (option: QualityOption) => void;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  options,
  selectedId,
  onSelect,
}) => {
  const { colors } = useTheme();

  const getQualityBadgeVariant = (quality: string) => {
    if (quality.includes("8K")) return "error";
    if (quality.includes("4K")) return "warning";
    if (quality.includes("HD")) return "success";
    return "secondary";
  };

  return (
    <ScrollView style={styles.container}>
      {options.map((option) => {
        const isSelected = option.id === selectedId;

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              {
                backgroundColor: isSelected
                  ? colors.primary + "15"
                  : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.leftSection}>
                <Text
                  style={[
                    styles.resolution,
                    {
                      color: isSelected ? colors.primary : colors.text.primary,
                      fontFamily: typography.fontFamily.semibold,
                    },
                  ]}
                >
                  {option.resolution}
                </Text>
                <Text
                  style={[styles.fileSize, { color: colors.text.secondary }]}
                >
                  {option.fileSize}
                </Text>
              </View>

              <View style={styles.rightSection}>
                <Badge
                  variant={getQualityBadgeVariant(option.quality)}
                  size="sm"
                >
                  {option.quality}
                </Badge>
                {option.isPremium && (
                  <Badge
                    variant="warning"
                    size="sm"
                    style={styles.premiumBadge}
                  >
                    Premium
                  </Badge>
                )}
              </View>
            </View>

            {isSelected && (
              <View
                style={[
                  styles.selectedIndicator,
                  { backgroundColor: colors.primary },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    position: "relative",
    overflow: "hidden",
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
  },
  resolution: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.xs,
  },
  fileSize: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  premiumBadge: {
    marginLeft: spacing.xs,
  },
  selectedIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});
