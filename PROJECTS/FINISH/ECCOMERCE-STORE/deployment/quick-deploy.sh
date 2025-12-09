#!/bin/bash
# Quick Deployment Script - Choose your platform

echo "🚀 E-Commerce Platform Deployment"
echo "=================================="
echo ""
echo "Choose deployment platform:"
echo "1) Vercel (Frontend)"
echo "2) Railway (Backend)"
echo "3) Render (Backend)"
echo "4) Docker (Full Stack)"
echo "5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
  1)
    echo "📦 Deploying to Vercel..."
    cd ../client
    npm install
    npm run build
    npx vercel --prod
    ;;
  2)
    echo "🚂 Deploying to Railway..."
    cd ../server
    railway up
    ;;
  3)
    echo "🎨 Deploying to Render..."
    echo "Please push to GitHub and connect via Render dashboard"
    echo "Config file: deployment/render.yaml"
    ;;
  4)
    echo "🐳 Starting Docker deployment..."
    cd ..
    docker-compose -f deployment/docker-compose.yml up -d
    echo "✅ Docker containers started"
    docker-compose -f deployment/docker-compose.yml ps
    ;;
  5)
    echo "👋 Goodbye!"
    exit 0
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Deployment initiated!"
