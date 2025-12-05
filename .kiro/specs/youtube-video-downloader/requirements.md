# Requirements Document

## Introduction

This document outlines the requirements for a mobile application similar to VidMate that enables users to browse, search, and download videos from YouTube for offline viewing. The application will integrate with YouTube API to provide a seamless browsing experience where users can discover and download videos directly without leaving the app.

## Glossary

- **VideoDownloader**: The mobile application system that enables users to browse, search, and download YouTube videos
- **User**: An individual who uses the VideoDownloader application to discover, download, and manage videos
- **YouTubeAPI**: The official YouTube Data API v3 used to fetch video information, search results, and trending content
- **DownloadQueue**: The system component that manages and processes video download requests
- **VideoMetadata**: Information about a video including title, thumbnail, duration, channel, views, and available quality options
- **QualityFormat**: The resolution and format options available for video downloads (e.g., 360p, 480p, 720p, 1080p, MP4, MP3)
- **StorageManager**: The system component that manages downloaded video files on the device
- **VideoExtractor**: The service that extracts actual download URLs from YouTube videos
- **HomeScreen**: The main interface displaying trending videos, categories, and search functionality
- **VideoCategory**: Groupings of videos such as Trending, Music, Gaming, Entertainment, etc.

## Requirements

### Requirement 1

**User Story:** As a User, I want to browse trending videos on the home screen, so that I can discover popular content to download

#### Acceptance Criteria

1. WHEN THE User opens THE VideoDownloader, THE VideoDownloader SHALL display the HomeScreen with trending videos
2. WHEN THE VideoDownloader loads trending videos, THE VideoDownloader SHALL fetch data from YouTubeAPI
3. WHEN THE VideoDownloader displays trending videos, THE VideoDownloader SHALL show video thumbnail, title, channel name, and view count
4. WHILE THE VideoDownloader fetches trending videos, THE VideoDownloader SHALL display a loading skeleton
5. IF THE YouTubeAPI request fails, THEN THE VideoDownloader SHALL display an error message with retry option

### Requirement 2

**User Story:** As a User, I want to search for videos by keywords, so that I can find specific content I want to download

#### Acceptance Criteria

1. WHEN THE User taps the search icon on HomeScreen, THE VideoDownloader SHALL display a search input field
2. WHEN THE User enters search text, THE VideoDownloader SHALL send search query to YouTubeAPI after 500 milliseconds of inactivity
3. WHEN THE VideoDownloader receives search results, THE VideoDownloader SHALL display matching videos with thumbnails and metadata
4. WHEN THE VideoDownloader displays search results, THE VideoDownloader SHALL show video duration, channel name, and upload date
5. WHEN THE User clears search text, THE VideoDownloader SHALL return to HomeScreen with trending videos

### Requirement 3

**User Story:** As a User, I want to browse videos by categories, so that I can explore content in my areas of interest

#### Acceptance Criteria

1. WHEN THE User views HomeScreen, THE VideoDownloader SHALL display VideoCategory tabs including Music, Gaming, Entertainment, News, and Sports
2. WHEN THE User taps a VideoCategory, THE VideoDownloader SHALL fetch category-specific videos from YouTubeAPI
3. WHEN THE VideoDownloader displays category videos, THE VideoDownloader SHALL show video thumbnails in a scrollable grid
4. WHILE THE VideoDownloader loads category videos, THE VideoDownloader SHALL display loading indicators
5. WHEN THE User scrolls to bottom of category list, THE VideoDownloader SHALL load additional videos automatically

### Requirement 4

**User Story:** As a User, I want to download multiple videos simultaneously, so that I can save time when downloading several videos

#### Acceptance Criteria

1. WHEN THE User adds a video to DownloadQueue, THE VideoDownloader SHALL allow adding additional videos without waiting for completion
2. WHILE downloads are in progress, THE VideoDownloader SHALL display download progress for each video in DownloadQueue
3. WHEN THE VideoDownloader processes DownloadQueue, THE VideoDownloader SHALL download up to three videos concurrently
4. WHILE a video downloads, THE VideoDownloader SHALL display download speed and estimated time remaining
5. WHEN a download completes, THE VideoDownloader SHALL display a completion notification

### Requirement 5

**User Story:** As a User, I want to pause and resume downloads, so that I can manage my bandwidth usage and continue interrupted downloads

#### Acceptance Criteria

