# Quick Start Guide - AI Video Generator

Get your AI Video Generator platform up and running in 5 minutes!

## Prerequisites

✅ Docker Desktop installed and running  
✅ 8GB+ RAM available  
✅ 10GB+ free disk space

## Step-by-Step Setup

### Step 1: Start Docker Services

Open your terminal and run:

```bash
docker-compose up -d
```

This starts all required services:

- PostgreSQL (database)
- Redis (cache & queue)
- Ollama (AI language model)
- Backend API (FastAPI)
- Celery Worker (background jobs)
- Frontend (Next.js)

**Wait 30-60 seconds** for all services to start.

### Step 2: Verify Services

Check if everything is running:

**Windows:**

```bash
verify-setup.bat
```

**Linux/Mac:**

```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

You should see ✅ for all services.

### Step 3: Setup Ollama AI Model

Download the AI model for script parsing:

**Windows:**

```bash
setup-ollama.bat
```

**Linux/Mac:**

```bash
chmod +x setup-ollama.sh
./setup-ollama.sh
```

This downloads llama3 (~4.7GB). **Takes 5-15 minutes** depending on internet speed.

☕ Grab a coffee while it downloads!

### Step 4: Initialize Database

Create the database tables:

```bash
docker exec videogen-api alembic upgrade head
```

### Step 5: Access Your Platform

Open your browser:

🌐 **Frontend:** http://localhost:3000  
🔧 **Backend API:** http://localhost:8000  
📚 **API Documentation:** http://localhost:8000/docs

## Create Your First Video

1. Go to http://localhost:3000
2. Click **"New Project"**
3. Enter a project name and description
4. Write or paste your video script
5. Click **"Parse Script"** to extract scenes
6. Click **"Generate Video"** to start production
7. Monitor progress in the dashboard

## Example Script

Try this sample script:

```
Scene 1: A young wizard stands in a mystical forest at dawn.
The morning light filters through ancient trees.
Wizard: "The journey begins today."

Scene 2: The wizard walks along a winding path, staff in hand.
Birds chirp in the background.
Wizard: "Magic awaits those who seek it."

Scene 3: The wizard arrives at a glowing portal.
The portal pulses with blue energy.
Wizard: "Here we go!"
```

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f ollama
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart api
```

### Stop Services

```bash
docker-compose down
```

### Start Services Again

```bash
docker-compose up -d
```

## Troubleshooting

### Services Won't Start

**Problem:** Containers fail to start

**Solution:**

```bash
# Check Docker Desktop is running
docker info

# View error logs
docker-compose logs

# Restart Docker Desktop and try again
docker-compose down
docker-compose up -d
```

### Ollama Model Download Fails

**Problem:** setup-ollama script fails

**Solution:**

```bash
# Try manual download with longer timeout
docker exec videogen-ollama sh -c "OLLAMA_TIMEOUT=600 ollama pull llama3"

# Or use smaller model
docker exec videogen-ollama ollama pull mistral
```

### Frontend Shows Connection Error

**Problem:** Can't connect to backend

**Solution:**

```bash
# Check if backend is running
docker-compose ps

# Restart backend
docker-compose restart api

# Wait 30 seconds and refresh browser
```

### Out of Memory

**Problem:** Docker runs out of memory

**Solution:**

1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory to 8GB or more
4. Click "Apply & Restart"
5. Run `docker-compose up -d` again

## Resource Usage

Your platform will use approximately:

- **RAM:** 6-10GB (depending on workload)
- **Disk:** 10-15GB (models + data)
- **CPU:** Moderate (high during video generation)

## What's Running?

| Service     | Port  | Purpose           |
| ----------- | ----- | ----------------- |
| Frontend    | 3000  | Web interface     |
| Backend API | 8000  | REST API          |
| PostgreSQL  | 5432  | Database          |
| Redis       | 6379  | Cache & Queue     |
| Ollama      | 11434 | AI Language Model |

## Next Steps

✅ Platform is running  
✅ Create your first project  
✅ Generate your first video

### Advanced Features

- **Custom Characters:** Define character appearances for consistency
- **Scene Editing:** Modify generated scenes before video creation
- **Prompt Tuning:** Adjust image generation prompts
- **Background Music:** Add AI-generated music
- **Voice Synthesis:** Generate character voices

### Learn More

- 📖 [DOCKER_SETUP.md](DOCKER_SETUP.md) - Detailed Docker guide
- 📖 [README.md](README.md) - Full documentation
- 🔧 API Docs: http://localhost:8000/docs

## Getting Help

If you encounter issues:

1. Run verification: `verify-setup.bat` (or `.sh`)
2. Check logs: `docker-compose logs -f`
3. Review [DOCKER_SETUP.md](DOCKER_SETUP.md) troubleshooting section

## Stopping the Platform

When you're done:

```bash
# Stop all services (keeps data)
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

---

🎉 **Enjoy creating AI-generated videos!**
