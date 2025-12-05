# Design Document

## Overview

The YouTube Video Downloader is a React Native mobile application that provides a VidMate-like experience for browsing and downloading YouTube videos. The app integrates with YouTube Data API v3 for content discovery and uses yt-dlp (or similar extraction library) for obtaining actual download URLs. The architecture follows a clean separation between the browsing/discovery layer (YouTube API) and the download execution layer (video extraction service).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Home     │  │   Search   │  │   Video Details      │  │
│  │   Screen   │  │   Screen   │  │   Screen             │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ Downloads  │  │  Settings  │  │   Video Player       │  │
│  │   Screen   │  │   Screen   │  │   (Local)            │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              YouTube API Service                      │  │
│  │  - Trending videos                                    │  │
│  │  - Search                                             │  │
│  │  - Video details                                      │  │
│  │  - Categories                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Video Extraction Service                      │  │
│  │  - Extract download URLs                              │  │
│  │  - Quality format detection                           │  │
│  │  - Audio extraction                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Download Manager Service                    │  │
│  │  - Queue management                                   │  │
│  │  - Progress tracking                                  │  │
│  │  - Pause/Resume                                       │  │
│  │  - Retry logic                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  YouTube Data    │  │   YouTube Video Servers      │    │
│  │  API v3          │  │   (Direct download)          │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend (Mobile App):**

- React Native with Expo
- TypeScript
- React Navigation for routing
- React Query for API state management
- Zustand for local state management
- React Native MMKV for fast local storage
- React Native FS for file system operations
- React Native Video for local playback

**Backend:**

- Node.js with Express
- TypeScript
- MongoDB for storing download history and user preferences
- Redis for caching YouTube API responses
- Bull queue for download job management
- yt-dlp wrapper for video extraction

**External APIs:**

- YouTube Data API v3 (for browsing/search)
- yt-dlp or youtube-dl (for video extraction)
- Google AdMob (for monetization)

**Monetization Strategy:**

- AdMob Banner Ads (persistent at bottom of screens)
- AdMob Interstitial Ads (between screen transitions)
- AdMob Rewarded Ads (unlock premium features or faster downloads)
- AdMob Native Advanced Ads (integrated in video lists)

## Ad Integration Strategy

### Ad Placement Map

**Banner Ads (Always Visible):**

- Home Screen (bottom)
- Search Screen (bottom)
- Downloads Screen (bottom)
- Settings Screen (bottom)

**Interstitial Ads (Full Screen):**

- After selecting video quality (before download starts)
- After every 3 video downloads
- When opening downloaded video for playback
- When navigating from Downloads to Home (every 5th time)

**Rewarded Ads (Optional for Users):**

- Watch ad to unlock HD quality (1080p) downloads
- Watch ad to increase concurrent downloads from 3 to 5
- Watch ad to remove download speed limit
- Watch ad to unlock batch download feature

**Native Advanced Ads:**

- Integrated every 6th item in trending video list
- Integrated every 6th item in search results
- Integrated every 6th item in downloads list

### Ad Service Architecture

```typescript
// AdMob Configuration
interface AdMobConfig {
  androidAppId: string;
  iosAppId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  nativeAdUnitId: string;
}

// Ad Manager Service
class AdManagerService {
  // Preload ads for better UX
  async preloadInterstitial(): Promise<void>;
  async preloadRewarded(): Promise<void>;

  // Show ads
  async showInterstitial(placement: string): Promise<boolean>;
  async showRewarded(
    rewardType: string
  ): Promise<{ watched: boolean; reward: string }>;

  // Track ad impressions
  trackAdImpression(adType: string, placement: string): void;

  // Ad frequency control
  shouldShowInterstitial(placement: string): boolean;
}
```

## Components and Interfaces

### 1. Mobile App Components

#### HomeScreen Component

```typescript
interface HomeScreenProps {
  navigation: NavigationProp;
}

interface TrendingVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  viewCount: number;
  duration: string;
  publishedAt: string;
}

interface HomeScreenState {
  trendingVideos: TrendingVideo[];
  selectedCategory: VideoCategory;
  isLoading: boolean;
  error: string | null;
}
```