1. WHILE a video downloads, THE VideoDownloader SHALL provide a pause button for each active download
2. WHEN THE User pauses a download, THE VideoDownloader SHALL save the current download progress
3. WHEN THE User pauses a download, THE VideoDownloader SHALL display a resume button
4. WHEN THE User resumes a paused download, THE VideoDownloader SHALL continue from the saved progress point
5. IF a download fails due to network interruption, THEN THE VideoDownloader SHALL automatically retry up to three times

### Requirement 6

**User Story:** As a User, I want to view all my downloaded videos in one place, so that I can easily access and manage my offline content

#### Acceptance Criteria

1. WHEN THE User navigates to the downloads section, THE VideoDownloader SHALL display all successfully downloaded videos
2. WHEN THE VideoDownloader displays downloaded videos, THE VideoDownloader SHALL show video thumbnail, title, and file size
3. WHEN THE VideoDownloader displays downloaded videos, THE VideoDownloader SHALL show download date for each video
4. WHEN THE User taps a downloaded video, THE VideoDownloader SHALL play the video using the device video player
5. WHEN THE VideoDownloader displays downloaded videos, THE VideoDownloader SHALL show total storage space used

### Requirement 7

**User Story:** As a User, I want to delete downloaded videos, so that I can free up storage space on my device

#### Acceptance Criteria

1. WHEN THE User long-presses a downloaded video, THE VideoDownloader SHALL display delete option
2. WHEN THE User selects delete option, THE VideoDownloader SHALL display a confirmation dialog
3. WHEN THE User confirms deletion, THE VideoDownloader SHALL remove the video file from device storage
4. WHEN THE VideoDownloader deletes a video, THE VideoDownloader SHALL update the total storage space display
5. WHERE THE User wants to delete multiple videos, THE VideoDownloader SHALL provide a multi-select mode

### Requirement 8

**User Story:** As a User, I want to search my download history, so that I can quickly find previously downloaded videos

#### Acceptance Criteria

1. WHEN THE User navigates to download history, THE VideoDownloader SHALL display a search input field
2. WHEN THE User enters search text, THE VideoDownloader SHALL filter downloaded videos by title match
3. WHEN THE VideoDownloader filters results, THE VideoDownloader SHALL display matching videos within 500 milliseconds
4. WHEN THE User clears search text, THE VideoDownloader SHALL display all downloaded videos
5. WHEN no videos match search criteria, THE VideoDownloader SHALL display an empty state message

### Requirement 9

**User Story:** As a User, I want the app to work offline for managing downloads, so that I can access my downloaded videos without internet connection

#### Acceptance Criteria

1. WHEN THE User opens THE VideoDownloader without internet connection, THE VideoDownloader SHALL display downloaded videos
2. WHEN THE User attempts to download without internet connection, THE VideoDownloader SHALL display an offline error message
3. WHILE THE VideoDownloader is offline, THE VideoDownloader SHALL allow playback of downloaded videos
4. WHILE THE VideoDownloader is offline, THE VideoDownloader SHALL allow deletion of downloaded videos
5. WHEN internet connection is restored, THE VideoDownloader SHALL display a connection restored notification

### Requirement 10

**User Story:** As a User, I want to receive notifications about download status, so that I can be informed when downloads complete or fail

#### Acceptance Criteria

1. WHEN a video download completes successfully, THE VideoDownloader SHALL send a push notification
2. IF a download fails after all retry attempts, THEN THE VideoDownloader SHALL send a failure notification
3. WHEN THE User taps a completion notification, THE VideoDownloader SHALL open the downloaded video
4. WHERE THE User has multiple downloads, THE VideoDownloader SHALL group notifications by status
5. WHEN THE VideoDownloader sends notifications, THE VideoDownloader SHALL include video title in notification text

### Requirement 11

**User Story:** As a User, I want to set download preferences, so that I can customize the app behavior to my needs

#### Acceptance Criteria

1. WHEN THE User opens settings, THE VideoDownloader SHALL display download location preference
2. WHEN THE User opens settings, THE VideoDownloader SHALL display default QualityFormat preference
3. WHEN THE User opens settings, THE VideoDownloader SHALL display option to download only on WiFi
4. WHEN THE User enables WiFi-only mode, THE VideoDownloader SHALL pause downloads when on mobile data
5. WHEN THE User opens settings, THE VideoDownloader SHALL display maximum concurrent downloads setting with range of one to five

