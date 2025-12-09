@echo off
REM Setup script to pull Ollama models after Docker containers are running (Windows)

echo.
echo Setting up Ollama models...
echo.

REM Wait for Ollama service to be ready
echo Waiting for Ollama service to start...
timeout /t 10 /nobreak >nul

REM Check if Ollama is running
docker ps | findstr videogen-ollama >nul
if errorlevel 1 (
    echo Error: Ollama container is not running!
    echo Please start Docker services first with: docker-compose up -d
    exit /b 1
)

echo Ollama service is running
echo.

REM Pull llama3 model (recommended for script parsing)
echo Pulling llama3 model (this may take several minutes)...
docker exec videogen-ollama ollama pull llama3

if errorlevel 1 (
    echo Failed to download llama3 model
    exit /b 1
)

echo llama3 model downloaded successfully
echo.
echo Ollama setup complete!
echo.
echo Available models:
docker exec videogen-ollama ollama list
echo.
echo You can now use the AI Video Generator platform!