**Features:**

- Horizontal category tabs (Trending, Music, Gaming, Entertainment, News, Sports)
- Grid layout of video thumbnails
- Pull-to-refresh functionality
- Infinite scroll for loading more videos
- Quick download button on each video card

#### SearchScreen Component

```typescript
interface SearchScreenProps {
  navigation: NavigationProp;
}

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelThumbnail: string;
  viewCount: number;
  duration: string;
  publishedAt: string;
}

interface SearchScreenState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  recentSearches: string[];
}
```

**Features:**

- Search input with debouncing (500ms)
- Recent searches history
- Search suggestions
- Filter options (upload date, duration, sort by)
- Clear search history option

#### VideoDetailsScreen Component

```typescript
interface VideoDetailsScreenProps {
  route: {
    params: {
      videoId: string;
    };
  };
  navigation: NavigationProp;
}

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelName: string;
  channelThumbnail: string;
  subscriberCount: number;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  duration: string;
  tags: string[];
  relatedVideos: TrendingVideo[];
}

interface QualityOption {
  format: string; // '144p', '360p', '480p', '720p', '1080p', 'audio'
  fileSize: number; // in bytes
  extension: string; // 'mp4', 'mp3'
}
```

**Features:**

- Full video information display
- Download button with quality selector
- Related videos section
- Share button
- Add to favorites option

#### DownloadsScreen Component

```typescript
interface DownloadsScreenProps {
  navigation: NavigationProp;
}

interface DownloadItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  filePath: string;
  fileSize: number;
  quality: string;
  downloadedAt: Date;
  duration: string;
}

interface ActiveDownload {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  progress: number; // 0-100
  downloadSpeed: number; // bytes per second
  status: "downloading" | "paused" | "failed" | "completed";
  estimatedTimeRemaining: number; // seconds
}

interface DownloadsScreenState {
  activeDownloads: ActiveDownload[];
  completedDownloads: DownloadItem[];
  totalStorageUsed: number;
  searchQuery: string;
  sortBy: "date" | "name" | "size";
}
```

**Features:**

- Active downloads section with progress bars
- Completed downloads grid
- Search/filter downloaded videos
- Multi-select for batch deletion
- Storage usage indicator
- Sort options

#### SettingsScreen Component

```typescript
interface SettingsScreenProps {
  navigation: NavigationProp;
}

interface AppSettings {
  downloadLocation: string;
  defaultQuality: string;
  wifiOnlyDownload: boolean;
  maxConcurrentDownloads: number; // 1-5
  autoDeleteAfterDays: number | null;
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
}
```

**Features:**

- Download preferences
- Storage management
- Notification settings
- Theme selection
- About/Help section
- Clear cache option

### 2. Backend Services

#### YouTubeAPIService

```typescript
class YouTubeAPIService {
  private apiKey: string;
  private baseURL: string;
  private cache: RedisClient;

  async getTrendingVideos(
    regionCode: string,
    category?: string,
    maxResults?: number
  ): Promise<TrendingVideo[]>;

  async searchVideos(
    query: string,
    maxResults?: number,
    pageToken?: string
  ): Promise<{
    videos: SearchResult[];
    nextPageToken: string;
  }>;

  async getVideoDetails(videoId: string): Promise<VideoDetails>;

  async getVideosByCategory(
    categoryId: string,
    maxResults?: number
  ): Promise<TrendingVideo[]>;

  async getRelatedVideos(
    videoId: string,
    maxResults?: number
  ): Promise<TrendingVideo[]>;
}
```

**Caching Strategy:**

- Trending videos: 15 minutes TTL
- Search results: 30 minutes TTL
- Video details: 1 hour TTL
- Category videos: 15 minutes TTL

#### VideoExtractionService

```typescript
class VideoExtractionService {
  async extractVideoInfo(videoId: string): Promise<{
    formats: QualityOption[];
    audioFormats: QualityOption[];
  }>;

  async getDownloadURL(
    videoId: string,
    quality: string
  ): Promise<{
    url: string;
    expiresAt: Date;
  }>;

  async extractAudioURL(videoId: string): Promise<{
    url: string;
    expiresAt: Date;
  }>;
}
```