### Requirement 12

**User Story:** As a User, I want to view detailed video information, so that I can decide whether to download the video

#### Acceptance Criteria

1. WHEN THE User taps a video from any screen, THE VideoDownloader SHALL display a video details screen
2. WHEN THE VideoDownloader displays video details, THE VideoDownloader SHALL show full title, description, channel info, views, likes, and upload date
3. WHEN THE VideoDownloader displays video details, THE VideoDownloader SHALL show a download button
4. WHEN THE VideoDownloader displays video details, THE VideoDownloader SHALL show related videos below
5. WHEN THE User taps download button, THE VideoDownloader SHALL display QualityFormat selection options

### Requirement 13

**User Story:** As a User, I want to select video quality before downloading, so that I can balance file size with video quality based on my needs

#### Acceptance Criteria

1. WHEN THE VideoDownloader displays QualityFormat options, THE VideoDownloader SHALL list all available video resolutions from 144p to 1080p
2. WHEN THE VideoDownloader displays QualityFormat options, THE VideoDownloader SHALL show estimated file size for each QualityFormat
3. WHEN THE User selects a QualityFormat, THE VideoDownloader SHALL highlight the selected option
4. WHERE THE User wants audio only, THE VideoDownloader SHALL provide an MP3 audio extraction option
5. WHEN THE User confirms QualityFormat selection, THE VideoDownloader SHALL add the video to the DownloadQueue

### Requirement 14

**User Story:** As a User, I want to share YouTube links directly to the app, so that I can quickly download videos from other apps

#### Acceptance Criteria

1. WHEN THE User shares a YouTube link from another app, THE VideoDownloader SHALL appear in the share menu
2. WHEN THE User selects THE VideoDownloader from share menu, THE VideoDownloader SHALL open and display video details
3. WHEN THE VideoDownloader receives a shared URL, THE VideoDownloader SHALL automatically fetch VideoMetadata from YouTubeAPI
4. WHEN THE VideoDownloader receives a shared URL, THE VideoDownloader SHALL display the download button
5. WHERE THE VideoDownloader is not running, THE VideoDownloader SHALL launch and process the shared URL

### Requirement 13

**User Story:** As an app owner, I want to monetize the app with ads, so that I can generate revenue while providing free video downloads

#### Acceptance Criteria

1. WHEN THE User views any main screen, THE VideoDownloader SHALL display a banner ad at the bottom
2. WHEN THE User initiates a download, THE VideoDownloader SHALL show an interstitial ad before starting the download
3. WHEN THE User completes three downloads, THE VideoDownloader SHALL show an interstitial ad
4. WHERE THE User wants HD quality downloads, THE VideoDownloader SHALL offer a rewarded ad to unlock 1080p quality
5. WHEN THE VideoDownloader displays video lists, THE VideoDownloader SHALL integrate native ads every sixth item

### Requirement 14

**User Story:** As a User, I want the option to watch ads for premium features, so that I can access better functionality without paying

#### Acceptance Criteria

1. WHEN THE User selects 1080p quality, THE VideoDownloader SHALL display option to watch rewarded ad to unlock
2. WHEN THE User watches a rewarded ad completely, THE VideoDownloader SHALL unlock the requested premium feature
3. IF THE User closes rewarded ad early, THEN THE VideoDownloader SHALL not grant the premium feature
4. WHEN THE User unlocks a feature via ad, THE VideoDownloader SHALL display the unlock duration
5. WHEN premium feature expires, THE VideoDownloader SHALL display option to watch another ad to re-unlock

### Requirement 18

**User Story:** As a User, I want to edit downloaded videos, so that I can customize content before sharing or viewing

#### Acceptance Criteria

1. WHEN THE User views a downloaded video, THE VideoDownloader SHALL display an edit button
2. WHEN THE User opens video editor, THE VideoDownloader SHALL provide trim, crop, and merge tools
3. WHEN THE User trims a video, THE VideoDownloader SHALL allow selection of start and end timestamps
4. WHEN THE User crops a video, THE VideoDownloader SHALL provide aspect ratio presets (16:9, 9:16, 1:1, 4:3)
5. WHEN THE User saves edited video, THE VideoDownloader SHALL create a new file without deleting the original

### Requirement 19

