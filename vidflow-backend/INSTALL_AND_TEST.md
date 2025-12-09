# VidFlow Backend - Installation & Testing Guide

## Prerequisites Check

Before starting, make sure you have:

1. **Node.js** installed (v16+)

   ```cmd
   node --version
   ```

2. **Python** installed (v3.7+)

   ```cmd
   python --version
   ```

3. **yt-dlp** installed
   ```cmd
   yt-dlp --version
   ```

## Installation Steps

### Step 1: Install yt-dlp (if not installed)

```cmd
pip install -U yt-dlp
```

Or if you have pip3:

```cmd
pip3 install -U yt-dlp
```

Verify installation:

```cmd
yt-dlp --version
```

### Step 2: Install Node.js Dependencies

Open Command Prompt or PowerShell in the `vidflow-backend` folder and run:

```cmd
npm install
```

This will install:

- express
- cors
- dotenv
- helmet
- express-rate-limit

### Step 3: Verify Installation

Check that `node_modules` folder was created:

```cmd
dir node_modules
```

## Testing the Backend

### Test 1: Start the Server

```cmd
npm start
```

You should see:

```
╔═══════════════════════════════════════════════════════╗
║   🎬 VidFlow Backend API                             ║
║   Version: PRO                                        ║
║   Port: 3001                                          ║
╚═══════════════════════════════════════════════════════╝
```

### Test 2: Health Check

Open a new terminal and test:

```cmd
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "version": "pro",
  "timestamp": "2024-..."
}
```

### Test 3: Check yt-dlp Integration

```cmd
curl http://localhost:3001/api/video/health
```

Expected response:

```json
{
  "success": true,
  "ytdlp": {
    "installed": true,
    "version": "2024.xx.xx"
  },
  "appVersion": "pro"
}
```

### Test 4: Test Video Info (Twitter Example)

```cmd
curl "http://localhost:3001/api/video/info?url=https://twitter.com/NASA/status/1234567890"
```

### Test 5: Test with YouTube URL

```cmd
curl "http://localhost:3001/api/video/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

Expected response with video information including:

- title
- description
- thumbnail
- duration
- available formats

## Troubleshooting

### Error: "yt-dlp not found"

**Solution:**

```cmd
pip install -U yt-dlp
```

Then verify it's in your PATH:

```cmd
where yt-dlp
```

### Error: "Port 3001 already in use"

**Solution:** Change port in `.env` file:

```env
PORT=3002
```

### Error: "Cannot find module 'express'"

**Solution:** Install dependencies:

```cmd
npm install
```

### Error: "Python not found"

**Solution:** Install Python from https://www.python.org/downloads/

Make sure to check "Add Python to PATH" during installation.

## Quick Test Commands

Once server is running, test these endpoints:

1. **Root endpoint:**

   ```
   http://localhost:3001/
   ```

2. **Health check:**

   ```
   http://localhost:3001/health
   ```

3. **yt-dlp health:**

   ```
   http://localhost:3001/api/video/health
   ```

4. **Video info (replace with actual URL):**
   ```
   http://localhost:3001/api/video/info?url=YOUR_VIDEO_URL
   ```

## Next Steps

Once all tests pass:

1. ✅ Backend is working
2. ✅ yt-dlp is integrated
3. 🚀 Ready to connect VidFlow app
4. 📱 Update VidFlow app's `.env` with backend URL

## Development Mode

For development with auto-reload:

```cmd
npm run dev
```

This uses nodemon to automatically restart the server when files change.
