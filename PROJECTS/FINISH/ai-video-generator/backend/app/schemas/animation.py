"""Animation schemas."""

from typing import Optional
from pydantic import BaseModel, Field


class AnimateImageRequest(BaseModel):
    """Schema for image animation request."""
    
    image_path: str = Field(..., description="Path to input image")
    motion_prompt: str = Field(..., description="Description of desired motion")
    duration: float = Field(3.0, ge=0.5, le=10.0, description="Video duration in seconds")
    fps: int = Field(24, ge=12, le=60, description="Frames per second")
    motion_strength: float = Field(0.7, ge=0.0, le=1.0, description="Motion intensity")
    num_inference_steps: int = Field(25, ge=10, le=100, description="Denoising steps")
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0, description="Guidance scale")
    seed: Optional[int] = Field(None, description="Random seed")


class CameraMotionRequest(BaseModel):
    """Schema for camera motion request."""
    
    video_path: str = Field(..., description="Path to input video")
    motion_type: str = Field(..., description="Motion type: pan, zoom, tilt, rotate")
    intensity: float = Field(0.5, ge=0.0, le=1.0, description="Motion intensity")


class StaticMotionRequest(BaseModel):
    """Schema for creating motion from static image."""
    
    image_path: str = Field(..., description="Path to static image")
    duration: float = Field(3.0, ge=0.5, le=10.0, description="Video duration")
    fps: int = Field(24, ge=12, le=60, description="Frames per second")
    motion_type: str = Field("zoom", description="Motion type: pan, zoom, tilt, rotate")
    intensity: float = Field(0.3, ge=0.0, le=1.0, description="Motion intensity")


class InterpolateFramesRequest(BaseModel):
    """Schema for frame interpolation request."""
    
    video_path: str = Field(..., description="Path to input video")
    target_fps: int = Field(60, ge=24, le=120, description="Target FPS")


class MotionBlurRequest(BaseModel):
    """Schema for motion blur request."""
    
    video_path: str = Field(..., description="Path to input video")
    blur_strength: int = Field(5, ge=1, le=15, description="Blur kernel size (odd number)")


class StabilizeVideoRequest(BaseModel):
    """Schema for video stabilization request."""
    
    video_path: str = Field(..., description="Path to input video")


class AnimationResponse(BaseModel):
    """Schema for animation response."""
    
    video_path: str
    message: str
    duration: Optional[float] = None
    fps: Optional[int] = None
