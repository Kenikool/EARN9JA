import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  placeholder?: string;
  loading?: boolean;
  debounceMs?: number;
  autoFocus?: boolean;
  onFocus?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  placeholder = "Search...",
  loading = false,
  debounceMs = 500,
  autoFocus = false,
  onFocus,
}) => {
  const { theme, spacing, typography, borderRadius } = useTheme();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
        onSearch?.(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue, debounceMs]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue("");
    onChangeText("");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text.primary,
            fontSize: typography.fontSize.base,
            marginLeft: spacing.sm,
            flex: 1,
          },
        ]}
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor={theme.text.disabled}
        autoFocus={autoFocus}
        onFocus={onFocus}
      />
      {loading && <ActivityIndicator color={theme.primary} />}
      {localValue.length > 0 && !loading && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Text style={[styles.clearIcon, { color: theme.text.secondary }]}>
            ×
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 20,
  },
  input: {},
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 24,
  },
});