**Implementation Notes:**

- Uses yt-dlp Python library via child process
- Extracts all available formats
- Returns direct download URLs
- URLs expire after 6 hours (YouTube limitation)

#### DownloadManagerService

```typescript
interface DownloadJob {
  id: string;
  userId: string;
  videoId: string;
  title: string;
  thumbnail: string;
  quality: string;
  downloadURL: string;
  status: "queued" | "downloading" | "paused" | "completed" | "failed";
  progress: number;
  filePath?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

class DownloadManagerService {
  private queue: Queue;
  private activeDownloads: Map<string, DownloadJob>;

  async addToQueue(
    userId: string,
    videoId: string,
    quality: string
  ): Promise<DownloadJob>;

  async pauseDownload(downloadId: string): Promise<void>;

  async resumeDownload(downloadId: string): Promise<void>;

  async cancelDownload(downloadId: string): Promise<void>;

  async getActiveDownloads(userId: string): Promise<DownloadJob[]>;

  async getDownloadHistory(userId: string): Promise<DownloadItem[]>;

  private async processDownload(job: DownloadJob): Promise<void>;

  private async retryFailedDownload(
    job: DownloadJob,
    attempt: number
  ): Promise<void>;
}
```

**Download Process:**

1. Receive download request with videoId and quality
2. Extract download URL using VideoExtractionService
3. Add job to Bull queue
4. Process download with progress tracking
5. Save file to device storage
6. Update database with download record
7. Send push notification on completion

### 3. API Endpoints

#### Video Discovery Endpoints

```typescript
// Get trending videos
GET /api/videos/trending?region=US&category=music&maxResults=20

// Search videos
GET /api/videos/search?q=react+native&maxResults=20&pageToken=xyz

// Get video details
GET /api/videos/:videoId

// Get videos by category
GET /api/videos/category/:categoryId?maxResults=20

// Get related videos
GET /api/videos/:videoId/related?maxResults=10
```

#### Download Management Endpoints

```typescript
// Initiate download
POST /api/downloads
Body: {
  videoId: string;
  quality: string;
}

// Get available quality options
GET /api/downloads/formats/:videoId

// Get active downloads
GET /api/downloads/active

// Get download history
GET /api/downloads/history?page=1&limit=20&search=query

// Pause download
PUT /api/downloads/:downloadId/pause

// Resume download
PUT /api/downloads/:downloadId/resume

// Cancel download
DELETE /api/downloads/:downloadId

// Delete downloaded file
DELETE /api/downloads/:downloadId/file
```

#### User Settings Endpoints

```typescript
// Get user settings
GET / api / settings;

// Update settings
PUT / api / settings;
Body: AppSettings;

// Clear cache
POST / api / settings / clear - cache;

// Get storage info
GET / api / settings / storage;
```

## Data Models

### MongoDB Schemas

#### User Schema

```typescript
interface User {
  _id: ObjectId;
  deviceId: string; // Unique device identifier
  settings: AppSettings;
  createdAt: Date;
  updatedAt: Date;
}
```

#### DownloadHistory Schema

```typescript
interface DownloadHistory {
  _id: ObjectId;
  userId: ObjectId;
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  quality: string;
  fileSize: number;
  filePath: string;
  duration: string;
  downloadedAt: Date;
  lastAccessedAt: Date;
}
```

#### SearchHistory Schema

```typescript
interface SearchHistory {
  _id: ObjectId;
  userId: ObjectId;
  query: string;
  searchedAt: Date;
}
```

### Local Storage (MMKV)

