@echo off
REM Earn9ja Production Setup Script (Windows)
REM This script prepares the production environment

echo.
echo ========================================
echo    Earn9ja Production Setup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found
    echo Please create .env file from .env.example
    exit /b 1
)

echo [OK] .env file found

REM Check Node.js installation
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

echo [OK] Node.js is installed

REM Install dependencies
echo.
echo Installing dependencies...
call npm ci --production
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [OK] Dependencies installed

REM Build TypeScript
echo.
echo Building TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    exit /b 1
)

echo [OK] Build completed

REM Create necessary directories
echo.
echo Creating directories...
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist temp mkdir temp

echo [OK] Directories created

REM Test database connection
echo.
echo Testing database connection...
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('[OK] Database connection successful'); process.exit(0); }).catch((err) => { console.error('[ERROR] Database connection failed:', err.message); process.exit(1); });"

if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database connection test failed
    echo Please verify your MONGODB_URI in .env
)

REM Create MongoDB indexes
echo.
echo Creating MongoDB indexes...
if exist dist\scripts\create-indexes.js (
    node dist\scripts\create-indexes.js
) else (
    echo [WARNING] Index creation script not found (optional)
)

echo.
echo ========================================
echo    Production setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Review the DEPLOYMENT_GUIDE.md
echo 2. Start the server with: npm start
echo 3. Or use PM2: pm2 start dist/server.js --name earn9ja-backend
echo.

pause
