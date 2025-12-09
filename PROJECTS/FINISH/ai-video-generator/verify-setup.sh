#!/bin/bash
# Verification script to check if all services are running correctly

echo "🔍 Verifying AI Video Generator Setup..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "1. Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if containers are running
echo "2. Checking containers..."
REQUIRED_CONTAINERS=("videogen-db" "videogen-redis" "videogen-ollama" "videogen-api" "videogen-worker" "videogen-web")
ALL_RUNNING=true

for container in "${REQUIRED_CONTAINERS[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo -e "${GREEN}✅ ${container}${NC}"
    else
        echo -e "${RED}❌ ${container} is not running${NC}"
        ALL_RUNNING=false
    fi
done
echo ""

if [ "$ALL_RUNNING" = false ]; then
    echo -e "${YELLOW}⚠️  Some containers are not running. Start them with:${NC}"
    echo "   docker-compose up -d"
    exit 1
fi

# Check PostgreSQL
echo "3. Checking PostgreSQL..."
if docker exec videogen-db pg_isready -U user > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
fi
echo ""

# Check Redis
echo "4. Checking Redis..."
if docker exec videogen-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis is not ready${NC}"
fi
echo ""

# Check Ollama
echo "5. Checking Ollama..."
if docker exec videogen-ollama curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama is ready${NC}"
    
    # Check if models are installed
    MODELS=$(docker exec videogen-ollama ollama list 2>/dev/null | tail -n +2)
    if [ -z "$MODELS" ]; then
        echo -e "${YELLOW}⚠️  No Ollama models installed${NC}"
        echo "   Run: setup-ollama.sh (or setup-ollama.bat on Windows)"
    else
        echo "   Installed models:"
        echo "$MODELS" | while read line; do
            echo "   - $line"
        done
    fi
else
    echo -e "${RED}❌ Ollama is not ready${NC}"
fi
echo ""

# Check Backend API
echo "6. Checking Backend API..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API is not responding (may still be starting)${NC}"
fi
echo ""

# Check Frontend
echo "7. Checking Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend is not responding (may still be starting)${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access your platform at:"
echo "  🌐 Frontend:  http://localhost:3000"
echo "  🔧 Backend:   http://localhost:8000"
echo "  📚 API Docs:  http://localhost:8000/docs"
echo "  🤖 Ollama:    http://localhost:11434"
echo ""

if [ "$ALL_RUNNING" = true ]; then
    echo -e "${GREEN}🎉 All services are running!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Ensure Ollama models are installed (run setup-ollama.sh)"
    echo "  2. Initialize database (docker exec videogen-api alembic upgrade head)"
    echo "  3. Open http://localhost:3000 and create your first video!"
else
    echo -e "${RED}⚠️  Some services need attention${NC}"
    echo "Run: docker-compose up -d"
fi
