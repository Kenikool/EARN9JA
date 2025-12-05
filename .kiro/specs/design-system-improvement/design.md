# Design System Improvement - Design Document

## Overview

This design document outlines the comprehensive improvements to the Earn9ja mobile app's design system. The goal is to create a modern, cohesive, and scalable design that enhances user experience while maintaining the Nigerian-themed brand identity.

## Architecture

### Design Token System

The design system will be built on a token-based architecture:

```
Design Tokens (constants/)
├── colors.ts (enhanced with semantic tokens)
├── typography.ts (expanded font system)
├── spacing.ts (responsive spacing)
├── shadows.ts (elevation system)
└── animations.ts (motion tokens)

Theme Provider
├── Light Theme
├── Dark Theme
└── Theme Context

Component Library
├── Atoms (Button, Input, Text, etc.)
├── Molecules (Card, ListItem, Header, etc.)
└── Organisms (TaskCard, WalletCard, etc.)
```

## Components and Interfaces

### 1. Enhanced Color System

**Semantic Color Tokens:**

```typescript
colors: {
  // Brand colors
  brand: {
    primary: string
    secondary: string
    accent: string
  }

  // Semantic colors
  semantic: {
    success: string
    warning: string
    error: string
    info: string
  }

  // Surface colors
  surface: {
    background: string
    card: string
    elevated: string
    overlay: string
  }

  // Text colors
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
    disabled: string
  }

  // Interactive colors
  interactive: {
    default: string
    hover: string
    active: string
    disabled: string
  }
}
```

**Dark Mode Implementation:**

- Automatic system preference detection
- Manual toggle in settings
- Smooth transition between modes
- Optimized contrast ratios for readability

### 2. Typography System

**Font Scale:**

```typescript
typography: {
  // Display (hero sections)
  display: {
    large: { size: 48, weight: 'bold', lineHeight: 1.2 }
    medium: { size: 40, weight: 'bold', lineHeight: 1.2 }
    small: { size: 36, weight: 'bold', lineHeight: 1.2 }
  }

  // Headings
  heading: {
    h1: { size: 32, weight: 'bold', lineHeight: 1.25 }
    h2: { size: 28, weight: 'bold', lineHeight: 1.25 }
    h3: { size: 24, weight: 'semibold', lineHeight: 1.3 }
    h4: { size: 20, weight: 'semibold', lineHeight: 1.3 }
    h5: { size: 18, weight: 'semibold', lineHeight: 1.4 }
  }

  // Body text
  body: {
    large: { size: 18, weight: 'normal', lineHeight: 1.6 }
    medium: { size: 16, weight: 'normal', lineHeight: 1.5 }
    small: { size: 14, weight: 'normal', lineHeight: 1.5 }
  }

  // Labels and captions
  label: {
    large: { size: 14, weight: 'medium', lineHeight: 1.4 }
    medium: { size: 12, weight: 'medium', lineHeight: 1.4 }
    small: { size: 10, weight: 'medium', lineHeight: 1.4 }
  }
}
```

### 3. Spacing and Layout System

**Responsive Spacing:**

```typescript
spacing: {
  // Base spacing (4px grid)
  0: 0
  1: 4
  2: 8
  3: 12
  4: 16
  5: 20
  6: 24
  8: 32
  10: 40
  12: 48
  16: 64
  20: 80

  // Semantic spacing
  component: {
    padding: 16
    gap: 12
  }

  screen: {
    horizontal: 20
    vertical: 24
  }

  section: {
    gap: 32
  }
}
```

**Layout Containers:**

- Screen container with safe area insets
- Card container with consistent padding
- List container with proper spacing
- Grid system for responsive layouts

### 4. Elevation and Shadow System

**Shadow Tokens:**

```typescript
shadows: {
  none: { elevation: 0 }
  sm: {
    elevation: 2
    shadowColor: '#000'
    shadowOffset: { width: 0, height: 1 }
    shadowOpacity: 0.05
    shadowRadius: 2
  }
  md: {
    elevation: 4
    shadowColor: '#000'
    shadowOffset: { width: 0, height: 2 }
    shadowOpacity: 0.1
    shadowRadius: 4
  }
  lg: {
    elevation: 8
    shadowColor: '#000'
    shadowOffset: { width: 0, height: 4 }
    shadowOpacity: 0.15
    shadowRadius: 8
  }
  xl: {
    elevation: 12
    shadowColor: '#000'
    shadowOffset: { width: 0, height: 6 }
    shadowOpacity: 0.2
    shadowRadius: 12
  }
}
```

### 5. Animation System

**Motion Tokens:**

```typescript
animations: {
  duration: {
    instant: 100
    fast: 200
    normal: 300
    slow: 500
  }

  easing: {
    linear: [0, 0, 1, 1]
    easeIn: [0.4, 0, 1, 1]
    easeOut: [0, 0, 0.2, 1]
    easeInOut: [0.4, 0, 0.2, 1]
  }

  transitions: {
    fade: { opacity, duration: 'normal', easing: 'easeInOut' }
    slide: { transform, duration: 'normal', easing: 'easeOut' }
    scale: { scale, duration: 'fast', easing: 'easeOut' }
  }
}
```

