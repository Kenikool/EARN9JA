# VidFlow UI Component Library

A comprehensive, theme-aware UI component library for React Native, built specifically for the VidFlow YouTube video downloader app.

## Features

- 🎨 **Theme Support**: Full light/dark mode with system preference detection
- 📱 **React Native Optimized**: Built for mobile performance
- 🎯 **TypeScript**: Fully typed for better DX
- 🎭 **Consistent Design**: Follows a unified design system
- ♿ **Accessible**: WCAG 2.1 AA compliant
- 🚀 **Production Ready**: Battle-tested components

## Installation

```typescript
import {
  ThemeProvider,
  Button,
  Card,
  // ... other components
} from "@/components/ui";
```

## Theme Setup

Wrap your app with the ThemeProvider:

```typescript
import { ThemeProvider } from "@/components/ui";

export default function App() {
  return <ThemeProvider>{/* Your app content */}</ThemeProvider>;
}
```

## Components

### Core Components

#### Button

5 variants, 3 sizes, loading states, icon support

```typescript
<Button variant="primary" size="lg" onPress={() => {}}>
  Download
</Button>
```

#### Card

3 variants with customizable padding

```typescript
<Card variant="elevated">
  <Text>Content</Text>
</Card>
```

#### Input

Labels, errors, icons, validation

```typescript
<Input
  label="Email"
  placeholder="Enter email"
  error="Invalid email"
  leftIcon="📧"
/>
```

#### Badge

6 variants, 3 sizes

```typescript
<Badge variant="success" size="sm">
  HD
</Badge>
```

### Navigation Components

#### TabBar

Horizontal scrollable tabs with animated indicator

```typescript
<TabBar
  tabs={[
    { id: "1", label: "Home", icon: "🏠" },
    { id: "2", label: "Trending", icon: "📈" },
  ]}
  activeTabId="1"
  onTabChange={(id) => {}}
/>
```

#### Tabs

Tab navigation with content panels

```typescript
<Tabs
  tabs={[
    { id: "1", label: "Tab 1", content: <View /> },
    { id: "2", label: "Tab 2", content: <View /> },
  ]}
/>
```

### Media Components

#### VideoCard

Complete video display with metadata

```typescript
<VideoCard
  thumbnail="https://..."
  title="Video Title"
  channelName="Channel"
  views={1000}
  duration="10:30"
  onPress={() => {}}
  onDownload={() => {}}
/>
```

#### VideoPlayer

Custom video player with controls

```typescript
<VideoPlayer
  source="video.mp4"
  onFullscreen={() => {}}
  onQualityChange={() => {}}
/>
```

#### QualitySelector

Video quality selection

```typescript
<QualitySelector
  options={[{ id: "1", resolution: "1080p", quality: "HD", fileSize: "500MB" }]}
  selectedId="1"
  onSelect={(option) => {}}
/>
```

### Feedback Components

#### Toast

4 variants with auto-dismiss

```typescript
<Toast
  variant="success"
  message="Download complete!"
  visible={true}
  onClose={() => {}}
/>
```

#### Alert

Alert messages with variants

```typescript
<Alert
  variant="warning"
  title="Warning"
  message="This action cannot be undone"
  onClose={() => {}}
/>
```

#### LoadingSpinner

Loading indicator with message

```typescript
<LoadingSpinner size="large" message="Loading..." fullScreen />
```

#### EmptyState

Empty state with action

```typescript
<EmptyState
  icon="📭"
  title="No downloads yet"
  description="Start downloading videos"
  actionLabel="Browse Videos"
  onAction={() => {}}
/>
```

### Form Components

#### Checkbox

Checkbox with label

```typescript
<Checkbox checked={true} onValueChange={(checked) => {}} label="Remember me" />
```

#### RadioGroup

Radio button group

```typescript
<RadioGroup
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ]}
  value="1"
  onValueChange={(value) => {}}
/>
```

#### Switch

Toggle switch

```typescript
<Switch
  value={true}
  onValueChange={(value) => {}}
  label="Enable notifications"
/>
```

#### Select

Dropdown selection

```typescript
<Select
  options={[
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ]}
  value="1"
  onValueChange={(value) => {}}
  placeholder="Select option"
/>
```

#### Slider

