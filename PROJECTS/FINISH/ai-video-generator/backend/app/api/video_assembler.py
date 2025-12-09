"""
Video Assembler API Endpoints

REST API for video assembly, transitions, and export.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.video_assembler import (
    AssembleVideoRequest,
    AssembleVideoResponse,
    MixAudioRequest,
    MixAudioResponse,
    ExportVideoRequest,
    ExportVideoResponse,
    VideoInfo,
    TransitionConfig,
    OutputConfig as OutputConfigSchema
)
from app.services.video_assembler import (
    VideoAssemblerService,
    OutputConfig,
    Transition,
    TransitionType,
    Resolution,
    AspectRatio
)
from app.models.project import Project
from app.models.scene import Scene
from app.models.video_file import VideoFile
from app.utils.logger import get_logger
from app.exceptions import VideoAssemblyError

logger = get_logger(__name__)
router = APIRouter(prefix="/api/video-assembler", tags=["video-assembler"])

# Initialize service
video_assembler = VideoAssemblerService()


@router.post("/assemble", response_model=AssembleVideoResponse)
async def assemble_video(
    request: AssembleVideoRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Assemble final video from scene clips

    Combines all scene videos with transitions, audio mixing, and export.
    """
    try:
        logger.info(f"Assembling video for project {request.project_id}")

        # Get project
        project = db.query(Project).filter(Project.id == request.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Get scenes
        scenes = []
        for scene_id in request.scene_ids:
            scene = db.query(Scene).filter(Scene.id == scene_id).first()
            if not scene:
                raise HTTPException(
                    status_code=404,
                    detail=f"Scene not found: {scene_id}"
                )
            scenes.append(scene)

        # Collect scene video paths
        scene_clips = []
        audio_tracks = []

        for scene in scenes:
            # Get scene video asset
            video_asset = next(
                (a.asset for a in scene.assets if a.asset_role == "video"),
                None
            )
            if not video_asset:
                raise HTTPException(
                    status_code=400,
                    detail=f"Scene {scene.id} has no video asset"
                )
            scene_clips.append(video_asset.file_path)

            # Get scene audio asset
            audio_asset = next(
                (a.asset for a in scene.assets if a.asset_role == "audio"),
                None
            )
            if audio_asset:
                audio_tracks.append(audio_asset.file_path)

        # Add background music if requested
        if request.include_music:
            music_asset = next(
                (a.asset for a in scenes[0].assets if a.asset_role == "music"),
                None
            )
            if music_asset:
                audio_tracks.append(music_asset.file_path)

        # Convert transitions
        transitions = None
        if request.transitions:
            transitions = [
                Transition(
                    type=TransitionType(t.type),
                    duration=t.duration
                )
                for t in request.transitions
            ]

        # Convert output config
        output_config = None
        if request.output_config:
            output_config = OutputConfig(
                resolution=Resolution(request.output_config.resolution),
                aspect_ratio=AspectRatio(request.output_config.aspect_ratio),
                codec=request.output_config.codec,
                bitrate=request.output_config.bitrate,
                fps=request.output_config.fps,
                preset=request.output_config.preset
            )

        # Assemble video
        output_filename = f"{project.id}_final.mp4"
        video_path = video_assembler.assemble_video(
            scene_clips=scene_clips,
            audio_tracks=audio_tracks if audio_tracks else None,
            transitions=transitions,
            output_config=output_config,
            output_filename=output_filename
        )

        # Get video info
        video_info = video_assembler.get_video_info(video_path)

        # Save video file record
        video_file = VideoFile(
            project_id=project.id,
            file_path=video_path,
            resolution=str(output_config.resolution.value if output_config else "1080p"),
            aspect_ratio=str(output_config.aspect_ratio.value if output_config else "16:9"),
            duration=video_info.get("duration", 0),
            file_size=video_info.get("size", 0)
        )
        db.add(video_file)
        db.commit()
        db.refresh(video_file)

        logger.info(f"Video assembled successfully: {video_path}")

        return AssembleVideoResponse(
            video_id=video_file.id,
            video_path=video_path,
            duration=video_info.get("duration", 0),
            file_size=video_info.get("size", 0),
            resolution=video_file.resolution,
            aspect_ratio=video_file.aspect_ratio
        )

    except VideoAssemblyError as e:
        logger.error(f"Video assembly error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mix-audio", response_model=MixAudioResponse)
async def mix_audio(request: MixAudioRequest):
    """
    Mix dialogue and background music

    Combines multiple audio tracks with volume control.
    """
    try:
        logger.info("Mixing audio tracks")

        mixed_audio = video_assembler.mix_audio(
            dialogue=request.dialogue_path,
            music=request.music_path,
            music_volume=request.music_volume,
            target_duration=request.target_duration
        )

        if not mixed_audio:
            raise HTTPException(status_code=400, detail="No valid audio tracks")

        # Save mixed audio
        import os
        output_path = str(
            video_assembler.temp_path / f"mixed_{os.urandom(8).hex()}.wav"
        )
        mixed_audio.write_audiofile(output_path)

        return MixAudioResponse(
            audio_path=output_path,
            duration=mixed_audio.duration
        )

    except Exception as e:
        logger.error(f"Audio mixing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/export", response_model=ExportVideoResponse)
async def export_video(request: ExportVideoRequest):
    """
    Export video with specific format options

    Re-encodes video with specified resolution, aspect ratio, and codec.
    """
    try:
        logger.info(f"Exporting video: {request.video_path}")

        from moviepy.editor import VideoFileClip
        import os

        # Load video
        video = VideoFileClip(request.video_path)

        # Generate output path
        output_filename = f"exported_{os.urandom(8).hex()}.mp4"
        output_path = str(video_assembler.output_path / output_filename)

        # Export with specified format
        video_assembler.export_video(
            video=video,
            output_path=output_path,
            resolution=Resolution(request.resolution),
            aspect_ratio=AspectRatio(request.aspect_ratio),
            codec=request.codec,
            bitrate=request.bitrate
        )

        video.close()

        # Get video info
        info = video_assembler.get_video_info(output_path)

        return ExportVideoResponse(
            video_path=output_path,
            info=VideoInfo(**info)
        )

    except Exception as e:
        logger.error(f"Video export error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video-info/{video_id}", response_model=VideoInfo)
async def get_video_info(video_id: str, db: Session = Depends(get_db)):
    """
    Get video file information

    Returns metadata about a video file including duration, size, and codec info.
    """
    try:
        # Get video file
        video_file = db.query(VideoFile).filter(VideoFile.id == video_id).first()
        if not video_file:
            raise HTTPException(status_code=404, detail="Video not found")

        # Get video info
        info = video_assembler.get_video_info(video_file.file_path)

        return VideoInfo(**info)

    except Exception as e:
        logger.error(f"Error getting video info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/formats")
async def get_supported_formats():
    """
    Get supported video formats and codecs

    Returns available resolutions, aspect ratios, and codecs.
    """
    return {
        "resolutions": [r.value for r in Resolution],
        "aspect_ratios": [a.value for a in AspectRatio],
        "codecs": ["h264", "h265", "vp9"],
        "transitions": [t.value for t in TransitionType],
        "presets": ["ultrafast", "fast", "medium", "slow", "slower"],
    }
