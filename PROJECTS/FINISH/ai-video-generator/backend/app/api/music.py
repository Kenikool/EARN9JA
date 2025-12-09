"""Music generation API endpoints."""

from fastapi import APIRouter, status
from fastapi.responses import FileResponse
import os

from app.services.music_generator import get_music_generator
from app.schemas.music import (
    MusicGenerationRequest,
    ExtendMusicRequest,
    SeamlessLoopRequest,
    AdjustTempoRequest,
    MixAudioRequest,
    MusicResponse,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/music", tags=["music"])


@router.post("/generate", response_model=MusicResponse)
async def generate_music(request: MusicGenerationRequest):
    """
    Generate background music from text description.
    
    Args:
        request: Music generation parameters
        
    Returns:
        Generated audio path
    """
    logger.info(
        f"Generating music",
        extra={
            "genre": request.genre,
            "tempo": request.tempo,
            "duration": request.duration,
        },
    )
    
    generator = get_music_generator()
    
    audio_path = generator.generate_music(
        description=request.description,
        duration=request.duration,
        genre=request.genre,
        tempo=request.tempo,
        mood=request.mood,
    )
    
    return MusicResponse(
        audio_path=audio_path,
        message="Music generated successfully",
        duration=request.duration,
    )


@router.post("/extend", response_model=MusicResponse)
async def extend_music(request: ExtendMusicRequest):
    """
    Extend music to match target duration.
    
    Args:
        request: Extension parameters
        
    Returns:
        Extended audio path
    """
    logger.info(f"Extending music to {request.target_duration} seconds")
    
    generator = get_music_generator()
    
    audio_path = generator.extend_music(
        audio_path=request.audio_path,
        target_duration=request.target_duration,
    )
    
    return MusicResponse(
        audio_path=audio_path,
        message="Music extended successfully",
        duration=request.target_duration,
    )


@router.post("/loop", response_model=MusicResponse)
async def create_loop(request: SeamlessLoopRequest):
    """
    Create seamless looping audio.
    
    Args:
        request: Loop parameters
        
    Returns:
        Loopable audio path
    """
    logger.info("Creating seamless loop")
    
    generator = get_music_generator()
    
    audio_path = generator.create_seamless_loop(
        audio_path=request.audio_path,
        loop_duration=request.loop_duration,
    )
    
    return MusicResponse(
        audio_path=audio_path,
        message="Seamless loop created successfully",
    )


@router.post("/adjust-tempo", response_model=MusicResponse)
async def adjust_tempo(request: AdjustTempoRequest):
    """
    Adjust tempo of music.
    
    Args:
        request: Tempo adjustment parameters
        
    Returns:
        Adjusted audio path
    """
    logger.info(f"Adjusting tempo to {request.target_tempo} BPM")
    
    generator = get_music_generator()
    
    audio_path = generator.adjust_tempo(
        audio_path=request.audio_path,
        target_tempo=request.target_tempo,
    )
    
    return MusicResponse(
        audio_path=audio_path,
        message=f"Tempo adjusted to {request.target_tempo} BPM",
    )


@router.post("/mix", response_model=MusicResponse)
async def mix_audio(request: MixAudioRequest):
    """
    Mix music with other audio.
    
    Args:
        request: Mixing parameters
        
    Returns:
        Mixed audio path
    """
    logger.info(f"Mixing audio with music volume {request.music_volume}")
    
    generator = get_music_generator()
    
    audio_path = generator.mix_with_audio(
        music_path=request.music_path,
        audio_path=request.audio_path,
        music_volume=request.music_volume,
    )
    
    return MusicResponse(
        audio_path=audio_path,
        message="Audio mixed successfully",
    )


@router.get("/audio/{filename}")
async def get_audio(filename: str):
    """
    Retrieve generated audio file.
    
    Args:
        filename: Audio filename
        
    Returns:
        Audio file
    """
    import tempfile
    filepath = os.path.join(tempfile.gettempdir(), filename)
    
    if not os.path.exists(filepath):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Audio not found")
    
    return FileResponse(filepath, media_type="audio/wav")