```typescript
// Active downloads state
interface LocalDownloadState {
  activeDownloads: {
    [downloadId: string]: {
      progress: number;
      downloadSpeed: number;
      status: string;
      pausedBytes?: number;
    };
  };
}

// App preferences
interface LocalPreferences {
  theme: string;
  lastViewedCategory: string;
  recentSearches: string[];
}
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  API_QUOTA_EXCEEDED = "API_QUOTA_EXCEEDED",
  VIDEO_NOT_AVAILABLE = "VIDEO_NOT_AVAILABLE",
  EXTRACTION_FAILED = "EXTRACTION_FAILED",
  DOWNLOAD_FAILED = "DOWNLOAD_FAILED",
  STORAGE_FULL = "STORAGE_FULL",
  INVALID_VIDEO_ID = "INVALID_VIDEO_ID",
  PERMISSION_DENIED = "PERMISSION_DENIED",
}

interface AppError {
  type: ErrorType;
  message: string;
  retryable: boolean;
  details?: any;
}
```

### Error Handling Strategy

**Network Errors:**

- Display offline indicator
- Cache last successful data
- Retry with exponential backoff
- Allow access to downloaded content

**API Quota Exceeded:**

- Display user-friendly message
- Implement request throttling
- Use cached data when available
- Suggest retry after cooldown period

**Video Extraction Failures:**

- Retry up to 3 times
- Fall back to alternative quality
- Log error for debugging
- Notify user with actionable message

**Download Failures:**

- Auto-retry up to 3 times
- Preserve partial download progress
- Allow manual retry
- Clear failed downloads after 24 hours

**Storage Full:**

- Check available space before download
- Suggest deleting old downloads
- Show storage usage breakdown
- Prevent new downloads until space available

## Testing Strategy

### Unit Tests

**Services:**

- YouTubeAPIService: Mock API responses, test caching logic
- VideoExtractionService: Test format parsing, URL extraction
- DownloadManagerService: Test queue management, retry logic

**Components:**

- Test rendering with different states (loading, error, success)
- Test user interactions (search, download, delete)
- Test navigation flows

### Integration Tests

- Test complete download flow from search to completion
- Test pause/resume functionality
- Test offline mode behavior
- Test storage management

### End-to-End Tests

- Test user journey: search → view details → download → play
- Test multiple concurrent downloads
- Test app state persistence across restarts
- Test share functionality from external apps

### Performance Tests

- Test app performance with 1000+ downloaded videos
- Test search performance with large result sets
- Test download speed optimization
- Test memory usage during multiple downloads

## Security Considerations

1. **API Key Protection:**

   - Store YouTube API key on backend only
   - Never expose in mobile app code
   - Implement rate limiting per device

2. **Download URL Security:**

   - URLs expire after 6 hours
   - Validate video IDs before extraction
   - Sanitize file names to prevent path traversal

3. **Storage Security:**

   - Store files in app-specific directory
   - Implement file access permissions
   - Encrypt sensitive user data

4. **Network Security:**
   - Use HTTPS for all API calls
   - Implement certificate pinning
   - Validate SSL certificates

## Performance Optimization

1. **Image Loading:**

   - Use progressive image loading
   - Implement thumbnail caching
   - Lazy load images in lists

2. **List Rendering:**

   - Use FlatList with optimized rendering
   - Implement virtualization for long lists
   - Batch API requests

3. **Download Optimization:**

   - Use chunked downloads for resume capability
   - Implement parallel chunk downloads
   - Compress thumbnails and metadata

4. **Caching Strategy:**
   - Cache API responses in Redis
   - Cache images locally
   - Implement stale-while-revalidate pattern

## Deployment Considerations

**Mobile App:**

- Build for Android (APK/AAB)
- Build for iOS (IPA)
- Implement OTA updates via Expo
- Configure app signing

**Backend:**

- Deploy on cloud platform (AWS, DigitalOcean, Heroku)
- Set up MongoDB Atlas or self-hosted MongoDB
- Configure Redis instance
- Set up CDN for static assets
- Implement monitoring and logging

**Environment Variables:**

```
YOUTUBE_API_KEY=your_api_key
MONGODB_URI=mongodb://...
REDIS_URL=redis://...
PORT=3000
NODE_ENV=production
```

## Future Enhancements

