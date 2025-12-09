#!/bin/bash
# Setup script to pull Ollama models after Docker containers are running

echo "🚀 Setting up Ollama models..."
echo ""

# Wait for Ollama service to be ready
echo "⏳ Waiting for Ollama service to start..."
sleep 10

# Check if Ollama is running
if ! docker ps | grep -q videogen-ollama; then
    echo "❌ Error: Ollama container is not running!"
    echo "Please start Docker services first with: docker-compose up -d"
    exit 1
fi

echo "✅ Ollama service is running"
echo ""

# Pull llama3 model (recommended for script parsing)
echo "📥 Pulling llama3 model (this may take several minutes)..."
docker exec videogen-ollama ollama pull llama3

if [ $? -eq 0 ]; then
    echo "✅ llama3 model downloaded successfully"
else
    echo "❌ Failed to download llama3 model"
    exit 1
fi

echo ""
echo "🎉 Ollama setup complete!"
echo ""
echo "Available models:"
docker exec videogen-ollama ollama list
echo ""
echo "You can now use the AI Video Generator platform!"
