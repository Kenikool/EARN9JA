# UI Component Library - Complete Component List

## Theme System

### Theme Provider

```typescript
interface Theme {
  mode: "light" | "dark" | "system";
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

interface ColorPalette {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

// Light Theme
const lightTheme: ColorPalette = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  primary: "#2196F3",
  secondary: "#E91E63",
  text: {
    primary: "#212121",
    secondary: "#757575",
    disabled: "#BDBDBD",
  },
  border: "#E0E0E0",
  error: "#F44336",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",
};

// Dark Theme
const darkTheme: ColorPalette = {
  background: "#121212",
  surface: "#1E1E1E",
  primary: "#64B5F6",
  secondary: "#F48FB1",
  text: {
    primary: "#FFFFFF",
    secondary: "#B0B0B0",
    disabled: "#666666",
  },
  border: "#333333",
  error: "#EF5350",
  success: "#66BB6A",
  warning: "#FFA726",
  info: "#42A5F5",
};
```

### Spacing System

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};
```

## Core Components

### 1. Button Component

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress: () => void;
  children: React.ReactNode;
}
```

**Variants:**

- Primary: Solid background with primary color
- Secondary: Solid background with secondary color
- Outline: Transparent with border
- Ghost: Transparent, no border
- Danger: Red color for destructive actions

### 2. Card Component

```typescript
interface CardProps {
  variant: "elevated" | "outlined" | "filled";
  padding?: keyof typeof spacing;
  children: React.ReactNode;
  onPress?: () => void;
}
```

### 3. Input Component

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}
```

### 4. VideoCard Component

```typescript
interface VideoCardProps {
  thumbnail: string;
  title: string;
  channelName: string;
  views: number;
  duration: string;
  publishedAt: string;
  onPress: () => void;
  onDownload: () => void;
  showDownloadButton?: boolean;
}
```

### 5. ProgressBar Component

```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}
```

### 6. Badge Component

```typescript
interface BadgeProps {
  variant: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
}
```

### 7. Avatar Component

```typescript
interface AvatarProps {
  source: string | { uri: string };
  size: "sm" | "md" | "lg" | "xl";
  fallback?: string; // Initials
  onPress?: () => void;
}
```

### 8. Chip Component

```typescript
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  leftIcon?: React.ReactNode;
  variant: "filled" | "outlined";
}
```