**User Story:** As a User, I want to download video subtitles automatically, so that I can watch videos with captions in my preferred language

#### Acceptance Criteria

1. WHEN THE VideoDownloader detects available subtitles, THE VideoDownloader SHALL display subtitle language options
2. WHEN THE User selects subtitle languages, THE VideoDownloader SHALL download subtitle files with the video
3. WHEN THE VideoDownloader downloads subtitles, THE VideoDownloader SHALL support SRT, VTT, and ASS formats
4. WHEN THE User plays a downloaded video, THE VideoDownloader SHALL automatically load available subtitles
5. WHERE THE User wants multiple languages, THE VideoDownloader SHALL allow downloading up to five subtitle tracks

### Requirement 20

**User Story:** As a User, I want to schedule downloads for later, so that I can download videos during off-peak hours or when WiFi is available

#### Acceptance Criteria

1. WHEN THE User adds a video to download queue, THE VideoDownloader SHALL provide a schedule option
2. WHEN THE User schedules a download, THE VideoDownloader SHALL allow selection of specific date and time
3. WHEN THE scheduled time arrives, THE VideoDownloader SHALL automatically start the download
4. WHERE THE User enables WiFi-only scheduling, THE VideoDownloader SHALL wait for WiFi connection before starting
5. WHEN THE VideoDownloader completes scheduled downloads, THE VideoDownloader SHALL send a notification

### Requirement 21

**User Story:** As a User, I want to convert videos between different formats, so that I can play videos on various devices

#### Acceptance Criteria

1. WHEN THE User views a downloaded video, THE VideoDownloader SHALL provide a convert option
2. WHEN THE User selects convert, THE VideoDownloader SHALL display format options: MP4, AVI, MKV, MOV, WEBM
3. WHEN THE VideoDownloader converts a video, THE VideoDownloader SHALL show conversion progress percentage
4. WHEN THE conversion completes, THE VideoDownloader SHALL save the converted file in the same folder
5. WHERE THE User wants custom settings, THE VideoDownloader SHALL allow bitrate and resolution adjustments

### Requirement 22

**User Story:** As a premium User, I want advanced video editing features, so that I can create professional-quality content

#### Acceptance Criteria

1. WHEN THE premium User opens video editor, THE VideoDownloader SHALL provide advanced filters and effects
2. WHEN THE premium User edits videos, THE VideoDownloader SHALL allow adding text overlays and watermarks
3. WHEN THE premium User merges videos, THE VideoDownloader SHALL allow unlimited video clips
4. WHEN THE premium User exports videos, THE VideoDownloader SHALL provide 4K export quality option
5. WHEN THE premium User uses editor, THE VideoDownloader SHALL remove watermarks from exported videos

### Requirement 18

**User Story:** As a User, I want to trim and edit downloaded videos, so that I can keep only the parts I need and save storage space

#### Acceptance Criteria

1. WHEN THE User opens a downloaded video, THE VideoDownloader SHALL display an edit button
2. WHEN THE User taps edit button, THE VideoDownloader SHALL open video editor with timeline
3. WHEN THE User selects trim tool, THE VideoDownloader SHALL allow setting start and end points
4. WHEN THE User applies trim, THE VideoDownloader SHALL save the edited video as a new file
5. WHEN THE User edits a video, THE VideoDownloader SHALL preserve the original file unless user chooses to replace

### Requirement 19

**User Story:** As a User, I want to merge multiple downloaded videos, so that I can create compilations or combine related content

#### Acceptance Criteria

1. WHEN THE User selects merge option, THE VideoDownloader SHALL allow selecting multiple videos from downloads
2. WHEN THE User selects videos to merge, THE VideoDownloader SHALL display them in merge order
3. WHEN THE User arranges video order, THE VideoDownloader SHALL allow drag-and-drop reordering
4. WHEN THE User confirms merge, THE VideoDownloader SHALL combine videos into single file
5. WHEN merge completes, THE VideoDownloader SHALL save the merged video with combined duration

### Requirement 20

**User Story:** As a User, I want to download video subtitles automatically, so that I can watch videos with captions in my preferred language

#### Acceptance Criteria

1. WHEN THE User downloads a video, THE VideoDownloader SHALL detect available subtitle languages
2. WHEN subtitles are available, THE VideoDownloader SHALL display subtitle language options
3. WHEN THE User selects subtitle languages, THE VideoDownloader SHALL download subtitle files with the video
4. WHEN THE User plays a video with subtitles, THE VideoDownloader SHALL display subtitle toggle option
5. WHERE THE User wants multiple languages, THE VideoDownloader SHALL allow selecting multiple subtitle tracks

