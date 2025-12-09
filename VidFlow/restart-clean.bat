@echo off
echo ========================================
echo  FORCE CLEANING and Restarting VidFlow
echo ========================================
echo.
echo [1/5] Killing ALL Node processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM expo.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Clearing Expo cache folders...
cd /d "%~dp0"
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo-shared rmdir /s /q .expo-shared

echo.
echo [3/5] Clearing Metro bundler cache...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-*
if exist %TEMP%\react-* rmdir /s /q %TEMP%\react-*

echo.
echo [4/5] Clearing Watchman cache (if exists)...
watchman watch-del-all 2>nul

echo.
echo [5/5] Starting Expo with COMPLETELY clean cache...
echo.
echo *** IMPORTANT: After Expo starts, press 'a' to reload on Android ***
echo.
npx expo start --clear --reset-cache

pause