1. **Playlist Support:** Download entire playlists
2. **Background Downloads:** Continue downloads when app is closed
3. **Video Conversion:** Convert to different formats
4. **Subtitle Download:** Download video subtitles
5. **Cloud Sync:** Sync downloads across devices
6. **Social Features:** Share downloads with friends
7. **Advanced Search:** Filters by duration, quality, upload date
8. **Download Scheduler:** Schedule downloads for specific times

## Advanced Features Architecture

### Video Editing System

#### VideoEditorService

```typescript
interface EditOperation {
  type: "trim" | "crop" | "merge" | "filter" | "text" | "watermark";
  params: any;
  timestamp: Date;
}

interface VideoEditProject {
  id: string;
  sourceVideoId: string;
  sourceFilePath: string;
  operations: EditOperation[];
  outputFormat: string;
  status: "draft" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

class VideoEditorService {
  // Trim operations
  async trimVideo(
    filePath: string,
    startTime: number,
    endTime: number
  ): Promise<string>;

  // Crop operations
  async cropVideo(
    filePath: string,
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3",
    position?: { x: number; y: number }
  ): Promise<string>;

  // Merge operations
  async mergeVideos(filePaths: string[]): Promise<string>;

  // Apply filters (premium)
  async applyFilter(
    filePath: string,
    filterType: string,
    intensity: number
  ): Promise<string>;

  // Add text overlay (premium)
  async addTextOverlay(
    filePath: string,
    text: string,
    position: { x: number; y: number },
    style: TextStyle
  ): Promise<string>;

  // Add watermark (premium)
  async addWatermark(
    filePath: string,
    watermarkPath: string,
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  ): Promise<string>;

  // Export with quality options
  async exportVideo(
    projectId: string,
    quality: "720p" | "1080p" | "4K",
    removeWatermark: boolean
  ): Promise<string>;
}
```

**Implementation:**

- Uses FFmpeg for video processing
- React Native FFmpeg wrapper
- Background processing with progress updates
- Temporary file management

#### VideoEditorScreen Component

```typescript
interface VideoEditorScreenProps {
  route: {
    params: {
      videoId: string;
      filePath: string;
    };
  };
}

interface VideoEditorState {
  project: VideoEditProject;
  currentTime: number;
  isPlaying: boolean;
  selectedTool: "trim" | "crop" | "merge" | "filter" | "text" | "watermark";
  isProcessing: boolean;
  processingProgress: number;
}
```

**Features:**

- Video timeline with scrubber
- Tool palette (trim, crop, merge, filters)
- Real-time preview
- Undo/redo operations
- Save as new file option
- Premium features badge

### Subtitle Management System

#### SubtitleService

```typescript
interface SubtitleTrack {
  id: string;
  language: string;
  languageCode: string;
  format: "srt" | "vtt" | "ass";
  filePath: string;
  isAutoGenerated: boolean;
}

interface SubtitleDownloadOptions {
  videoId: string;
  languages: string[]; // max 5
  format: "srt" | "vtt" | "ass";
}

class SubtitleService {
  // Fetch available subtitles
  async getAvailableSubtitles(videoId: string): Promise<SubtitleTrack[]>;

  // Download subtitles
  async downloadSubtitles(
    options: SubtitleDownloadOptions
  ): Promise<SubtitleTrack[]>;

  // Convert subtitle formats
  async convertSubtitleFormat(
    filePath: string,
    targetFormat: "srt" | "vtt" | "ass"
  ): Promise<string>;

  // Load subtitles for playback
  async loadSubtitlesForVideo(videoId: string): Promise<SubtitleTrack[]>;

  // Delete subtitle files
  async deleteSubtitles(videoId: string, languageCode?: string): Promise<void>;
}
```

**Implementation:**

- Uses yt-dlp for subtitle extraction
- Stores subtitles alongside video files
- Automatic subtitle detection
- Format conversion using subtitle parsers

### Download Scheduler System

#### SchedulerService

