# Design Document

## Overview

The AI Video Generator System is a microservices-based platform that orchestrates multiple AI models to transform text scripts into complete videos. The architecture separates concerns into specialized services: script analysis (Ollama), image generation (Stable Diffusion), animation (AnimateDiff/Deforum), voice synthesis (Coqui TTS), music generation (MusicGen), lip synchronization (Wav2Lip), and video assembly (FFmpeg/MoviePy). A FastAPI backend coordinates these services through an asynchronous job queue (Celery), while a React frontend provides the user interface. All components run in Docker containers with shared storage for assets and generated content.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                      (Next.js Frontend)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│                    (FastAPI + Nginx)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Project    │    │   Generation │    │    Asset     │
│  Management  │    │   Controller │    │  Management  │
│   Service    │    │   Service    │    │   Service    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Celery Queue   │
                  │  (Redis Broker) │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Script     │  │    Image     │  │  Animation   │
│   Parser     │  │  Generator   │  │   Engine     │
│  (Ollama)    │  │(Stable Diff) │  │(AnimateDiff) │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Voice     │  │    Music     │  │   Lip Sync   │
│ Synthesizer  │  │  Generator   │  │    Engine    │
│ (Coqui TTS)  │  │ (MusicGen)   │  │  (Wav2Lip)   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     Video       │
                  │   Assembler     │
                  │ (FFmpeg/MoviePy)│
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   Database      │
                  └─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Shared Storage │
                  │  (Volume Mount) │
                  └─────────────────┘
```

### Service Communication Flow

1. **User Request Flow**: User submits script → Frontend → API Gateway → Generation Controller → Celery Queue
2. **Processing Flow**: Celery Worker picks job → Script Parser → Image Generator → Animation Engine → Voice/Music/Lip Sync → Video Assembler
3. **Progress Updates**: Workers publish progress → Redis Pub/Sub → WebSocket → Frontend
4. **Asset Storage**: Generated assets → Shared Volume → Database metadata → Asset Management Service

### Technology Stack

**Frontend:**

- Next.js 15.5.6 with TypeScript and App Router
- TailwindCSS for styling
- React Query for state management
- Socket.IO client for real-time updates
- Monaco Editor for script editing
- Video.js for video playback

**Backend:**

- Python 3.11+
- FastAPI for REST API
- Celery for async task queue
- Redis for message broker and caching
- PostgreSQL for relational data
- SQLAlchemy ORM
- Pydantic for data validation

**AI/ML Services:**

- Ollama (Llama 3 or Mistral) for script parsing
- Stable Diffusion XL for image generation
- AnimateDiff for animation
- Coqui TTS or Bark for voice synthesis
- MusicGen (Meta) for music generation
- Wav2Lip for lip synchronization
- FFmpeg and MoviePy for video processing

**Infrastructure:**

- Docker and Docker Compose
- Nginx as reverse proxy
- MinIO or local volumes for file storage
- Prometheus + Grafana for monitoring (optional)

## Components and Interfaces

### 1. API Gateway (FastAPI)

**Responsibilities:**

- HTTP request routing
- Authentication and authorization
- WebSocket connections for real-time updates
- Request validation and error handling
- Rate limiting and throttling

**Key Endpoints:**

```python
POST   /api/projects                    # Create new project
GET    /api/projects                    # List user projects
GET    /api/projects/{id}               # Get project details
PUT    /api/projects/{id}               # Update project
DELETE /api/projects/{id}               # Delete project

POST   /api/projects/{id}/generate      # Start video generation
GET    /api/jobs/{id}                   # Get job status
POST   /api/jobs/{id}/cancel            # Cancel job

POST   /api/scenes                      # Create scene
PUT    /api/scenes/{id}                 # Update scene
POST   /api/scenes/{id}/regenerate      # Regenerate scene

GET    /api/assets                      # List assets
POST   /api/assets                      # Upload asset
GET    /api/assets/{id}                 # Get asset
DELETE /api/assets/{id}                 # Delete asset

GET    /api/models                      # List available models
POST   /api/models/download             # Download model
PUT    /api/models/activate             # Activate model

