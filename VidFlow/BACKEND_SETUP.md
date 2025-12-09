# VidFlow Backend Setup Guide

This guide will help you set up the VidFlow backend service for video downloading.

## Quick Start

### 1. Install Prerequisites

**Install Python & yt-dlp:**

```bash
# Install Python (if not already installed)
# Download from: https://www.python.org/downloads/

# Install yt-dlp
pip install -U yt-dlp

# Verify installation
yt-dlp --version
```

**Install Node.js dependencies:**

```bash
cd vidflow-backend
npm install
```

### 2. Configure Environment

```bash
cd vidflow-backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
APP_VERSION=pro  # Change to 'lite' for App Store version
ALLOWED_PLATFORMS=all
CORS_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081
```

### 3. Start the Backend

```bash
npm run dev
```

You should see:

```
╔═══════════════════════════════════════════════════════╗
║   🎬 VidFlow Backend API                             ║
║   Version: PRO                                        ║
║   Port: 3001                                          ║
╚═══════════════════════════════════════════════════════╝
```

### 4. Update VidFlow App

Edit `VidFlow/.env`:

```env
# For local development
VIDFLOW_API_URL=http://localhost:3001

# For production (replace with your deployed URL)
# VIDFLOW_API_URL=https://your-api.herokuapp.com
```

### 5. Test the Connection

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test video info (example with Twitter)
curl "http://localhost:3001/api/video/info?url=https://twitter.com/example/status/123"
```

## Building Different Versions

### VidFlow Lite (App Store Version)

1. Set backend to lite mode:

```bash
cd vidflow-backend
# Edit .env
APP_VERSION=lite
```

2. Build app:

```bash
cd VidFlow
npm run build:lite
```

### VidFlow Pro (Full APK Version)

1. Set backend to pro mode:

```bash
cd vidflow-backend
# Edit .env
APP_VERSION=pro
```

2. Build app:

```bash
cd VidFlow
npm run build:pro
```

## Deployment Options

### Option 1: Heroku (Free Tier)

```bash
cd vidflow-backend
heroku create your-vidflow-api
heroku config:set APP_VERSION=pro
git push heroku main
```

Update VidFlow `.env`:

```env
VIDFLOW_API_URL=https://your-vidflow-api.herokuapp.com
```

### Option 2: Railway

```bash
cd vidflow-backend
railway init
railway up
```

### Option 3: DigitalOcean/AWS/Azure

Use PM2:

```bash
npm install -g pm2
pm2 start src/server.js --name vidflow-backend
pm2 save
pm2 startup
```

## Troubleshooting

### yt-dlp not found

```bash
# Check if yt-dlp is installed
yt-dlp --version

# If not found, install it
pip install -U yt-dlp

# Add to PATH if needed (Windows)
# Add Python Scripts folder to PATH
```

### CORS errors

Make sure your app's IP is in `CORS_ORIGINS` in backend `.env`

### Rate limit errors

Increase limits in backend `.env`:

```env
RATE_LIMIT_MAX_REQUESTS=200
```

### Connection refused

- Make sure backend is running
- Check firewall settings
- Verify correct URL in VidFlow `.env`

## Next Steps

1. ✅ Backend is running
2. ✅ VidFlow app is configured
3. 🚀 Start the VidFlow app: `npm start`
4. 📱 Test video downloading

## Support

For issues, check:

- Backend logs: `npm run dev` output
- yt-dlp version: `yt-dlp --version`
- Network connectivity: `curl http://localhost:3001/health`