```typescript
interface ScheduledDownload {
  id: string;
  videoId: string;
  quality: string;
  scheduledTime: Date;
  wifiOnly: boolean;
  status: "pending" | "ready" | "downloading" | "completed" | "failed";
  createdAt: Date;
}

class SchedulerService {
  // Schedule a download
  async scheduleDownload(
    videoId: string,
    quality: string,
    scheduledTime: Date,
    wifiOnly: boolean
  ): Promise<ScheduledDownload>;

  // Get scheduled downloads
  async getScheduledDownloads(userId: string): Promise<ScheduledDownload[]>;

  // Cancel scheduled download
  async cancelScheduledDownload(scheduleId: string): Promise<void>;

  // Check and execute scheduled downloads
  async checkScheduledDownloads(): Promise<void>;

  // Reschedule failed downloads
  async rescheduleDownload(
    scheduleId: string,
    newTime: Date
  ): Promise<ScheduledDownload>;
}
```

**Implementation:**

- Background job scheduler (Bull/Agenda)
- Network state monitoring
- WiFi detection
- Push notifications on completion
- Automatic retry logic

#### ScheduleDownloadModal Component

```typescript
interface ScheduleDownloadModalProps {
  visible: boolean;
  videoId: string;
  onClose: () => void;
  onSchedule: (schedule: ScheduledDownload) => void;
}

interface ScheduleDownloadState {
  selectedDate: Date;
  selectedTime: Date;
  wifiOnly: boolean;
  quality: string;
}
```

**Features:**

- Date picker
- Time picker
- WiFi-only toggle
- Quality selector
- Quick schedule presets (tonight, tomorrow morning, etc.)

### Video Conversion System

#### VideoConverterService

```typescript
interface ConversionOptions {
  sourceFilePath: string;
  targetFormat: "mp4" | "avi" | "mkv" | "mov" | "webm";
  quality: "low" | "medium" | "high" | "original";
  resolution?: string; // '720p', '1080p', etc.
  bitrate?: number; // custom bitrate in kbps
}

interface ConversionJob {
  id: string;
  sourceFile: string;
  targetFormat: string;
  status: "queued" | "converting" | "completed" | "failed";
  progress: number;
  outputFilePath?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

class VideoConverterService {
  // Start conversion
  async convertVideo(options: ConversionOptions): Promise<ConversionJob>;

  // Get conversion progress
  async getConversionProgress(jobId: string): Promise<ConversionJob>;

  // Cancel conversion
  async cancelConversion(jobId: string): Promise<void>;

  // Get supported formats
  getSupportedFormats(): string[];

  // Estimate output file size
  async estimateFileSize(
    sourceFilePath: string,
    targetFormat: string,
    quality: string
  ): Promise<number>;
}
```

**Implementation:**

- FFmpeg for format conversion
- Background processing queue
- Progress tracking via FFmpeg output parsing
- Automatic cleanup of temporary files

#### VideoConverterScreen Component

```typescript
interface VideoConverterScreenProps {
  route: {
    params: {
      videoId: string;
      filePath: string;
    };
  };
}

interface VideoConverterState {
  selectedFormat: string;
  selectedQuality: string;
  customBitrate?: number;
  customResolution?: string;
  estimatedSize: number;
  isConverting: boolean;
  conversionProgress: number;
}
```

**Features:**

- Format selector with icons
- Quality presets
- Advanced settings (bitrate, resolution)
- File size estimation
- Conversion progress bar
- Cancel conversion option

### App Discovery System

#### AppDiscoveryService

