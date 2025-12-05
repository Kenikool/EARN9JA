# Splashscreen & Branding Assets Design

## Splashscreen Design

### Concept

Modern, animated splashscreen with the VidFlow logo and tagline

### Design Specifications

**Background:**

- Gradient from primary-700 to primary-900
- Animated subtle particle effects (optional)

**Logo:**

- Centered VidFlow logo (icon + text)
- Size: 120x120 (icon), full logo 280x80
- Fade-in animation (300ms)
- Scale animation (from 0.8 to 1.0)

**Tagline:**

- "Download. Watch. Enjoy."
- Font: Inter Medium, 16px
- Color: White with 80% opacity
- Position: Below logo (24px spacing)
- Fade-in animation (400ms delay)

**Loading Indicator:**

- Circular progress indicator
- Color: White
- Position: Bottom center (48px from bottom)
- Size: 32x32

### Animation Sequence

1. Background fades in (200ms)
2. Logo scales and fades in (300ms)
3. Tagline fades in (400ms)
4. Loading indicator appears (500ms)
5. Transition to main app (fade out, 300ms)

### Platform-Specific Assets

**Android:**

- `android/app/src/main/res/drawable/splash_screen.xml`
- `android/app/src/main/res/values/colors.xml`
- Adaptive icon support

**iOS:**

- `ios/VidFlow/LaunchScreen.storyboard`
- `ios/VidFlow/Images.xcassets/SplashIcon.imageset/`

## App Icon Design

### Primary App Icon

**Design Elements:**

- Play button (triangle) inside a download arrow
- Gradient background (primary-500 to secondary-500)
- Rounded square with 22% corner radius
- Modern, flat design style

**Sizes Required:**

- Android: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512
- iOS: 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

**Adaptive Icon (Android):**

- Foreground: Logo icon
- Background: Gradient or solid primary color
- Safe zone: 66dp diameter circle

### Logo Variations

**1. Full Logo (Horizontal)**

- Icon + "VidFlow" text
- Use: App header, about screen
- Formats: SVG, PNG (2x, 3x)

**2. Icon Only**

- Just the play/download icon
- Use: App icon, favicon, small spaces
- Formats: SVG, PNG (multiple sizes)

**3. Monochrome**

- Single color version (white or black)
- Use: Dark backgrounds, print
- Formats: SVG, PNG

**4. Wordmark**

- Text only "VidFlow"
- Font: Poppins Bold
- Use: Marketing materials

## Illustration & Image Assets

### Empty States

**1. No Downloads Yet**

- Illustration: Empty folder with download icon
- Style: Line art with primary color
- Message: "No downloads yet"
- Subtext: "Start downloading your favorite videos"

**2. No Search Results**

- Illustration: Magnifying glass with question mark
- Message: "No results found"
- Subtext: "Try different keywords"

**3. Offline Mode**

- Illustration: Cloud with slash
- Message: "You're offline"
- Subtext: "Check your internet connection"

**4. Error State**

- Illustration: Broken link or alert icon
- Message: "Something went wrong"
- Subtext: "Please try again"

### Onboarding Illustrations

**Screen 1: Welcome**

- Illustration: Phone with video thumbnails
- Title: "Welcome to VidFlow"
- Description: "Download and watch YouTube videos offline"

**Screen 2: Browse**

- Illustration: Grid of video cards
- Title: "Discover Videos"
- Description: "Browse trending videos and search for content"

**Screen 3: Download**

- Illustration: Download progress with quality options
- Title: "Download in Any Quality"
- Description: "Choose from 144p to 4K quality"

**Screen 4: Watch**

- Illustration: Video player with controls
- Title: "Watch Anytime"
- Description: "Enjoy your videos offline, anytime, anywhere"

### Feature Icons

**Download Quality Icons:**

- 144p, 360p, 480p, 720p, 1080p, 4K, 8K
- Style: Badge with resolution text
- Colors: Quality-based (low=gray, HD=blue, 4K=gold)

**Category Icons:**

- Trending: Fire icon
- Music: Musical note
- Gaming: Game controller
- Entertainment: Star
- News: Newspaper
- Sports: Trophy

**Action Icons:**

- Download: Down arrow in circle
- Play: Triangle
- Pause: Two vertical bars
- Delete: Trash bin
- Share: Share arrow
- Settings: Gear
- Search: Magnifying glass
- Filter: Funnel
- Sort: Arrows up/down

### Background Patterns

**1. Gradient Mesh**

- Use: Splashscreen, premium screens
- Colors: Primary to secondary gradient
- Style: Smooth, modern mesh

**2. Dot Pattern**

- Use: Empty states, backgrounds
- Style: Subtle dots with low opacity
- Color: Theme-aware (light/dark)

**3. Wave Pattern**

- Use: Section dividers
- Style: Smooth curves
- Color: Surface color with slight transparency
