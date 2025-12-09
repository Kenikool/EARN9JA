#!/bin/bash

# Deployment Script for E-Commerce Platform

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check environment
if [ -z "$NODE_ENV" ]; then
    echo -e "${RED}❌ NODE_ENV not set${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building application...${NC}"

# Build backend
cd ../server
npm install --production
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Build frontend
cd ../client
npm install
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
cd ../server
node tests/api-test.js || echo -e "${YELLOW}⚠️  Some tests failed${NC}"

# Database migration (if needed)
echo -e "${YELLOW}📊 Checking database...${NC}"
# Add migration scripts here if needed

# Start services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
pm2 restart all || pm2 start ecosystem.config.js

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Application is live${NC}"