```typescript
interface AppInfo {
  id: string;
  packageName: string; // com.example.app
  name: string;
  icon: string;
  rating: number;
  reviewCount: number;
  downloadCount: string; // "1M+", "10M+"
  size: string;
  version: string;
  developer: string;
  category: string;
  description: string;
  screenshots: string[];
  lastUpdate: Date;
  playStoreUrl: string;
  appStoreUrl?: string;
}

interface AppCategory {
  id: string;
  name: string;
  icon: string;
  appCount: number;
}

interface AppReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  helpful: number;
  date: Date;
  isVerified: boolean;
}

class AppDiscoveryService {
  // Get app categories
  async getCategories(): Promise<AppCategory[]>;

  // Get apps by category
  async getAppsByCategory(
    categoryId: string,
    page: number,
    limit: number
  ): Promise<AppInfo[]>;

  // Search apps
  async searchApps(query: string, page: number): Promise<AppInfo[]>;

  // Get app details
  async getAppDetails(appId: string): Promise<AppInfo>;

  // Get app reviews
  async getAppReviews(
    appId: string,
    filter?: "all" | "positive" | "negative"
  ): Promise<AppReview[]>;

  // Get trending apps
  async getTrendingApps(limit: number): Promise<AppInfo[]>;

  // Get recommended apps
  async getRecommendedApps(userId: string): Promise<AppInfo[]>;

  // Bookmark app
  async bookmarkApp(userId: string, appId: string): Promise<void>;

  // Get bookmarked apps
  async getBookmarkedApps(userId: string): Promise<AppInfo[]>;

  // Open app in store
  openInStore(appInfo: AppInfo): void;
}
```

**Implementation:**

- Backend scrapes/caches app data from Play Store API
- Redis caching for app listings (1 hour TTL)
- MongoDB for user bookmarks
- Deep linking to official stores
- No APK hosting or downloads

#### AppDiscoveryScreen Component

```typescript
interface AppDiscoveryScreenProps {
  navigation: NavigationProp;
}

interface AppDiscoveryState {
  categories: AppCategory[];
  selectedCategory: string;
  apps: AppInfo[];
  trendingApps: AppInfo[];
  searchQuery: string;
  isLoading: boolean;
}
```

**Features:**

- Category tabs
- Trending apps carousel
- App grid with icons and ratings
- Search with autocomplete
- Filter by rating, downloads
- Bookmarks section

#### AppDetailsScreen Component

```typescript
interface AppDetailsScreenProps {
  route: {
    params: {
      appId: string;
    };
  };
}

interface AppDetailsState {
  app: AppInfo;
  reviews: AppReview[];
  isBookmarked: boolean;
  selectedReviewFilter: "all" | "positive" | "negative";
}
```

**Features:**

- App icon and name
- Rating and download count
- Screenshots carousel
- Description with "Read more"
- Developer information
- Data safety section
- Reviews with filtering
- "Install" button (opens Play Store)
- Bookmark button
- Share button

## Updated Data Models

### ScheduledDownload Schema

