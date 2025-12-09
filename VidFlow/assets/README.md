# VidFlow Assets

This directory contains all visual assets for the VidFlow app including logos, icons, illustrations, and splash screens.

## 📁 Structure

```
assets/
├── Logo.tsx                    # Main animated logo component
├── images/
│   ├── AppIcon.tsx            # App icon (1024x1024)
│   ├── SplashScreen.tsx       # Animated splash screen
│   └── index.ts
├── illustrations/
│   ├── EmptyDownloadsIllustration.tsx
│   ├── EmptySearchIllustration.tsx
│   ├── OfflineIllustration.tsx
│   ├── ErrorIllustration.tsx
│   ├── WelcomeIllustration.tsx
│   ├── BrowseIllustration.tsx
│   ├── DownloadIllustration.tsx
│   ├── WatchIllustration.tsx
│   └── index.ts
└── README.md
```

## 🎨 Components

### Logo Component

The main VidFlow logo with optional animation and text.

```typescript
import { Logo } from '@/assets/Logo';

// With animation and text
<Logo size={100} showText={true} animate={true} />

// Icon only, no animation
<Logo size={60} showText={false} animate={false} />
```

**Props:**

- `size?: number` - Size of the logo (default: 100)
- `showText?: boolean` - Show "VidFlow" text below logo (default: true)
- `animate?: boolean` - Enable animations (default: true)

**Features:**

- Gradient blue to pink color scheme
- Animated play button with rotation
- Bouncing download arrow
- Pulsing glow effect
- Sparkle accents

### App Icon

High-resolution app icon for iOS and Android.

```typescript
import { AppIcon } from "@/assets/images";

<AppIcon size={1024} />;
```

**Specifications:**

- Default size: 1024x1024px
- Rounded corners (180px radius)
- Gradient background
- Play button + download arrow design
- Suitable for app stores

### Splash Screen

Animated splash screen component with auto-complete callback.

```typescript
import { SplashScreen } from "@/assets/images";

<SplashScreen
  onAnimationComplete={() => {
    // Navigate to main app
  }}
/>;
```

**Features:**

- Fade in animation
- Scale up effect
- Pulsing logo
- Bouncing arrow
- Auto-completes after ~3 seconds

## 🖼️ Illustrations

### Empty State Illustrations

#### EmptyDownloadsIllustration

Shows when user has no downloaded videos.

```typescript
import { EmptyDownloadsIllustration } from "@/assets/illustrations";

<EmptyDownloadsIllustration size={200} />;
```

**Design:** Folder with download arrow and magnifying glass

#### EmptySearchIllustration

Shows when search returns no results.

```typescript
import { EmptySearchIllustration } from "@/assets/illustrations";

<EmptySearchIllustration size={200} />;
```

**Design:** Magnifying glass with question mark and floating video icons

#### OfflineIllustration

Shows when device is offline.

```typescript
import { OfflineIllustration } from "@/assets/illustrations";

<OfflineIllustration size={200} />;
```

**Design:** Cloud with disconnected WiFi symbol and X mark

#### ErrorIllustration

Shows when an error occurs.

```typescript
import { ErrorIllustration } from "@/assets/illustrations";

<ErrorIllustration size={200} />;
```

**Design:** Alert triangle with exclamation mark and broken video icon

### Onboarding Illustrations

#### WelcomeIllustration

First onboarding screen - introduces the app.

```typescript
import { WelcomeIllustration } from "@/assets/illustrations";

<WelcomeIllustration size={300} />;
```

**Design:** Phone mockup with play button and floating video thumbnails

#### BrowseIllustration

Second onboarding screen - shows browsing feature.

```typescript
import { BrowseIllustration } from "@/assets/illustrations";

<BrowseIllustration size={300} />;
```

**Design:** Search bar with video grid layout

#### DownloadIllustration

Third onboarding screen - explains downloading.

```typescript
import { DownloadIllustration } from "@/assets/illustrations";

<DownloadIllustration size={300} />;
```

**Design:** Cloud with download arrow and progress bars

#### WatchIllustration

Fourth onboarding screen - shows offline watching.

```typescript
import { WatchIllustration } from "@/assets/illustrations";

<WatchIllustration size={300} />;
```

**Design:** TV/monitor with play button, popcorn, and remote control

## 🎨 Design System

### Colors

**Primary Gradient:**

- Start: #2196F3 (Blue)
- End: #E91E63 (Pink)

**Accent Colors:**

- Success: #4CAF50 (Green)
- Warning: #FF9800 (Orange)
- Error: #F44336 (Red)
- Gold: #FFD700 (Yellow)

### Illustration Style

- **Line Weight:** 3-4px for main elements
- **Border Radius:** 8-12px for rounded corners
- **Opacity:** 0.3-0.6 for background elements
- **Fill:** Light tints (#E3F2FD, #F8BBD0) for backgrounds
- **Stroke:** Primary colors for outlines

### Animation Guidelines

- **Duration:** 600-1500ms for smooth transitions
- **Easing:** `Easing.inOut(Easing.ease)` for natural motion
- **Pulse:** 1.0 to 1.08-1.1 scale
- **Bounce:** 0-10px translation
- **Rotation:** 0-360deg for continuous spin

## 📱 Usage in App

### Splash Screen Setup

```typescript
// App.tsx
import { SplashScreen } from "@/assets/images";
import { useState } from "react";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  return <MainApp />;
}
```

### Empty States

```typescript
// DownloadsScreen.tsx
import { EmptyDownloadsIllustration } from "@/assets/illustrations";

function DownloadsScreen() {
  if (downloads.length === 0) {
    return (
      <View style={styles.emptyState}>
        <EmptyDownloadsIllustration size={200} />
      </View>
    );
  }

  return <DownloadsList />;
}
```

### Onboarding Flow

```typescript
// OnboardingScreen.tsx
import {
  WelcomeIllustration,
  BrowseIllustration,
  DownloadIllustration,
  WatchIllustration,
} from "@/assets/illustrations";

const screens = [
  {
    title: "Welcome to VidFlow",
    description: "Download and watch videos offline",
    illustration: <WelcomeIllustration size={300} />,
  },
  {
    title: "Browse Videos",
    description: "Search and discover content",
    illustration: <BrowseIllustration size={300} />,
  },
  {
    title: "Download Easily",
    description: "Save videos for offline viewing",
    illustration: <DownloadIllustration size={300} />,
  },
  {
    title: "Watch Anytime",
    description: "Enjoy your videos without internet",
    illustration: <WatchIllustration size={300} />,
  },
];
```

## 🔧 Customization

All illustrations accept a `size` prop to adjust dimensions:

```typescript
// Small
<EmptyDownloadsIllustration size={150} />

// Medium (default)
<EmptyDownloadsIllustration size={200} />

// Large
<EmptyDownloadsIllustration size={300} />
```

## 📦 Dependencies

Required packages:

- `react-native-svg` - For SVG rendering
- `react-native` - For animations

Install:

```bash
npm install react-native-svg
# or
yarn add react-native-svg
```

## 🎯 Best Practices

1. **Performance:** Use `animate={false}` for logos in lists
2. **Accessibility:** Provide alt text descriptions
3. **Sizing:** Use consistent sizes across similar contexts
4. **Loading:** Show illustrations after content loads
5. **Theming:** Illustrations adapt to light/dark mode via theme colors

## 📄 License

All assets are proprietary to VidFlow and should not be used outside this project.

---

**Created for VidFlow - Video Downloader App**