WS     /ws/jobs/{id}                    # WebSocket for job updates
```

### 2. Script Parser Service

**Responsibilities:**

- Parse input scripts using Ollama LLM
- Extract scenes, characters, dialogue, and actions
- Generate detailed prompts for image generation
- Identify character consistency requirements

**Interface:**

```python
class ScriptParserService:
    def parse_script(self, script: str) -> ParsedScript:
        """
        Parse script into structured scenes.

        Returns:
            ParsedScript with scenes, characters, and metadata
        """
        pass

    def extract_characters(self, script: str) -> List[Character]:
        """Extract character descriptions from script."""
        pass

    def generate_image_prompts(self, scene: Scene) -> ImagePrompts:
        """Generate detailed prompts for image generation."""
        pass
```

**Ollama Integration:**

- Model: Llama 3 8B or Mistral 7B
- Prompt template for scene extraction
- JSON output parsing
- Character tracking across scenes

### 3. Image Generator Service

**Responsibilities:**

- Generate images from text prompts using Stable Diffusion
- Maintain character consistency using embeddings/LoRA
- Generate backgrounds and environments
- Composite characters with backgrounds

**Interface:**

```python
class ImageGeneratorService:
    def generate_image(
        self,
        prompt: str,
        negative_prompt: str = "",
        style: str = "realistic",
        width: int = 1024,
        height: int = 1024,
        seed: Optional[int] = None,
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5
    ) -> GeneratedImage:
        """Generate image from text prompt."""
        pass

    def generate_character(
        self,
        character: Character,
        pose: str,
        expression: str
    ) -> GeneratedImage:
        """Generate character with specific pose and expression."""
        pass

    def generate_background(
        self,
        description: str,
        style: str
    ) -> GeneratedImage:
        """Generate background/environment."""
        pass

    def composite_scene(
        self,
        character_img: Image,
        background_img: Image
    ) -> GeneratedImage:
        """Composite character onto background."""
        pass
```

**Stable Diffusion Configuration:**

- Model: SDXL 1.0 or custom checkpoint
- ControlNet for pose control
- LoRA for character consistency
- Inpainting for scene composition
- Batch processing for efficiency

### 4. Animation Engine Service

**Responsibilities:**

- Convert static images to animated video clips
- Apply motion and camera movements
- Control animation parameters

**Interface:**

```python
class AnimationEngineService:
    def animate_image(
        self,
        image: Image,
        motion_prompt: str,
        duration: float = 3.0,
        fps: int = 24,
        motion_strength: float = 0.7
    ) -> VideoClip:
        """Animate static image into video clip."""
        pass

    def apply_camera_motion(
        self,
        clip: VideoClip,
        motion_type: str,  # pan, zoom, tilt, rotate
        intensity: float = 0.5
    ) -> VideoClip:
        """Apply camera motion to video clip."""
        pass
```

**Animation Models:**

- AnimateDiff for motion generation
- Deforum for camera movements
- Frame interpolation for smoothness

### 5. Voice Synthesizer Service

**Responsibilities:**

- Generate speech from text using TTS models
- Manage voice profiles for characters
- Support multiple languages and emotions

**Interface:**

```python
class VoiceSynthesizerService:
    def synthesize_speech(
        self,
        text: str,
        voice_id: str,
        language: str = "en",
        emotion: str = "neutral",
        speed: float = 1.0
    ) -> AudioClip:
        """Generate speech audio from text."""
        pass

    def create_voice_profile(
        self,
        character: Character,
        voice_params: VoiceParams
    ) -> str:
        """Create voice profile for character."""
        pass

    def list_available_voices(self) -> List[Voice]:
        """List available voice options."""
        pass
