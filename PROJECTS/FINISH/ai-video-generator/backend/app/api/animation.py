"""Animation API endpoints."""

from fastapi import APIRouter, status
from fastapi.responses import FileResponse
import os

from app.services.animation_engine import get_animation_engine
from app.schemas.animation import (
    AnimateImageRequest,
    CameraMotionRequest,
    StaticMotionRequest,
    InterpolateFramesRequest,
    MotionBlurRequest,
    StabilizeVideoRequest,
    AnimationResponse,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/animation", tags=["animation"])


@router.post("/animate-image", response_model=AnimationResponse)
async def animate_image(request: AnimateImageRequest):
    """
    Animate static image into video using AnimateDiff.
    
    Args:
        request: Animation parameters
        
    Returns:
        Generated video path
        
    Raises:
        VideoAssemblyException: If animation fails
    """
    logger.info(
        f"Animating image",
        extra={
            "duration": request.duration,
            "fps": request.fps,
            "motion_strength": request.motion_strength,
        },
    )
    
    engine = get_animation_engine()
    
    from PIL import Image
    image = Image.open(request.image_path)
    
    video_path = engine.animate_image(
        image=image,
        motion_prompt=request.motion_prompt,
        duration=request.duration,
        fps=request.fps,
        motion_strength=request.motion_strength,
        num_inference_steps=request.num_inference_steps,
        guidance_scale=request.guidance_scale,
        seed=request.seed,
    )
    
    return AnimationResponse(
        video_path=video_path,
        message="Image animated successfully",
        duration=request.duration,
        fps=request.fps,
    )


@router.post("/camera-motion", response_model=AnimationResponse)
async def apply_camera_motion(request: CameraMotionRequest):
    """
    Apply camera motion effects to video.
    
    Args:
        request: Camera motion parameters
        
    Returns:
        Processed video path
        
    Raises:
        VideoAssemblyException: If processing fails
    """
    logger.info(
        f"Applying camera motion: {request.motion_type}",
        extra={"intensity": request.intensity},
    )
    
    engine = get_animation_engine()
    
    video_path = engine.apply_camera_motion(
        video_path=request.video_path,
        motion_type=request.motion_type,
        intensity=request.intensity,
    )
    
    return AnimationResponse(
        video_path=video_path,
        message=f"Camera motion '{request.motion_type}' applied successfully",
    )


@router.post("/static-motion", response_model=AnimationResponse)
async def create_static_motion(request: StaticMotionRequest):
    """
    Create motion video from static image using traditional methods.
    
    Args:
        request: Static motion parameters
        
    Returns:
        Generated video path
    """
    logger.info(
        f"Creating motion from static: {request.motion_type}",
        extra={"duration": request.duration, "fps": request.fps},
    )
    
    engine = get_animation_engine()
    
    video_path = engine.create_motion_from_static(
        image_path=request.image_path,
        duration=request.duration,
        fps=request.fps,
        motion_type=request.motion_type,
        intensity=request.intensity,
    )
    
    return AnimationResponse(
        video_path=video_path,
        message="Motion video created successfully",
        duration=request.duration,
        fps=request.fps,
    )


@router.post("/interpolate-frames", response_model=AnimationResponse)
async def interpolate_frames(request: InterpolateFramesRequest):
    """
    Interpolate frames to increase FPS for smoother motion.
    
    Args:
        request: Interpolation parameters
        
    Returns:
        Interpolated video path
    """
    logger.info(f"Interpolating frames to {request.target_fps} FPS")
    
    engine = get_animation_engine()
    
    video_path = engine.interpolate_frames(
        video_path=request.video_path,
        target_fps=request.target_fps,
    )
    
    return AnimationResponse(
        video_path=video_path,
        message=f"Frames interpolated to {request.target_fps} FPS",
        fps=request.target_fps,
    )


@router.post("/motion-blur", response_model=AnimationResponse)
async def add_motion_blur(request: MotionBlurRequest):
    """
    Add motion blur effect to video.
    
    Args:
        request: Motion blur parameters
        
    Returns:
        Processed video path
    """
    logger.info(f"Adding motion blur with strength {request.blur_strength}")
    
    engine = get_animation_engine()
    
    video_path = engine.add_motion_blur(
        video_path=request.video_path,
        blur_strength=request.blur_strength,
    )
    
    return AnimationResponse(
        video_path=video_path,
        message="Motion blur applied successfully",
    )


@router.post("/stabilize", response_model=AnimationResponse)
async def stabilize_video(request: StabilizeVideoRequest):
    """
    Stabilize shaky video footage.
    
    Args:
        request: Stabilization parameters
        
    Returns:
        Stabilized video path
    """
    logger.info("Stabilizing video")
    
    engine = get_animation_engine()
    
    video_path = engine.stabilize_video(
        video_path=request.video_path,
    )
    
    return AnimationResponse(
        video_path=video_path,
        message="Video stabilized successfully",
    )


@router.get("/video/{filename}")
async def get_video(filename: str):
    """
    Retrieve generated video file.
    
    Args:
        filename: Video filename
        
    Returns:
        Video file
    """
    import tempfile
    filepath = os.path.join(tempfile.gettempdir(), filename)
    
    if not os.path.exists(filepath):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(filepath, media_type="video/mp4")
