#!/bin/bash

# Earn9ja Production Setup Script
# This script prepares the production environment

set -e

echo "🚀 Earn9ja Production Setup"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

echo -e "${GREEN}✓${NC} .env file found"

# Check required environment variables
required_vars=(
    "NODE_ENV"
    "MONGODB_URI"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "PAYSTACK_SECRET_KEY"
    "FLUTTERWAVE_SECRET_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo -e "${GREEN}✓${NC} All required environment variables present"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci --production

echo -e "${GREEN}✓${NC} Dependencies installed"

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

echo -e "${GREEN}✓${NC} Build completed"

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp

echo -e "${GREEN}✓${NC} Directories created"

# Set permissions
echo ""
echo "🔐 Setting permissions..."
chmod 755 dist
chmod 755 logs
chmod 755 uploads
chmod 755 temp

echo -e "${GREEN}✓${NC} Permissions set"

# Test database connection
echo ""
echo "🗄️  Testing database connection..."
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ Database connection successful');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
"

# Create MongoDB indexes
echo ""
echo "📊 Creating MongoDB indexes..."
node dist/scripts/create-indexes.js || echo -e "${YELLOW}⚠ Index creation script not found (optional)${NC}"

echo ""
echo -e "${GREEN}✅ Production setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the DEPLOYMENT_GUIDE.md"
echo "2. Start the server with: npm start"
echo "3. Or use PM2: pm2 start dist/server.js --name earn9ja-backend"
echo ""
