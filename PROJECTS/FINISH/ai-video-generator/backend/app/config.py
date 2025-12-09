"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    mongodb_uri: str = "mongodb://localhost:27017/videogen"
    database_pool_size: int = 20
    database_max_overflow: int = 10

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Celery
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_workers: int = 4
    secret_key: str = "your-secret-key-change-this"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:8000"

    # Storage
    storage_path: str = "/app/storage"
    assets_path: str = "/app/storage/assets"
    videos_path: str = "/app/storage/videos"
    models_path: str = "/app/storage/models"

    # AI Services
    ollama_url: str = "http://ollama:11434"
    stable_diffusion_url: str = "http://stable_diffusion:7860"

    # GPU
    cuda_visible_devices: str = "0"
    use_gpu: bool = True

    # Models
    default_image_model: str = "stabilityai/stable-diffusion-xl-base-1.0"
    default_animation_model: str = "guoyww/animatediff-motion-adapter-v1-5-2"
    default_tts_model: str = "tts_models/en/ljspeech/tacotron2-DDC"
    default_music_model: str = "facebook/musicgen-small"

    # Generation
    default_image_width: int = 1024
    default_image_height: int = 1024
    default_video_fps: int = 24
    default_scene_duration: float = 5.0
    default_inference_steps: int = 30
    default_guidance_scale: float = 7.5

    # Job Queue
    max_concurrent_jobs: int = 2
    job_timeout: int = 3600

    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # Environment
    environment: str = "development"

    @property
    def cors_origins_list(self) -> list[str]:
        """Get CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