### Requirement 21

**User Story:** As a User, I want to schedule downloads for specific times, so that I can download large files during off-peak hours or when WiFi is available

#### Acceptance Criteria

1. WHEN THE User adds a video to download queue, THE VideoDownloader SHALL display schedule option
2. WHEN THE User selects schedule option, THE VideoDownloader SHALL display date and time picker
3. WHEN THE User sets scheduled time, THE VideoDownloader SHALL queue the download for that time
4. WHEN scheduled time arrives, THE VideoDownloader SHALL automatically start the download
5. IF THE User is offline at scheduled time, THEN THE VideoDownloader SHALL retry when connection is available

### Requirement 22

**User Story:** As a User, I want to convert downloaded videos to different formats, so that I can play them on various devices

#### Acceptance Criteria

1. WHEN THE User opens video options, THE VideoDownloader SHALL display convert format option
2. WHEN THE User selects convert, THE VideoDownloader SHALL display available output formats: MP4, AVI, MKV, MOV
3. WHEN THE User selects output format, THE VideoDownloader SHALL display quality and resolution options
4. WHEN THE User confirms conversion, THE VideoDownloader SHALL convert the video in background
5. WHEN conversion completes, THE VideoDownloader SHALL save the converted file and send notification

### Requirement 23

**User Story:** As a User, I want to download and install Android apps through the app, so that I can discover and get apps in one place

#### Acceptance Criteria

1. WHEN THE User navigates to apps section, THE VideoDownloader SHALL display featured Android apps
2. WHEN THE VideoDownloader displays apps, THE VideoDownloader SHALL show app icon, name, size, version, and rating
3. WHEN THE User taps an app, THE VideoDownloader SHALL display app details with screenshots and description
4. WHEN THE User taps download button, THE VideoDownloader SHALL download the APK file to device
5. WHEN APK download completes, THE VideoDownloader SHALL prompt user to install the app

### Requirement 24

**User Story:** As a User, I want to see app categories and search for apps, so that I can easily find the apps I need

#### Acceptance Criteria

1. WHEN THE User views apps section, THE VideoDownloader SHALL display app categories: Games, Social, Tools, Entertainment, Education
2. WHEN THE User taps a category, THE VideoDownloader SHALL display apps in that category
3. WHEN THE User searches for apps, THE VideoDownloader SHALL filter apps by name match
4. WHEN THE VideoDownloader displays app search results, THE VideoDownloader SHALL show matching apps within 500 milliseconds
5. WHEN THE User views app list, THE VideoDownloader SHALL display download count and last update date

### Requirement 25

**User Story:** As a User, I want to manage downloaded APK files, so that I can install, share, or delete them

#### Acceptance Criteria

1. WHEN THE User navigates to downloaded apps, THE VideoDownloader SHALL display all downloaded APK files
2. WHEN THE User taps a downloaded APK, THE VideoDownloader SHALL display install, share, and delete options
3. WHEN THE User selects install, THE VideoDownloader SHALL launch Android package installer
4. WHEN THE User selects share, THE VideoDownloader SHALL open share menu with APK file
5. WHEN THE User deletes an APK, THE VideoDownloader SHALL remove the file and update storage display

### Requirement 26

**User Story:** As a User, I want to see app update notifications, so that I can keep my downloaded apps current

#### Acceptance Criteria

1. WHEN THE VideoDownloader detects app updates, THE VideoDownloader SHALL display update badge on apps section
2. WHEN THE User views downloaded apps, THE VideoDownloader SHALL show update available indicator for outdated apps
3. WHEN THE User taps update button, THE VideoDownloader SHALL download the latest APK version
4. WHEN update download completes, THE VideoDownloader SHALL prompt user to install the update
5. WHERE THE User has multiple updates, THE VideoDownloader SHALL allow updating all apps at once

### Requirement 27

**User Story:** As a User, I want security scanning for downloaded APKs, so that I can avoid installing malicious apps

#### Acceptance Criteria

