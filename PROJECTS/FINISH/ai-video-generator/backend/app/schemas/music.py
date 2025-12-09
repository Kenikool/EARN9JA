"""Music generation schemas."""

from typing import Optional
from pydantic import BaseModel, Field


class MusicGenerationRequest(BaseModel):
    """Schema for music generation request."""
    
    description: str = Field(..., min_length=1, description="Text description of desired music")
    duration: float = Field(30.0, ge=5.0, le=300.0, description="Duration in seconds")
    genre: str = Field("cinematic", description="Music genre")
    tempo: int = Field(120, ge=40, le=200, description="Tempo in BPM")
    mood: str = Field("neutral", description="Mood/emotion")


class ExtendMusicRequest(BaseModel):
    """Schema for music extension request."""
    
    audio_path: str = Field(..., description="Input audio path")
    target_duration: float = Field(..., ge=5.0, description="Target duration in seconds")


class SeamlessLoopRequest(BaseModel):
    """Schema for seamless loop request."""
    
    audio_path: str = Field(..., description="Input audio path")
    loop_duration: Optional[float] = Field(None, description="Optional loop duration")


class AdjustTempoRequest(BaseModel):
    """Schema for tempo adjustment request."""
    
    audio_path: str = Field(..., description="Input audio path")
    target_tempo: int = Field(..., ge=40, le=200, description="Target tempo in BPM")


class MixAudioRequest(BaseModel):
    """Schema for audio mixing request."""
    
    music_path: str = Field(..., description="Background music path")
    audio_path: str = Field(..., description="Foreground audio path")
    music_volume: float = Field(0.3, ge=0.0, le=1.0, description="Music volume")


class MusicResponse(BaseModel):
    """Schema for music response."""
    
    audio_path: str
    message: str
    duration: Optional[float] = None
