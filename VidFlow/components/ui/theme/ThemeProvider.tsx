import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, Theme } from "./colors";
import { spacing, Spacing } from "./spacing";
import { typography, Typography } from "./typography";
import { shadows, borderRadius, Shadows, BorderRadius } from "./shadows";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  colors: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  spacing: Spacing;
  typography: Typography;
  shadows: Shadows;
  borderRadius: BorderRadius;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const isDark =
    mode === "dark" || (mode === "system" && systemColorScheme === "dark");

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value: ThemeContextType = {
    theme,
    colors: theme,
    mode,
    isDark,
    setMode,
    toggleTheme,
    spacing,
    typography,
    shadows,
    borderRadius,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