Range slider

```typescript
<Slider
  value={50}
  onValueChange={(value) => {}}
  min={0}
  max={100}
  label="Volume"
/>
```

### Layout Components

#### Modal

Modal dialog with header/footer

```typescript
<Modal visible={true} onClose={() => {}} title="Modal Title">
  <Text>Content</Text>
</Modal>
```

#### BottomSheet

Draggable bottom sheet

```typescript
<BottomSheet visible={true} onClose={() => {}} snapPoints={[0.5, 0.9]}>
  <Text>Content</Text>
</BottomSheet>
```

#### ActionSheet

Action selection sheet

```typescript
<ActionSheet
  visible={true}
  onClose={() => {}}
  options={[
    { label: "Edit", onPress: () => {} },
    { label: "Delete", onPress: () => {}, destructive: true },
  ]}
/>
```

#### Accordion

Collapsible content

```typescript
<Accordion title="Section Title" icon="📁">
  <Text>Content</Text>
</Accordion>
```

### Utility Components

#### Divider

Horizontal/vertical divider

```typescript
<Divider orientation="horizontal" spacing="md" />
```

#### IconButton

Icon-only button

```typescript
<IconButton icon="⚙" onPress={() => {}} size="md" variant="primary" />
```

#### FloatingActionButton

Floating action button

```typescript
<FloatingActionButton icon="+" onPress={() => {}} position="bottom-right" />
```

#### SettingsRow

Settings list item

```typescript
<SettingsRow
  label="Notifications"
  leftIcon="🔔"
  rightElement="toggle"
  value={true}
  onToggle={(value) => {}}
/>
```

#### Tooltip

Tooltip component

```typescript
<Tooltip content="Help text">
  <Text>Hover me</Text>
</Tooltip>
```

### Progress Components

#### ProgressBar

Animated progress bar

```typescript
<ProgressBar progress={75} showPercentage color="#2196F3" />
```

#### Skeleton

Loading skeleton

```typescript
<Skeleton width={200} height={20} />
<SkeletonVideoCard />
```

#### DownloadCard

Download progress card

```typescript
<DownloadCard
  thumbnail="https://..."
  title="Video Title"
  progress={45}
  speed="2.5 MB/s"
  eta="2 min"
  onPause={() => {}}
  onResume={() => {}}
  onCancel={() => {}}
/>
```

### Display Components

#### Avatar

User/channel avatar

```typescript
<Avatar source={{ uri: "https://..." }} size="lg" fallbackText="JD" />
```

#### Chip

Tag/filter chip

```typescript
<Chip variant="filled" selected={true} onPress={() => {}}>
  Music
</Chip>
```

#### SearchBar

Search input with debounce

```typescript
<SearchBar value={query} onChangeText={setQuery} placeholder="Search videos" />
```

### Icons

#### Icon

Icon component with 35+ icons

```typescript
<Icon name="download" size={24} color="#2196F3" />
```

Available icons: download, play, pause, delete, share, settings, search, filter, sort, home, trending, music, gaming, news, sports, education, hd, 4k, 8k, check, close, chevron-right, chevron-left, chevron-up, chevron-down, heart, heart-filled, star, star-filled, user, menu, more, info, warning, error, success

## Theme Customization

Access theme colors and utilities:

```typescript
import { useTheme } from "@/components/ui";

function MyComponent() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

## Design Tokens

### Colors

- Primary: #2196F3
- Secondary: #E91E63
- Success: #4CAF50
- Warning: #FF9800
- Error: #F44336
- Info: #2196F3

### Spacing

8px grid system: xs, sm, md, lg, xl, 2xl

### Typography

- Font families: Inter, Poppins, JetBrains Mono
- Sizes: xs (12), sm (14), base (16), lg (18), xl (20), 2xl (24), 3xl (30), 4xl (36), 5xl (48)

### Shadows

- small, medium, large elevation levels

## Best Practices

1. **Always use ThemeProvider** at the root of your app
2. **Use theme colors** instead of hardcoded values
3. **Leverage spacing tokens** for consistent layouts
4. **Use TypeScript types** for better autocomplete
5. **Test in both themes** (light and dark)
6. **Follow accessibility guidelines** for contrast and touch targets

## License

MIT