### 6. Component Library

#### Button Component

```typescript
<Button
  variant="primary" | "secondary" | "outline" | "ghost"
  size="small" | "medium" | "large"
  fullWidth={boolean}
  loading={boolean}
  disabled={boolean}
  icon={ReactNode}
  onPress={function}
>
  Button Text
</Button>
```

**States:**

- Default
- Hover/Press
- Loading
- Disabled
- Focus

#### Card Component

```typescript
<Card
  variant="elevated" | "outlined" | "filled"
  padding="small" | "medium" | "large"
  onPress={function}
>
  Card Content
</Card>
```

**Features:**

- Consistent shadows
- Responsive padding
- Press feedback
- Optional borders

#### Input Component

```typescript
<Input
  label={string}
  placeholder={string}
  value={string}
  error={string}
  helperText={string}
  leftIcon={ReactNode}
  rightIcon={ReactNode}
  onChangeText={function}
/>
```

**States:**

- Default
- Focus
- Error
- Disabled
- Success

#### Header Component

```typescript
<Header
  title={string}
  subtitle={string}
  leftAction={ReactNode}
  rightAction={ReactNode}
  variant="default" | "large" | "transparent"
/>
```

### 7. Screen Templates

#### Standard Screen Layout

```
┌─────────────────────────┐
│ Header (fixed)          │
├─────────────────────────┤
│                         │
│ ScrollView Content      │
│ - Safe area padding     │
│ - Consistent spacing    │
│ - Pull to refresh       │
│                         │
└─────────────────────────┘
```

#### Tab Screen Layout

```
┌─────────────────────────┐
│ Content Area            │
│                         │
│                         │
│                         │
├─────────────────────────┤
│ Tab Bar (fixed)         │
└─────────────────────────┘
```

#### Modal Layout

```
┌─────────────────────────┐
│ Overlay (dimmed)        │
│  ┌───────────────────┐  │
│  │ Modal Header      │  │
│  ├───────────────────┤  │
│  │ Modal Content     │  │
│  │                   │  │
│  ├───────────────────┤  │
│  │ Modal Actions     │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## Data Models

### Theme Configuration

```typescript
interface Theme {
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  shadows: ShadowSystem;
  animations: AnimationSystem;
  borderRadius: BorderRadiusSystem;
}

interface ColorPalette {
  brand: BrandColors;
  semantic: SemanticColors;
  surface: SurfaceColors;
  text: TextColors;
  interactive: InteractiveColors;
  status: StatusColors;
}
```

### Component Props

```typescript
interface BaseComponentProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
}

interface ButtonProps extends BaseComponentProps {
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onPress: () => void;
  children: ReactNode;
}
```

## Error Handling

### Error States

1. **Network Errors**: Display retry button with offline indicator
2. **Validation Errors**: Inline field-level error messages
3. **Server Errors**: User-friendly error cards with support contact
4. **Loading Errors**: Skeleton loaders with timeout fallback

### Empty States

1. **No Data**: Illustration + helpful message + action button
2. **No Results**: Search-specific empty state with suggestions
3. **No Connection**: Offline indicator with retry option
4. **Permission Denied**: Clear explanation with settings link

## Testing Strategy

### Visual Regression Testing

- Screenshot comparison for key screens
- Component library storybook
- Dark mode verification
- Responsive layout testing

### Accessibility Testing

- Screen reader compatibility
- Color contrast verification
- Touch target size validation
- Keyboard navigation testing

### Performance Testing

- Animation frame rate monitoring
- Render time measurement
- Memory usage profiling
- Bundle size optimization

### Cross-Device Testing

- Small phones (< 5.5")
- Medium phones (5.5" - 6.5")
- Large phones (> 6.5")
- Tablets
- Different OS versions

## Implementation Phases

### Phase 1: Foundation (Design Tokens)

- Enhanced color system with dark mode
- Typography system expansion
- Spacing and layout tokens
- Shadow and elevation system
- Animation tokens

### Phase 2: Core Components

- Button component with all variants
- Card component with variants
- Input component with states
- Header component
- Loading states and skeletons

### Phase 3: Screen Updates

- Update home screens
- Update wallet screens
- Update task screens
- Update profile screens
- Update auth screens

### Phase 4: Advanced Features

- Dark mode implementation
- Smooth transitions
- Micro-interactions
- Empty states
- Error states

### Phase 5: Polish and Optimization

- Performance optimization
- Accessibility improvements
- Visual polish
- Documentation
- Testing

## Design Decisions

### Why Token-Based System?

- Ensures consistency across the app
- Makes theme switching (dark mode) easier
- Simplifies maintenance and updates
- Enables design system scalability

### Why Component Library?

- Reduces code duplication
- Ensures consistent UX
- Speeds up development
- Easier to maintain and update

### Why Responsive Design?

- Better user experience on all devices
- Future-proof for new device sizes
- Professional appearance
- Improved accessibility

### Why Animation System?

- Provides visual feedback
- Makes app feel responsive
- Guides user attention
- Enhances perceived performance