1. WHEN THE VideoDownloader downloads an APK, THE VideoDownloader SHALL scan the file for malware
2. WHEN scan completes, THE VideoDownloader SHALL display security status: Safe, Warning, or Dangerous
3. IF THE APK is flagged as dangerous, THEN THE VideoDownloader SHALL prevent installation and display warning
4. WHEN THE User views app details, THE VideoDownloader SHALL display security scan results and permissions required
5. WHEN THE VideoDownloader detects suspicious permissions, THE VideoDownloader SHALL highlight them in red

### Requirement 28

**User Story:** As a premium User, I want access to exclusive apps and faster APK downloads, so that I can get premium content

#### Acceptance Criteria

1. WHEN THE premium User views apps section, THE VideoDownloader SHALL display exclusive premium apps
2. WHEN THE premium User downloads APKs, THE VideoDownloader SHALL provide maximum download speed
3. WHEN THE premium User browses apps, THE VideoDownloader SHALL not display ads in apps section
4. WHERE THE User wants paid apps, THE VideoDownloader SHALL offer premium-only paid app downloads
5. WHEN THE premium User downloads apps, THE VideoDownloader SHALL allow unlimited concurrent APK downloads

### Requirement 23

**User Story:** As a User, I want to discover popular apps through curated recommendations, so that I can find useful apps without leaving the video downloader

#### Acceptance Criteria

1. WHEN THE User navigates to apps discovery section, THE VideoDownloader SHALL display curated app categories
2. WHEN THE VideoDownloader displays apps, THE VideoDownloader SHALL show app icon, name, rating, and download count
3. WHEN THE User selects an app, THE VideoDownloader SHALL display app details, screenshots, and user reviews
4. WHEN THE User taps install button, THE VideoDownloader SHALL open the official Play Store or App Store page
5. WHERE THE User wants personalized recommendations, THE VideoDownloader SHALL suggest apps based on browsing history

### Requirement 24

**User Story:** As a User, I want to browse apps by category, so that I can discover apps relevant to my interests

#### Acceptance Criteria

1. WHEN THE User opens app discovery, THE VideoDownloader SHALL display categories: Games, Social, Tools, Entertainment, Education, Productivity
2. WHEN THE User selects a category, THE VideoDownloader SHALL display trending apps in that category
3. WHEN THE VideoDownloader displays category apps, THE VideoDownloader SHALL show editor picks and popular apps
4. WHEN THE User searches for apps, THE VideoDownloader SHALL filter results by app name and description
5. WHERE THE User wants new apps, THE VideoDownloader SHALL display recently added apps section

### Requirement 25

**User Story:** As a User, I want to see app safety and privacy information, so that I can make informed decisions before installing

#### Acceptance Criteria

1. WHEN THE VideoDownloader displays app details, THE VideoDownloader SHALL show data safety summary from official store
2. WHEN THE User views app details, THE VideoDownloader SHALL display required permissions list
3. WHEN THE VideoDownloader shows app info, THE VideoDownloader SHALL display developer information and contact
4. WHERE THE app has privacy concerns, THE VideoDownloader SHALL display privacy warnings
5. WHEN THE User views app, THE VideoDownloader SHALL show last update date and version information

### Requirement 26

**User Story:** As a User, I want to read user reviews before installing apps, so that I can learn from other users' experiences

#### Acceptance Criteria

1. WHEN THE User views app details, THE VideoDownloader SHALL display average rating and total review count
2. WHEN THE VideoDownloader shows reviews, THE VideoDownloader SHALL display recent user reviews with ratings
3. WHEN THE User reads reviews, THE VideoDownloader SHALL show helpful and critical reviews
4. WHERE THE User wants detailed feedback, THE VideoDownloader SHALL allow filtering reviews by rating
5. WHEN THE VideoDownloader displays reviews, THE VideoDownloader SHALL show review date and verified badge

### Requirement 27

**User Story:** As a User, I want to bookmark apps for later, so that I can save interesting apps without installing immediately

#### Acceptance Criteria

1. WHEN THE User views an app, THE VideoDownloader SHALL provide a bookmark button
2. WHEN THE User bookmarks an app, THE VideoDownloader SHALL save it to bookmarks list
3. WHEN THE User navigates to bookmarks, THE VideoDownloader SHALL display all saved apps
4. WHEN THE User removes a bookmark, THE VideoDownloader SHALL update the bookmarks list
5. WHERE THE User has many bookmarks, THE VideoDownloader SHALL allow organizing by categories