```typescript
interface ScheduledDownload {
  _id: ObjectId;
  userId: ObjectId;
  videoId: string;
  title: string;
  thumbnail: string;
  quality: string;
  scheduledTime: Date;
  wifiOnly: boolean;
  status: "pending" | "ready" | "downloading" | "completed" | "failed";
  downloadId?: ObjectId;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### SubtitleTrack Schema

```typescript
interface SubtitleTrack {
  _id: ObjectId;
  videoId: string;
  language: string;
  languageCode: string;
  format: "srt" | "vtt" | "ass";
  filePath: string;
  fileSize: number;
  isAutoGenerated: boolean;
  downloadedAt: Date;
}
```

### VideoEditProject Schema

```typescript
interface VideoEditProject {
  _id: ObjectId;
  userId: ObjectId;
  sourceVideoId: string;
  sourceFilePath: string;
  operations: EditOperation[];
  outputFilePath?: string;
  outputFormat: string;
  status: "draft" | "processing" | "completed" | "failed";
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### AppBookmark Schema

```typescript
interface AppBookmark {
  _id: ObjectId;
  userId: ObjectId;
  appId: string;
  appName: string;
  appIcon: string;
  category: string;
  bookmarkedAt: Date;
}
```

## Updated API Endpoints

### Video Editing Endpoints

```typescript
// Create edit project
POST /api/video-editor/projects
Body: { videoId: string, filePath: string }

// Get edit project
GET /api/video-editor/projects/:projectId

// Apply edit operation
POST /api/video-editor/projects/:projectId/operations
Body: { type: string, params: any }

// Export edited video
POST /api/video-editor/projects/:projectId/export
Body: { quality: string, removeWatermark: boolean }

// Delete edit project
DELETE /api/video-editor/projects/:projectId
```

### Subtitle Endpoints

```typescript
// Get available subtitles
GET /api/subtitles/:videoId/available

// Download subtitles
POST /api/subtitles/:videoId/download
Body: { languages: string[], format: string }

// Get downloaded subtitles
GET /api/subtitles/:videoId

// Delete subtitles
DELETE /api/subtitles/:videoId/:languageCode
```

### Scheduler Endpoints

```typescript
// Schedule download
POST /api/scheduler/downloads
Body: { videoId: string, quality: string, scheduledTime: Date, wifiOnly: boolean }

// Get scheduled downloads
GET /api/scheduler/downloads

// Cancel scheduled download
DELETE /api/scheduler/downloads/:scheduleId

// Reschedule download
PUT /api/scheduler/downloads/:scheduleId
Body: { scheduledTime: Date }
```

### Video Conversion Endpoints

```typescript
// Start conversion
POST /api/converter/convert
Body: { filePath: string, targetFormat: string, quality: string }

// Get conversion status
GET /api/converter/jobs/:jobId

// Cancel conversion
DELETE /api/converter/jobs/:jobId

// Get supported formats
GET /api/converter/formats

// Estimate file size
POST /api/converter/estimate
Body: { filePath: string, targetFormat: string, quality: string }
```

### App Discovery Endpoints

```typescript
// Get categories
GET /api/apps/categories

// Get apps by category
GET /api/apps/category/:categoryId?page=1&limit=20

// Search apps
GET /api/apps/search?q=game&page=1

// Get app details
GET /api/apps/:appId

// Get app reviews
GET /api/apps/:appId/reviews?filter=all

// Get trending apps
GET /api/apps/trending?limit=10

// Get recommended apps
GET /api/apps/recommended

// Bookmark app
POST /api/apps/:appId/bookmark

// Get bookmarked apps
GET /api/apps/bookmarks

// Remove bookmark
DELETE /api/apps/:appId/bookmark
```

## Premium Features Integration

### Subscription Management

```typescript
interface SubscriptionPlan {
  id: string;
  name: "Monthly Premium" | "Yearly Premium";
  price: number;
  currency: string;
  duration: number; // days
  features: string[];
  discount?: number;
}

interface UserSubscription {
  userId: ObjectId;
  planId: string;
  status: "active" | "expired" | "cancelled";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
}

class SubscriptionService {
  async getPlans(): Promise<SubscriptionPlan[]>;
  async subscribe(userId: string, planId: string): Promise<UserSubscription>;
  async cancelSubscription(userId: string): Promise<void>;
  async checkSubscriptionStatus(userId: string): Promise<boolean>;
}
```

**Premium Features:**

- No ads (banner, interstitial, native, rewarded)
- Advanced video editing (filters, text, watermark removal)
- 4K video export
- Unlimited video merging
- High-quality MP3 (192kbps, 320kbps)
- 4K and 8K video downloads
- Unlimited concurrent downloads
- Maximum download speeds
- Batch playlist downloads
- Priority customer support

## Updated Technology Stack

**Additional Libraries:**

- **FFmpeg:** react-native-ffmpeg for video processing
- **Video Editing:** react-native-video-processing
- **Date/Time Picker:** @react-native-community/datetimepicker
- **Background Tasks:** react-native-background-fetch
- **Deep Linking:** react-native-deep-linking
- **In-App Purchases:** react-native-iap (for subscriptions)

**Backend Additions:**

- **Job Scheduler:** Agenda or Bull for scheduled downloads
- **Web Scraping:** Puppeteer or Cheerio for app data
- **Payment Processing:** Stripe or RevenueCat for subscriptions

## Performance Considerations

**Video Processing:**

- Process videos in background threads
- Show progress notifications
- Limit concurrent processing jobs
- Automatic cleanup of temporary files

**App Discovery:**

- Aggressive caching of app listings
- Lazy load app screenshots
- Paginated app lists
- Debounced search queries

**Scheduled Downloads:**

- Efficient job queue management
- Battery optimization
- Network state monitoring
- Wake locks for critical downloads
