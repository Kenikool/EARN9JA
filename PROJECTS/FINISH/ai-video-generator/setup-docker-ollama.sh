#!/bin/bash
# Setup Ollama in Docker and pull required model

echo "========================================"
echo "Setting up Ollama for AI Video Generator"
echo "========================================"
echo ""

echo "Step 1: Starting Docker services..."
docker-compose up -d ollama
echo ""

echo "Step 2: Waiting for Ollama to be ready (30 seconds)..."
sleep 30
echo ""

echo "Step 3: Pulling llama3 model (this may take several minutes)..."
docker exec videogen-ollama ollama pull llama3
echo ""

echo "Step 4: Verifying model installation..."
docker exec videogen-ollama ollama list
echo ""

echo "========================================"
echo "Ollama setup complete!"
echo "========================================"
echo ""
echo "You can now start the full platform with:"
echo "  docker-compose up -d"
echo ""
