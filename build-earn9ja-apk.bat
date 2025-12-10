@echo off
echo Building Earn9ja APK for Direct Distribution...
echo.
echo This will create an APK file you can share directly with users
echo while your Play Store account is being resolved.
echo.
echo Checking internet connection...
ping -n 1 google.com >nul 2>&1
if errorlevel 1 (
    echo ERROR: No internet connection detected!
    echo Please connect to the internet and try again.
    pause
    exit /b 1
)

echo Internet connection OK
echo.
pause

cd /d "%~dp0Earn9ja\Earn9ja"
if not exist "package.json" (
    echo ERROR: Cannot find Earn9ja project directory!
    echo Current directory: %cd%
    pause
    exit /b 1
)

echo Building APK...
eas build --platform android --profile production --local

echo.
echo Build complete! The APK will be in the current directory.
echo You can share this APK directly with testers.
pause