```

**TTS Configuration:**

- Coqui TTS or Bark for voice generation
- Voice cloning for custom characters
- SSML support for prosody control

### 6. Music Generator Service

**Responsibilities:**

- Generate background music from text descriptions
- Match music duration to video length
- Support various genres and moods

**Interface:**

```python
class MusicGeneratorService:
    def generate_music(
        self,
        description: str,
        duration: float,
        genre: str = "cinematic",
        tempo: int = 120,
        mood: str = "neutral"
    ) -> AudioClip:
        """Generate background music."""
        pass

    def extend_music(
        self,
        audio: AudioClip,
        target_duration: float
    ) -> AudioClip:
        """Extend music to match target duration."""
        pass
```

**Music Generation:**

- MusicGen (Meta) or AudioCraft
- Conditional generation based on prompts
- Seamless looping for longer videos

### 7. Lip Sync Engine Service

**Responsibilities:**

- Synchronize character mouth movements with audio
- Preserve visual quality during processing
- Handle multiple speakers

**Interface:**

```python
class LipSyncEngineService:
    def apply_lip_sync(
        self,
        video: VideoClip,
        audio: AudioClip,
        face_bbox: Optional[BoundingBox] = None
    ) -> VideoClip:
        """Apply lip sync to video with audio."""
        pass

    def detect_faces(
        self,
        video: VideoClip
    ) -> List[BoundingBox]:
        """Detect faces in video for lip sync."""
        pass
```

**Lip Sync Implementation:**

- Wav2Lip model for synchronization
- Face detection using MediaPipe or RetinaFace
- Quality preservation techniques

### 8. Video Assembler Service

**Responsibilities:**

- Combine all generated assets into final video
- Apply transitions between scenes
- Mix audio tracks (dialogue, music, effects)
- Export in various formats and resolutions

**Interface:**

```python
class VideoAssemblerService:
    def assemble_video(
        self,
        scenes: List[VideoClip],
        audio_tracks: List[AudioClip],
        transitions: List[Transition],
        output_config: OutputConfig
    ) -> VideoFile:
        """Assemble final video from components."""
        pass

    def add_transition(
        self,
        clip1: VideoClip,
        clip2: VideoClip,
        transition_type: str = "fade",
        duration: float = 0.5
    ) -> VideoClip:
        """Add transition between clips."""
        pass

    def mix_audio(
        self,
        dialogue: AudioClip,
        music: AudioClip,
        music_volume: float = 0.3
    ) -> AudioClip:
        """Mix dialogue and background music."""
        pass

    def export_video(
        self,
        video: VideoClip,
        output_path: str,
        resolution: str = "1080p",
        aspect_ratio: str = "16:9",
        codec: str = "h264",
        bitrate: str = "5M"
    ) -> VideoFile:
        """Export video to file."""
        pass
