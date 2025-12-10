@echo off
echo ========================================
echo Building APK for Direct Installation
echo ========================================
echo.
echo This will build an APK file that can be:
echo - Installed directly on Android phones
echo - Shared via website download
echo - Distributed outside Play Store
echo.
pause

cd /d "Earn9ja\Earn9ja"

echo Building APK...
eas build --platform android --profile production-apk

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Download the APK from: https://expo.dev
echo Then you can:
echo 1. Install it on your phone
echo 2. Upload to your website
echo 3. Share with users
echo.
pause
