#!/bin/bash
# Production Environment Setup Script

set -e

echo "🔧 Setting up Production Environment..."
echo ""

# Check if .env.production exists
if [ ! -f "../server/.env.production" ]; then
    echo "📝 Creating .env.production from template..."
    cp .env.production.example ../server/.env.production
    echo "⚠️  Please edit server/.env.production with your actual values"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd ../server && npm install --production
cd ../client && npm install

# Build frontend
echo "🏗️  Building frontend..."
cd ../client && npm run build

# Run tests
echo "🧪 Running tests..."
cd ../server && node tests/production-ready-test.js

# Database check
echo "📊 Checking database connection..."
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ Database connected'); process.exit(0); })
  .catch(err => { console.error('❌ Database error:', err.message); process.exit(1); });
"

echo ""
echo "✅ Production environment ready!"
echo ""
echo "Next steps:"
echo "1. Review server/.env.production"
echo "2. Run: npm start (in server directory)"
echo "3. Deploy frontend build to CDN"
