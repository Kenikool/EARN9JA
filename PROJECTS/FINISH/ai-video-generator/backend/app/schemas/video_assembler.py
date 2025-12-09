"""
Video Assembler Schemas

Pydantic models for video assembly requests and responses.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class TransitionType(str, Enum):
    """Video transition types"""
    CUT = "cut"
    FADE = "fade"
    CROSS_DISSOLVE = "cross_dissolve"
    WIPE = "wipe"


class AspectRatio(str, Enum):
    """Video aspect ratios"""
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"
    RATIO_4_3 = "4:3"


class Resolution(str, Enum):
    """Video resolutions"""
    SD_480P = "480p"
    HD_720P = "720p"
    FHD_1080P = "1080p"
    UHD_4K = "4k"


class TransitionConfig(BaseModel):
    """Transition configuration"""
    type: TransitionType = Field(
        default=TransitionType.FADE,
        description="Type of transition"
    )
    duration: float = Field(
        default=0.5,
        ge=0.1,
        le=3.0,
        description="Transition duration in seconds"
    )


class OutputConfig(BaseModel):
    """Video output configuration"""
    resolution: Resolution = Field(
        default=Resolution.FHD_1080P,
        description="Output resolution"
    )
    aspect_ratio: AspectRatio = Field(
        default=AspectRatio.RATIO_16_9,
        description="Output aspect ratio"
    )
    codec: str = Field(
        default="h264",
        description="Video codec (h264, h265, vp9)"
    )
    bitrate: str = Field(
        default="5M",
        description="Video bitrate"
    )
    fps: int = Field(
        default=24,
        ge=15,
        le=60,
        description="Frames per second"
    )
    preset: str = Field(
        default="medium",
        description="Encoding preset (ultrafast, fast, medium, slow)"
    )


class AssembleVideoRequest(BaseModel):
    """Request to assemble video from scenes"""
    project_id: str = Field(..., description="Project ID")
    scene_ids: List[str] = Field(..., description="List of scene IDs in order")
    transitions: Optional[List[TransitionConfig]] = Field(
        default=None,
        description="Transitions between scenes"
    )
    output_config: Optional[OutputConfig] = Field(
        default=None,
        description="Output configuration"
    )
    include_music: bool = Field(
        default=True,
        description="Include background music"
    )
    music_volume: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Background music volume"
    )


class MixAudioRequest(BaseModel):
    """Request to mix audio tracks"""
    dialogue_path: Optional[str] = Field(
        default=None,
        description="Path to dialogue audio"
    )
    music_path: Optional[str] = Field(
        default=None,
        description="Path to music audio"
    )
    music_volume: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Music volume level"
    )
    target_duration: Optional[float] = Field(
        default=None,
        description="Target duration in seconds"
    )


class ExportVideoRequest(BaseModel):
    """Request to export video with specific format"""
    video_path: str = Field(..., description="Path to video file")
    resolution: Resolution = Field(
        default=Resolution.FHD_1080P,
        description="Output resolution"
    )
    aspect_ratio: AspectRatio = Field(
        default=AspectRatio.RATIO_16_9,
        description="Output aspect ratio"
    )
    codec: str = Field(
        default="h264",
        description="Video codec"
    )
    bitrate: str = Field(
        default="5M",
        description="Video bitrate"
    )


class VideoInfo(BaseModel):
    """Video file information"""
    duration: float = Field(..., description="Duration in seconds")
    size: int = Field(..., description="File size in bytes")
    bitrate: int = Field(..., description="Bitrate in bits per second")
    video: Optional[dict] = Field(default=None, description="Video stream info")
    audio: Optional[dict] = Field(default=None, description="Audio stream info")


class AssembleVideoResponse(BaseModel):
    """Response from video assembly"""
    video_id: str = Field(..., description="Generated video ID")
    video_path: str = Field(..., description="Path to assembled video")
    duration: float = Field(..., description="Video duration in seconds")
    file_size: int = Field(..., description="File size in bytes")
    resolution: str = Field(..., description="Video resolution")
    aspect_ratio: str = Field(..., description="Video aspect ratio")


class MixAudioResponse(BaseModel):
    """Response from audio mixing"""
    audio_path: str = Field(..., description="Path to mixed audio")
    duration: float = Field(..., description="Audio duration in seconds")


class ExportVideoResponse(BaseModel):
    """Response from video export"""
    video_path: str = Field(..., description="Path to exported video")
    info: VideoInfo = Field(..., description="Video information")
