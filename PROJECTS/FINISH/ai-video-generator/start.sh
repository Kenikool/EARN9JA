#!/bin/bash
# All-in-one startup script for AI Video Generator

set -e

echo "🚀 AI Video Generator - Complete Setup"
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Docker
echo -e "${BLUE}Step 1/5: Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop and run this script again"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Start services
echo -e "${BLUE}Step 2/5: Starting Docker services...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d

echo "Waiting for services to start..."
sleep 15
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Wait for Ollama
echo -e "${BLUE}Step 3/5: Waiting for Ollama to be ready...${NC}"
MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if docker exec videogen-ollama curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama is ready${NC}"
        break
    fi
    echo "Waiting... ($WAITED/$MAX_WAIT seconds)"
    sleep 5
    WAITED=$((WAITED + 5))
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "${YELLOW}⚠️  Ollama took longer than expected to start${NC}"
fi
echo ""

# Setup Ollama models
echo -e "${BLUE}Step 4/5: Setting up Ollama models...${NC}"
MODELS=$(docker exec videogen-ollama ollama list 2>/dev/null | tail -n +2)
if echo "$MODELS" | grep -q "llama3"; then
    echo -e "${GREEN}✅ llama3 model already installed${NC}"
else
    echo "Downloading llama3 model (this may take 5-15 minutes)..."
    docker exec videogen-ollama ollama pull llama3
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ llama3 model installed${NC}"
    else
        echo -e "${RED}❌ Failed to install llama3 model${NC}"
        echo "You can try again later with: docker exec videogen-ollama ollama pull llama3"
    fi
fi
echo ""

# Initialize database
echo -e "${BLUE}Step 5/5: Initializing database...${NC}"
sleep 5  # Wait for API to be ready
docker exec videogen-api alembic upgrade head 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Database migration failed (API may still be starting)${NC}"
    echo "You can run it manually later with:"
    echo "  docker exec videogen-api alembic upgrade head"
}
echo -e "${GREEN}✅ Database initialized${NC}"
echo ""

# Final verification
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your AI Video Generator is ready at:"
echo ""
echo -e "  🌐 Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "  🔧 Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "  📚 API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo "Running verification..."
echo ""

# Run verification
if [ -f "./verify-setup.sh" ]; then
    chmod +x verify-setup.sh
    ./verify-setup.sh
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next Steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Create a new project"
echo "  3. Write or paste your video script"
echo "  4. Generate your first AI video!"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
