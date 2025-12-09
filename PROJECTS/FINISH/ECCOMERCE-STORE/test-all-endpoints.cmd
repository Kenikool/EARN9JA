@echo off
setlocal enabledelayedexpansion

set BASE_URL=http://localhost:8000
set TOKEN=

echo ========================================
echo Testing All API Endpoints
echo ========================================
echo.

echo [1/26] Health Check...
curl -s %BASE_URL%/health
echo.
echo.

echo [2/26] Register User...
curl -s -X POST %BASE_URL%/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test Admin\",\"email\":\"testadmin@example.com\",\"password\":\"admin123456\"}" > register_response.json
type register_response.json
echo.
echo.

echo [3/26] Login User...
curl -s -X POST %BASE_URL%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"testadmin@example.com\",\"password\":\"admin123456\"}" > login_response.json
type login_response.json
echo.
echo.

echo.
echo ========================================
echo MANUAL TESTING REQUIRED
echo ========================================
echo.
echo Copy the accessToken from login_response.json
echo Then test protected endpoints manually
echo.
echo Example:
echo curl -H "Authorization: Bearer YOUR_TOKEN" %BASE_URL%/api/auth/me
echo.

del register_response.json login_response.json 2>nul
pause