```

**Video Processing:**

- FFmpeg for encoding and format conversion
- MoviePy for Python-based editing
- Hardware acceleration (NVENC) when available

### 9. Asset Management Service

**Responsibilities:**

- Store and retrieve generated assets
- Manage asset metadata and tags
- Provide search and filtering
- Handle asset versioning

**Interface:**

```python
class AssetManagementService:
    def save_asset(
        self,
        asset_data: bytes,
        asset_type: str,
        metadata: Dict[str, Any]
    ) -> Asset:
        """Save asset to storage."""
        pass

    def get_asset(self, asset_id: str) -> Asset:
        """Retrieve asset by ID."""
        pass

    def search_assets(
        self,
        query: str,
        asset_type: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> List[Asset]:
        """Search assets by criteria."""
        pass

    def delete_asset(self, asset_id: str) -> bool:
        """Delete asset from storage."""
        pass
```

### 10. Job Queue and Worker System

**Responsibilities:**

- Manage asynchronous video generation jobs
- Distribute work across multiple workers
- Track job progress and status
- Handle failures and retries

**Celery Tasks:**

```python
@celery_app.task(bind=True)
def generate_video_task(self, project_id: str):
    """Main task for video generation pipeline."""
    # 1. Parse script
    # 2. Generate images for each scene
    # 3. Animate images
    # 4. Generate audio (voice + music)
    # 5. Apply lip sync
    # 6. Assemble final video
    # 7. Update job status
    pass

@celery_app.task
def generate_scene_task(scene_id: str):
    """Generate single scene."""
    pass

@celery_app.task
def regenerate_asset_task(asset_id: str, params: Dict):
    """Regenerate specific asset."""
    pass
```

**Job Status Updates:**

- Redis Pub/Sub for real-time progress
- WebSocket push to frontend
- Database persistence for history

## Data Models

### Database Schema

```python
from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    script = Column(String, nullable=False)
    status = Column(Enum("draft", "processing", "completed", "failed"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    settings = Column(JSON)  # style, resolution, aspect_ratio, etc.

    scenes = relationship("Scene", back_populates="project")
    video_file = relationship("VideoFile", back_populates="project", uselist=False)

class Scene(Base):
    __tablename__ = "scenes"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    scene_number = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    dialogue = Column(String)
    duration = Column(Float, default=5.0)
    image_prompt = Column(String)
    motion_prompt = Column(String)
    status = Column(Enum("pending", "generating", "completed", "failed"))

    project = relationship("Project", back_populates="scenes")
    assets = relationship("SceneAsset", back_populates="scene")

class Character(Base):
    __tablename__ = "characters"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    visual_embedding = Column(String)  # Path to LoRA or embedding
    voice_profile_id = Column(String)
    appearance_params = Column(JSON)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True)
    asset_type = Column(Enum("image", "video", "audio", "character", "background"))
    file_path = Column(String, nullable=False)
    thumbnail_path = Column(String)
    metadata = Column(JSON)
    tags = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    reusable = Column(Boolean, default=True)

class SceneAsset(Base):
    __tablename__ = "scene_assets"

    id = Column(String, primary_key=True)
    scene_id = Column(String, ForeignKey("scenes.id"))
    asset_id = Column(String, ForeignKey("assets.id"))
    asset_role = Column(Enum("character", "background", "video", "audio", "music"))

    scene = relationship("Scene", back_populates="assets")
    asset = relationship("Asset")

class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    job_type = Column(Enum("full_video", "single_scene", "asset_regeneration"))
    status = Column(Enum("queued", "processing", "completed", "failed", "cancelled"))
    progress = Column(Float, default=0.0)
    current_stage = Column(String)
    error_message = Column(String)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    celery_task_id = Column(String)

class VideoFile(Base):
    __tablename__ = "video_files"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    file_path = Column(String, nullable=False)
    resolution = Column(String)
    aspect_ratio = Column(String)
    duration = Column(Float)
    file_size = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="video_file")

class ModelConfig(Base):
    __tablename__ = "model_configs"

    id = Column(String, primary_key=True)
    model_type = Column(Enum("image_gen", "animation", "tts", "music", "lip_sync"))
    model_name = Column(String, nullable=False)
    model_path = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    parameters = Column(JSON)
    download_url = Column(String)
```

## Error Handling

### Error Categories

1. **User Input Errors (400)**

   - Invalid script format
   - Missing required fields
   - Invalid parameter values
   - Unsupported file formats

2. **Resource Errors (404, 409)**

   - Project not found
   - Asset not found
   - Model not available
   - Duplicate resource

3. **Processing Errors (500)**

   - Model inference failure
   - GPU out of memory
   - File system errors
   - Network timeouts

4. **Service Errors (503)**
   - Service unavailable
   - Queue full
   - Rate limit exceeded

### Error Handling Strategy

```python
class VideoGeneratorException(Exception):
    """Base exception for video generator."""
    def __init__(self, message: str, error_code: str, details: Dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}

class ScriptParsingError(VideoGeneratorException):
    """Error during script parsing."""
    pass

class ImageGenerationError(VideoGeneratorException):
    """Error during image generation."""
    pass

class VideoAssemblyError(VideoGeneratorException):
    """Error during video assembly."""
    pass

# Error handler middleware
@app.exception_handler(VideoGeneratorException)
async def video_generator_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )
```

### Retry Logic

- Transient failures: Retry up to 3 times with exponential backoff
- GPU OOM: Reduce batch size and retry
- Network errors: Retry with timeout increase
- Model loading failures: Fallback to alternative model

### Graceful Degradation

- If GPU unavailable: Use CPU with performance warning
- If model unavailable: Use fallback model
- If service down: Queue job for later processing
- If storage full: Cleanup old assets and retry

## Testing Strategy

### Unit Tests

**Coverage Areas:**

- Script parsing logic
- Image prompt generation
- Asset management operations
- Database models and queries
- API endpoint validation

**Tools:**

- pytest for test framework
- pytest-asyncio for async tests
- pytest-mock for mocking
- factory_boy for test data

### Integration Tests

**Coverage Areas:**

- End-to-end video generation pipeline
- Service-to-service communication
- Database transactions
- File storage operations
- Celery task execution

**Test Scenarios:**

- Complete video generation from script
- Scene regeneration
- Asset reuse across projects
- Concurrent job processing
- Error recovery and retries

### Performance Tests

**Metrics:**

- Video generation time per scene
- GPU memory usage
- API response times
- Queue throughput
- Storage I/O performance

**Tools:**

- Locust for load testing
- Prometheus for metrics collection
- cProfile for Python profiling

### Model Quality Tests

**Evaluation:**

- Image generation quality (FID score)
- Animation smoothness (frame consistency)
- Voice synthesis naturalness (MOS score)
- Lip sync accuracy (sync error)
- Music coherence

**Manual Review:**

- Visual quality assessment
- Audio quality assessment
- Overall video coherence
- User acceptance testing

## Deployment Architecture

### Docker Compose Services

```yaml
version: "3.8"

