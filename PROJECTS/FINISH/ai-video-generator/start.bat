@echo off
REM All-in-one startup script for AI Video Generator (Windows)

echo.
echo AI Video Generator - Complete Setup
echo ======================================
echo.

REM Check Docker
echo Step 1/5: Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop and run this script again
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Start services
echo Step 2/5: Starting Docker services...
docker-compose down >nul 2>&1
docker-compose up -d

echo Waiting for services to start...
timeout /t 15 /nobreak >nul
echo [OK] Services started
echo.

REM Wait for Ollama
echo Step 3/5: Waiting for Ollama to be ready...
set MAX_WAIT=60
set WAITED=0

:wait_ollama
if %WAITED% GEQ %MAX_WAIT% goto ollama_timeout
docker exec videogen-ollama curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo Waiting... (%WAITED%/%MAX_WAIT% seconds)
    timeout /t 5 /nobreak >nul
    set /a WAITED+=5
    goto wait_ollama
)
echo [OK] Ollama is ready
goto ollama_ready

:ollama_timeout
echo [WARNING] Ollama took longer than expected to start

:ollama_ready
echo.

REM Setup Ollama models
echo Step 4/5: Setting up Ollama models...
docker exec videogen-ollama ollama list 2>nul | findstr "llama3" >nul
if errorlevel 1 (
    echo Downloading llama3 model (this may take 5-15 minutes)...
    docker exec videogen-ollama ollama pull llama3
    if errorlevel 1 (
        echo [ERROR] Failed to install llama3 model
        echo You can try again later with: docker exec videogen-ollama ollama pull llama3
    ) else (
        echo [OK] llama3 model installed
    )
) else (
    echo [OK] llama3 model already installed
)
echo.

REM Initialize database
echo Step 5/5: Initializing database...
timeout /t 5 /nobreak >nul
docker exec videogen-api alembic upgrade head >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database migration failed (API may still be starting)
    echo You can run it manually later with:
    echo   docker exec videogen-api alembic upgrade head
) else (
    echo [OK] Database initialized
)
echo.

REM Final verification
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your AI Video Generator is ready at:
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo Running verification...
echo.

REM Run verification
if exist verify-setup.bat (
    call verify-setup.bat
)

echo.
echo ========================================
echo Next Steps:
echo   1. Open http://localhost:3000 in your browser
echo   2. Create a new project
echo   3. Write or paste your video script
echo   4. Generate your first AI video!
echo.
echo To stop: docker-compose down
echo To view logs: docker-compose logs -f
echo ========================================
echo.
pause
