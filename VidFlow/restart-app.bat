@echo off
echo Clearing Expo cache and restarting app...
cd /d "%~dp0"
npx expo start --clear
