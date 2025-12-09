# Docker Setup Guide - AI Video Generator

This guide will help you run the entire AI Video Generator platform using Docker, including Ollama for LLM-powered script parsing.

## Prerequisites

- Docker Desktop installed and running
- At least 8GB RAM available for Docker
- 10GB free disk space (for Ollama models)

## Quick Start

### 1. Start All Services

```bash
# Start all containers
docker-compose up -d

# Check if all services are running
docker-compose ps
```

You should see these services running:

- `videogen-db` (PostgreSQL)
- `videogen-redis` (Redis)
- `videogen-ollama` (Ollama LLM)
- `videogen-api` (FastAPI Backend)
- `videogen-worker` (Celery Worker)
- `videogen-web` (Next.js Frontend)

### 2. Setup Ollama Models

After all containers are running, pull the required LLM model:

**Windows:**

```bash
setup-ollama.bat
```

**Linux/Mac:**

```bash
chmod +x setup-ollama.sh
./setup-ollama.sh
```

**Or manually:**

```bash
docker exec videogen-ollama ollama pull llama3
```

This will download the llama3 model (~4.7GB). It may take 5-15 minutes depending on your internet speed.

### 3. Initialize Database

```bash
# Run database migrations
docker exec videogen-api alembic upgrade head
```

### 4. Access the Platform

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Ollama API:** http://localhost:11434

## Service Details

### Ollama Service

The Ollama service provides local LLM capabilities for:

- **Script Parsing:** Converts text scripts into structured scenes and characters
- **Prompt Generation:** Creates detailed image prompts for Stable Diffusion
- **Character Consistency:** Maintains character descriptions across scenes

**Default Model:** llama3 (4.7GB)

**Alternative Models:**

```bash
# Smaller, faster model (good for testing)
docker exec videogen-ollama ollama pull mistral

# Larger, more capable model
docker exec videogen-ollama ollama pull llama3:70b
```

**Check Available Models:**

```bash
docker exec videogen-ollama ollama list
```

### Resource Requirements

| Service       | RAM        | Disk        | Notes           |
| ------------- | ---------- | ----------- | --------------- |
| PostgreSQL    | 256MB      | 1GB         | Database        |
| Redis         | 128MB      | 100MB       | Cache & Queue   |
| Ollama        | 4-8GB      | 5-10GB      | LLM Service     |
| Backend API   | 512MB      | 1GB         | FastAPI         |
| Celery Worker | 1GB        | 2GB         | Background Jobs |
| Frontend      | 256MB      | 500MB       | Next.js         |
| **Total**     | **6-10GB** | **10-15GB** |                 |

## Troubleshooting

### Ollama Container Won't Start

**Issue:** Ollama service fails health check

**Solution:**

```bash
# Check Ollama logs
docker logs videogen-ollama

# Restart Ollama
docker-compose restart ollama

# Wait for health check
docker-compose ps
```

### Model Download Fails

**Issue:** `ollama pull` command times out or fails

**Solution:**

```bash
# Increase timeout and retry
docker exec videogen-ollama sh -c "OLLAMA_TIMEOUT=600 ollama pull llama3"

# Or download a smaller model first
docker exec videogen-ollama ollama pull mistral
```

### Backend Can't Connect to Ollama

**Issue:** Script parsing fails with connection error

**Solution:**

```bash
# Check if Ollama is healthy
docker exec videogen-ollama curl http://localhost:11434/api/tags

# Verify network connectivity
docker exec videogen-api curl http://ollama:11434/api/tags

# Restart backend
docker-compose restart api worker
```

### Out of Memory

**Issue:** Docker runs out of memory

**Solution:**

1. Increase Docker Desktop memory limit (Settings → Resources → Memory)
2. Use a smaller Ollama model:
   ```bash
   docker exec videogen-ollama ollama pull mistral
   ```
3. Stop other Docker containers

## Development Mode

For development with hot-reload:

```bash
# Start services
docker-compose up

# View logs
docker-compose logs -f api

# Restart specific service
docker-compose restart api
```

## Production Mode

For production deployment:

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# With GPU support for Ollama (if available)
docker-compose -f docker-compose.prod.yml --profile with-gpu up -d
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Updating Services

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f ollama
docker-compose logs -f worker
```

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Configuration

### Environment Variables

Edit `.env` file or set in `docker-compose.yml`:

```env
# Ollama Configuration
OLLAMA_URL=http://ollama:11434

# Database
DATABASE_URL=postgresql://user:password@db:5432/videogen

# Redis
REDIS_URL=redis://redis:6379/0
```

### Changing Ollama Model

Edit `backend/app/services/ollama_client.py`:

```python
self.default_model = "mistral"  # Change from "llama3"
```

Then restart:

```bash
docker-compose restart api worker
```

## Next Steps

1. ✅ Start Docker services
2. ✅ Pull Ollama model
3. ✅ Initialize database
4. 🎬 Create your first video project at http://localhost:3000

## Support

For issues or questions:

- Check logs: `docker-compose logs -f`
- Verify all services are healthy: `docker-compose ps`
- Review this guide's troubleshooting section
