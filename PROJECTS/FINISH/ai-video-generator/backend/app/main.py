"""FastAPI application entry point."""

import time
import traceback
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.exceptions import VideoGeneratorException
from app.utils.logger import setup_logging, get_logger

# Setup logging
setup_logging(log_level=settings.log_level, use_json=(settings.log_format == "json"))
logger = get_logger(__name__)

app = FastAPI(
    title="AI Video Generator API",
    description="API for generating videos from text scripts using AI",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and their processing time."""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log response
    logger.info(
        f"Response: {request.method} {request.url.path} "
        f"Status: {response.status_code} Time: {process_time:.3f}s"
    )
    
    return response


# Exception handlers
@app.exception_handler(VideoGeneratorException)
async def video_generator_exception_handler(request: Request, exc: VideoGeneratorException):
    """Handle custom application exceptions."""
    logger.error(
        f"Application error: {exc.error_code} - {exc.message}",
        extra={"error_code": exc.error_code, "details": exc.details},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    logger.error(
        f"HTTP error: {exc.status_code} - {exc.detail}",
        extra={"status_code": exc.status_code, "path": request.url.path},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "http_error",
            "message": exc.detail,
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    errors = exc.errors()
    logger.error(
        f"Validation error on {request.url.path}",
        extra={"errors": errors, "body": exc.body},
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "validation_error",
            "message": "Invalid request data",
            "details": errors,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    # Log full traceback for debugging
    logger.exception(
        f"Unhandled exception on {request.url.path}: {str(exc)}",
        extra={
            "exception_type": type(exc).__name__,
            "traceback": traceback.format_exc(),
        },
    )
    
    # Don't expose internal errors in production
    if settings.log_level == "DEBUG":
        error_detail = str(exc)
    else:
        error_detail = "An unexpected error occurred. Please contact support."
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "internal_server_error",
            "message": error_detail,
        },
    )


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("=" * 60)
    logger.info("Starting AI Video Generator API")
    logger.info(f"Version: {app.version}")
    logger.info(f"Environment: {settings.log_level}")
    logger.info(f"Database: {settings.database_url.split('@')[-1]}")  # Hide credentials
    logger.info(f"Redis: {settings.redis_url}")
    logger.info(f"CORS Origins: {settings.cors_origins}")
    logger.info("=" * 60)
    
    # TODO: Initialize services, check connections, etc.


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info("Shutting down AI Video Generator API")
    # TODO: Cleanup resources, close connections, etc.


# Root endpoints
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Video Generator API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    health_status = {
        "status": "healthy",
        "version": app.version,
        "services": {}
    }
    
    # Check database
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check Redis
    try:
        import redis
        r = redis.from_url(settings.redis_url)
        r.ping()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check Ollama
    try:
        from app.services.ollama_client import get_ollama_client
        ollama = get_ollama_client()
        is_healthy = await ollama.check_health()
        health_status["services"]["ollama"] = "healthy" if is_healthy else "unhealthy"
        if not is_healthy:
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["ollama"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status


# Include routers
from app.api.projects import router as projects_router
from app.api.scenes import router as scenes_router
from app.api.assets import router as assets_router
from app.api.jobs import router as jobs_router
from app.api.script_parser import router as script_parser_router
from app.api.models import router as models_router
from app.api.websocket import router as websocket_router

# Try to import AI service routers (may fail if libraries not installed)
try:
    from app.api.image_generation import router as image_generation_router
    IMAGE_GENERATION_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Image generation API not available: {e}")
    IMAGE_GENERATION_AVAILABLE = False

try:
    from app.api.animation import router as animation_router
    ANIMATION_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Animation API not available: {e}")
    ANIMATION_AVAILABLE = False

try:
    from app.api.music import router as music_router
    MUSIC_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Music API not available: {e}")
    MUSIC_AVAILABLE = False

try:
    from app.api.video_assembler import router as video_assembler_router
    VIDEO_ASSEMBLER_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Video assembler API not available: {e}")
    VIDEO_ASSEMBLER_AVAILABLE = False

app.include_router(projects_router)
app.include_router(scenes_router)
app.include_router(assets_router)
app.include_router(jobs_router)
app.include_router(script_parser_router)
app.include_router(models_router)
app.include_router(websocket_router)

# Include AI service routers if available
if IMAGE_GENERATION_AVAILABLE:
    app.include_router(image_generation_router)
    logger.info("Image generation API enabled")

if ANIMATION_AVAILABLE:
    app.include_router(animation_router)
    logger.info("Animation API enabled")

if MUSIC_AVAILABLE:
    app.include_router(music_router)
    logger.info("Music API enabled")

if VIDEO_ASSEMBLER_AVAILABLE:
    app.include_router(video_assembler_router)
    logger.info("Video assembler API enabled")