services:
  # Frontend
  web:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
    depends_on:
      - api

  # API Gateway
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/videogen
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - shared_storage:/app/storage

  # Celery Workers
  worker:
    build: ./backend
    command: celery -A app.celery worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/videogen
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - db
    volumes:
      - shared_storage:/app/storage
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # Ollama Service
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # Stable Diffusion Service
  stable_diffusion:
    build: ./services/stable_diffusion
    ports:
      - "7860:7860"
    volumes:
      - sd_models:/models
      - shared_storage:/app/storage
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=videogen
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - web
      - api

volumes:
  shared_storage:
  postgres_data:
  ollama_models:
  sd_models:
```

### Scaling Considerations

**Horizontal Scaling:**

- Multiple Celery workers for parallel processing
- Load balancer for API instances
- Read replicas for database

**Vertical Scaling:**

- GPU memory for larger models
- CPU cores for video encoding
- RAM for caching and buffers

**Storage Scaling:**

- Object storage (S3/MinIO) for assets
- CDN for video delivery
- Database sharding for large datasets

### Monitoring and Observability

**Metrics:**

- Job queue length and processing time
- GPU utilization and memory
- API latency and error rates
- Storage usage and I/O
- Model inference time

**Logging:**

- Structured logging with JSON format
- Centralized log aggregation (ELK stack)
- Error tracking (Sentry)
- Audit logs for user actions

**Alerting:**

- Queue backlog threshold
- GPU memory exhaustion
- Service health checks
- Storage capacity warnings

## Security Considerations

### Authentication and Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- API key management for external integrations
- Session management and timeout

### Data Protection

- Encryption at rest for sensitive data
- TLS/SSL for data in transit
- Secure file upload validation
- Input sanitization and validation

### Resource Protection

- Rate limiting per user/IP
- Request size limits
- GPU time quotas
- Storage quotas per user

### Model Security

- Model file integrity verification
- Sandboxed model execution
- Resource limits for inference
- Prompt injection prevention

## Performance Optimization

### Caching Strategy

- Redis cache for API responses
- Model output caching for identical prompts
- Asset thumbnail caching
- Database query result caching

### GPU Optimization

- Batch processing for multiple scenes
- Model quantization (FP16/INT8)
- Dynamic batching for inference
- GPU memory pooling

### Video Processing Optimization

- Hardware-accelerated encoding (NVENC)
- Parallel scene processing
- Streaming video assembly
- Progressive video generation

### Database Optimization

- Indexed queries for common operations
- Connection pooling
- Query optimization and EXPLAIN analysis
- Materialized views for complex queries
