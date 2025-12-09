@echo off
echo Testing VidFlow Backend...
echo.
echo Test 1: Health Check
curl http://localhost:3001/health
echo.
echo.
echo Test 2: yt-dlp Integration
curl http://localhost:3001/api/video/health
echo.
echo.
echo Test 3: Video Info (YouTube)
curl "http://localhost:3001/api/video/info?url=https://www.youtube.com/watch?v=jNQXAC9IVRw"
echo.
echo.
echo All tests complete!
pause
