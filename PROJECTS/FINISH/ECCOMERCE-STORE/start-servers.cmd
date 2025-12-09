@echo off
echo Starting Backend and Frontend Servers...
echo.

echo Starting Backend Server (Port 8000)...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Servers Started!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
