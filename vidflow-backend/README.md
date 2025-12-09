# VidFlow Backend API

Universal video downloader backend service supporting 1000+ platforms including YouTube, Instagram, TikTok, Twitter, and more.

## Features

- 🎬 Extract video information from URLs
- 📥 Get direct download links
- 🎯 Multiple quality options
- 🔒 Platform restrictions (Lite vs Pro versions)
- ⚡ Rate limiting and security
- 🌐 CORS support for mobile apps

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Python** (v3.7 or higher)
3. **yt-dlp** - Universal video downloader

### Install yt-dlp

```bash
# Using pip
pip install -U yt-dlp

# Or using pip3
pip3 install -U yt-dlp

# Verify installation
yt-dlp --version
```

## Installation

1. Install dependencies:

```bash
cd vidflow-backend
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Configure `.env` file:

```env
PORT=3001
APP_VERSION=pro  # or 'lite'
ALLOWED_PLATFORMS=all
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3001`

## App Versions

### VidFlow Lite (App Store Version)

- Only legal platforms: Twitter, Reddit, Dailymotion, Vimeo
- Can be published on Google Play & App Store
- Set `APP_VERSION=lite` in `.env`

### VidFlow Pro (Full APK Version)

- ALL platforms including YouTube, Instagram, TikTok, Facebook
- Distributed via APK from website
- Set `APP_VERSION=pro` in `.env`

## API Endpoints

### 1. Get Video Information

```http
GET /api/video/info?url=VIDEO_URL
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "video_id",
    "title": "Video Title",
    "description": "Video description",
    "thumbnail": "https://...",
    "duration": 180,
    "uploader": "Channel Name",
    "formats": [...]
  },
  "platform": "youtube"
}
```

### 2. Get Download URL

```http
GET /api/video/download-url?url=VIDEO_URL&quality=720p
```

**Quality Options:** `360p`, `480p`, `720p`, `1080p`, `1440p`, `2160p`, `best`

**Response:**

```json
{
  "success": true,
  "data": {
    "videoUrl": "https://direct-download-url",
    "audioUrl": "https://audio-url",
    "quality": "720p",
    "needsMerge": false
  }
}
```

### 3. Get Available Qualities

```http
GET /api/video/qualities?url=VIDEO_URL
```

### 4. Health Check

```http
GET /api/video/health
```

## Supported Platforms

### Legal Platforms (Lite Version)

- ✅ Twitter/X
- ✅ Reddit
- ✅ Dailymotion
- ✅ Vimeo
- ✅ SoundCloud
- ✅ Twitch

### All Platforms (Pro Version)

- ✅ YouTube
- ✅ Instagram
- ✅ Facebook
- ✅ TikTok
- ✅ Twitter/X
- ✅ Reddit
- ✅ Dailymotion
- ✅ Vimeo
- ✅ SoundCloud
- ✅ Twitch
- ✅ Snapchat
- ✅ 1000+ more platforms

## Deployment

### Deploy to Heroku

```bash
heroku create vidflow-api
heroku config:set APP_VERSION=pro
git push heroku main
```

### Deploy to Railway

```bash
railway init
railway up
```

### Deploy to DigitalOcean/AWS/Azure

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start src/server.js --name vidflow-backend
pm2 save
pm2 startup
```

## Security

- Rate limiting: 100 requests per 15 minutes per IP
- CORS protection
- Helmet security headers
- Platform restrictions based on app version

## Troubleshooting

### yt-dlp not found

```bash
# Make sure yt-dlp is in your PATH
which yt-dlp  # Unix/Mac
where yt-dlp  # Windows
```

### Python not found

Install Python 3.7+ from python.org

### Port already in use

Change PORT in `.env` file

## License

MIT

## Disclaimer

This software is for educational purposes only. Users are responsible for complying with the terms of service of the platforms they download from. The developers are not responsible for any misuse of this software.
