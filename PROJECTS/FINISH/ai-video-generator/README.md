# AI Video Generator

A comprehensive text-to-video generation platform that enables users to create videos from scripts using open-source AI models.

## Features

- **Script-to-Video Generation**: Convert text scripts into complete videos
- **Character Generation**: Create custom characters from text descriptions
- **Scene & Background Generation**: Generate environments and settings
- **Animation**: Animate static images with realistic motion
- **Voice Synthesis**: Generate character dialogue with TTS
- **Lip Synchronization**: Sync character mouth movements with audio
- **Background Music**: AI-generated music matching video mood
- **Video Assembly**: Combine all elements into polished videos

## Tech Stack

### Backend

- **FastAPI**: REST API framework
- **PostgreSQL**: Database
- **SQLAlchemy**: ORM
- **Celery**: Async task queue
- **Redis**: Message broker and caching

### Frontend

- **Next.js 15.5.6**: React framework with App Router
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **DaisyUI**: UI components

### AI/ML

- **Stable Diffusion XL**: Image generation
- **AnimateDiff**: Animation
- **Ollama**: Script parsing (Llama 3/Mistral)
- **Coqui TTS**: Voice synthesis
- **MusicGen**: Music generation
- **Wav2Lip**: Lip synchronization
- **FFmpeg/MoviePy**: Video processing

## Project Structure

```
ai-video-generator/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── tasks/       # Celery tasks
│   ├── alembic/         # Database migrations
│   └── requirements.txt
├── client/              # Next.js frontend
│   ├── src/
│   │   └── app/        # App Router pages
│   └── package.json
├── docker-compose.yml   # Docker services
└── README.md
```

## Getting Started

### Prerequisites

- **Docker Desktop** installed and running
- At least **8GB RAM** available for Docker
- **10GB free disk space** (for AI models)
- NVIDIA GPU (optional, for faster generation)

### Quick Start with Docker (Recommended)

**One-Command Setup:**

**Windows:**

```bash
start.bat
```

**Linux/Mac:**

```bash
chmod +x start.sh
./start.sh
```

This automated script will:

1. ✅ Check Docker is running
2. ✅ Start all services (PostgreSQL, Redis, Ollama, API, Worker, Frontend)
3. ✅ Download AI models (~4.7GB, takes 5-15 minutes)
4. ✅ Initialize database
5. ✅ Verify everything is working

**Then access:**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Manual Setup (Alternative)

If you prefer step-by-step control:

1. **Start services:** `docker-compose up -d`
2. **Setup Ollama:** `setup-ollama.bat` (Windows) or `./setup-ollama.sh` (Linux/Mac)
3. **Initialize DB:** `docker exec videogen-api alembic upgrade head`
4. **Verify:** `verify-setup.bat` (Windows) or `./verify-setup.sh` (Linux/Mac)

### Detailed Guides

For comprehensive setup instructions, troubleshooting, and configuration options:

📖 **[QUICK_START.md](QUICK_START.md)** - 5-minute quick start guide  
📖 **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Complete Docker setup & troubleshooting

### Local Development

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

## API Documentation

Once the backend is running, visit:

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Environment Variables

See `backend/.env.example` for all available configuration options.

## License

[Your License Here]

## Contributing

[Contributing guidelines here]
