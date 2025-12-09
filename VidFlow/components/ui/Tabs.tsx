import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  style?: ViewStyle;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTabId, style }) => {
  const { colors } = useTheme();
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.tabList, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTabId(tab.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontFamily: isActive
                      ? typography.fontFamily.semibold
                      : typography.fontFamily.regular,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tabContent}>{activeTab?.content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabList: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: -1,
  },
  tabLabel: {
    fontSize: typography.fontSize.base,
  },
  tabContent: {
    flex: 1,
    padding: spacing.lg,
  },
});
