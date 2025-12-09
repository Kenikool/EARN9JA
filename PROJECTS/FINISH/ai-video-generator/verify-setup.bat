@echo off
REM Verification script to check if all services are running correctly (Windows)

echo.
echo Verifying AI Video Generator Setup...
echo.

REM Check if Docker is running
echo 1. Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop and try again
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Check if containers are running
echo 2. Checking containers...
set ALL_RUNNING=1

docker ps --format "{{.Names}}" | findstr /C:"videogen-db" >nul
if errorlevel 1 (
    echo [ERROR] videogen-db is not running
    set ALL_RUNNING=0
) else (
    echo [OK] videogen-db
)

docker ps --format "{{.Names}}" | findstr /C:"videogen-redis" >nul
if errorlevel 1 (
    echo [ERROR] videogen-redis is not running
    set ALL_RUNNING=0
) else (
    echo [OK] videogen-redis
)

docker ps --format "{{.Names}}" | findstr /C:"videogen-ollama" >nul
if errorlevel 1 (
    echo [ERROR] videogen-ollama is not running
    set ALL_RUNNING=0
) else (
    echo [OK] videogen-ollama
)

docker ps --format "{{.Names}}" | findstr /C:"videogen-api" >nul
if errorlevel 1 (
    echo [ERROR] videogen-api is not running
    set ALL_RUNNING=0
) else (
    echo [OK] videogen-api
)

docker ps --format "{{.Names}}" | findstr /C:"videogen-worker" >nul
if errorlevel 1 (
    echo [ERROR] videogen-worker is not running
    set ALL_RUNNING=0
) else (
    echo [OK] videogen-worker
)

docker ps --format "{{.Names}}" | findstr /C:"videogen-web" >nul
if errorlevel 1 (
    echo [ERROR] videogen-web is not running
    set ALL_RUNNING=0
) else (
    echo [OK] videogen-web
)
echo.

if %ALL_RUNNING%==0 (
    echo [WARNING] Some containers are not running. Start them with:
    echo    docker-compose up -d
    exit /b 1
)

REM Check PostgreSQL
echo 3. Checking PostgreSQL...
docker exec videogen-db pg_isready -U user >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PostgreSQL is not ready
) else (
    echo [OK] PostgreSQL is ready
)
echo.

REM Check Redis
echo 4. Checking Redis...
docker exec videogen-redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Redis is not ready
) else (
    echo [OK] Redis is ready
)
echo.

REM Check Ollama
echo 5. Checking Ollama...
docker exec videogen-ollama curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Ollama is not ready
) else (
    echo [OK] Ollama is ready
    echo    Checking installed models...
    docker exec videogen-ollama ollama list
)
echo.

REM Check Backend API
echo 6. Checking Backend API...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Backend API is not responding (may still be starting)
) else (
    echo [OK] Backend API is responding
)
echo.

REM Check Frontend
echo 7. Checking Frontend...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Frontend is not responding (may still be starting)
) else (
    echo [OK] Frontend is responding
)
echo.

REM Summary
echo ========================================
echo Summary
echo ========================================
echo.
echo Access your platform at:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo   Ollama:    http://localhost:11434
echo.

if %ALL_RUNNING%==1 (
    echo All services are running!
    echo.
    echo Next steps:
    echo   1. Ensure Ollama models are installed (run setup-ollama.bat)
    echo   2. Initialize database (docker exec videogen-api alembic upgrade head)
    echo   3. Open http://localhost:3000 and create your first video!
) else (
    echo Some services need attention
    echo Run: docker-compose up -d
)
