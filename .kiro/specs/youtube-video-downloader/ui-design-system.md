# Custom UI Component Library Design System

## Overview

This document outlines the complete custom UI component library for the YouTube Video Downloader app, similar to design systems like DaisyUI, Material-UI, and Remix. The library includes theme-aware components, branding assets (logos, images), and splashscreen design.

## Design Philosophy

- **Consistency:** All components follow the same design language
- **Theme Awareness:** Full support for light, dark, and system themes
- **Accessibility:** WCAG 2.1 AA compliant
- **Performance:** Optimized for React Native
- **Customizable:** Easy to extend and customize
- **Modern:** Clean, minimal, and contemporary design

## Brand Identity

### App Name

**VidFlow** - YouTube Video Downloader

### Brand Colors

```typescript
const brandColors = {
  primary: {
    50: "#E3F2FD",
    100: "#BBDEFB",
    200: "#90CAF9",
    300: "#64B5F6",
    400: "#42A5F5",
    500: "#2196F3", // Main brand color
    600: "#1E88E5",
    700: "#1976D2",
    800: "#1565C0",
    900: "#0D47A1",
  },
  secondary: {
    50: "#FCE4EC",
    100: "#F8BBD0",
    200: "#F48FB1",
    300: "#F06292",
    400: "#EC407A",
    500: "#E91E63", // Accent color
    600: "#D81B60",
    700: "#C2185B",
    800: "#AD1457",
    900: "#880E4F",
  },
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
};
```

### Logo Design

**Primary Logo:**

- Icon: Play button inside a download arrow
- Colors: Gradient from primary-500 to secondary-500
- Formats: SVG, PNG (1024x1024, 512x512, 192x192)

**Logo Variations:**

- Full logo (icon + text)
- Icon only (for app icon)
- Monochrome (for dark backgrounds)
- White version (for colored backgrounds)

### Typography

```typescript
const typography = {
  fontFamily: {
    primary: "Inter", // Main font
    secondary: "Poppins", // Headings
    mono: "JetBrains Mono", // Code/numbers
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },
  fontWeight: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```
