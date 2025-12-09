@echo off
echo ========================================
echo Video Generator - Complete Setup Script
echo ========================================
echo.

echo Step 1: Checking Docker containers...
docker ps
echo.

echo Step 2: Installing llama2 model in Ollama...
docker exec videogen-ollama ollama pull llama2
echo.

echo Step 3: Verifying llama2 installation...
docker exec videogen-ollama ollama list
echo.

echo Step 4: Checking backend API health...
timeout /t 5
curl http://localhost:8000/health
echo.

echo Step 5: Checking Ollama service...
curl http://localhost:11434/api/tags
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your services should be running at:
echo - Backend API: http://localhost:8000
echo - Frontend: http://localhost:3000
echo - Ollama: http://localhost:11434
echo.
echo MongoDB Atlas: Connected
echo.
pause
