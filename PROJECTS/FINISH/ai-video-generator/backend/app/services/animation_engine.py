"""Animation engine service using AnimateDiff and video processing."""

import torch
import cv2
import numpy as np
from typing import Optional, Tuple
from PIL import Image
from diffusers import AnimateDiffPipeline, MotionAdapter, DDIMScheduler
from diffusers.utils import export_to_video

from app.config import settings
from app.exceptions import VideoAssemblyException
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AnimationEngine:
    """Service for animating images into video clips."""
    
    def __init__(self):
        """Initialize animation engine."""
        self.device = self._get_device()
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.pipeline: Optional[AnimateDiffPipeline] = None
        self.motion_adapter: Optional[MotionAdapter] = None
        
        logger.info(f"Animation engine initialized on device: {self.device}")
    
    def _get_device(self) -> str:
        """Determine device to use."""
        if settings.use_gpu and torch.cuda.is_available():
            return "cuda"
        return "cpu"
    
    def _load_pipeline(self):
        """Load AnimateDiff pipeline."""
        if self.pipeline is not None:
            return
        
        logger.info(f"Loading AnimateDiff model: {settings.default_animation_model}")
        
        try:
            # Load motion adapter
            self.motion_adapter = MotionAdapter.from_pretrained(
                settings.default_animation_model,
                torch_dtype=self.dtype,
            )
            
            # Load AnimateDiff pipeline
            self.pipeline = AnimateDiffPipeline.from_pretrained(
                settings.default_image_model,
                motion_adapter=self.motion_adapter,
                torch_dtype=self.dtype,
            )
            
            # Configure scheduler
            self.pipeline.scheduler = DDIMScheduler.from_config(
                self.pipeline.scheduler.config,
                beta_schedule="linear",
                clip_sample=False,
            )
            
            self.pipeline = self.pipeline.to(self.device)
            
            # Enable memory optimizations
            if self.device == "cuda":
                self.pipeline.enable_model_cpu_offload()
                self.pipeline.enable_vae_slicing()
            
            logger.info("AnimateDiff pipeline loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load AnimateDiff pipeline: {str(e)}")
            raise VideoAssemblyException(
                "Failed to load animation model",
                details={"error": str(e)},
            )
    
    def animate_image(
        self,
        image: Image.Image,
        motion_prompt: str,
        duration: float = 3.0,
        fps: int = 24,
        motion_strength: float = 0.7,
        num_inference_steps: int = 25,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
    ) -> str:
        """
        Animate static image into video clip.
        
        Args:
            image: Input PIL Image
            motion_prompt: Description of desired motion
            duration: Video duration in seconds
            fps: Frames per second
            motion_strength: Motion intensity (0-1)
            num_inference_steps: Number of denoising steps
            guidance_scale: Guidance scale
            seed: Random seed
            
        Returns:
            Path to generated video file
            
        Raises:
            VideoAssemblyException: If animation fails
        """
        self._load_pipeline()
        
        num_frames = int(duration * fps)
        
        logger.info(
            f"Animating image",
            extra={
                "duration": duration,
                "fps": fps,
                "frames": num_frames,
                "motion_strength": motion_strength,
            },
        )
        
        try:
            # Set seed
            generator = None
            if seed is not None:
                generator = torch.Generator(device=self.device).manual_seed(seed)
            
            # Generate animation
            output = self.pipeline(
                prompt=motion_prompt,
                image=image,
                num_frames=num_frames,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                generator=generator,
            )
            
            frames = output.frames[0]
            
            # Export to video
            import tempfile
            import os
            video_path = os.path.join(
                tempfile.gettempdir(),
                f"animated_{hash(motion_prompt)}.mp4"
            )
            export_to_video(frames, video_path, fps=fps)
            
            logger.info(f"Animation created: {video_path}")
            
            return video_path
            
        except torch.cuda.OutOfMemoryError:
            logger.error("GPU out of memory during animation")
            raise VideoAssemblyException(
                "GPU out of memory. Try reducing duration or frame rate.",
                details={"duration": duration, "fps": fps, "frames": num_frames},
            )
        except Exception as e:
            logger.error(f"Animation failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to animate image",
                details={"error": str(e)},
            )
    
    def apply_camera_motion(
        self,
        video_path: str,
        motion_type: str,
        intensity: float = 0.5,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Apply camera motion effects to video.
        
        Args:
            video_path: Input video path
            motion_type: Type of motion (pan, zoom, tilt, rotate)
            intensity: Motion intensity (0-1)
            output_path: Optional output path
            
        Returns:
            Path to processed video
            
        Raises:
            VideoAssemblyException: If processing fails
        """
        logger.info(
            f"Applying camera motion: {motion_type}",
            extra={"intensity": intensity},
        )
        
        try:
            # Read video
            cap = cv2.VideoCapture(video_path)
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Prepare output
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".mp4")
            
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            frames = []
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                frames.append(frame)
            
            cap.release()
            
            # Apply motion
            processed_frames = self._apply_motion_effect(
                frames, motion_type, intensity, width, height
            )
            
            # Write output
            for frame in processed_frames:
                out.write(frame)
            
            out.release()
            
            logger.info(f"Camera motion applied: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Camera motion failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to apply camera motion",
                details={"error": str(e), "motion_type": motion_type},
            )
    
    def _apply_motion_effect(
        self,
        frames: list,
        motion_type: str,
        intensity: float,
        width: int,
        height: int,
    ) -> list:
        """Apply specific motion effect to frames."""
        processed = []
        num_frames = len(frames)
        
        for i, frame in enumerate(frames):
            progress = i / max(num_frames - 1, 1)
            
            if motion_type == "pan":
                # Horizontal pan
                shift = int(width * intensity * progress * 0.2)
                M = np.float32([[1, 0, shift], [0, 1, 0]])
                processed_frame = cv2.warpAffine(frame, M, (width, height))
            
            elif motion_type == "zoom":
                # Zoom in/out
                scale = 1.0 + (intensity * progress * 0.3)
                center = (width // 2, height // 2)
                M = cv2.getRotationMatrix2D(center, 0, scale)
                processed_frame = cv2.warpAffine(frame, M, (width, height))
            
            elif motion_type == "tilt":
                # Vertical tilt
                shift = int(height * intensity * progress * 0.2)
                M = np.float32([[1, 0, 0], [0, 1, shift]])
                processed_frame = cv2.warpAffine(frame, M, (width, height))
            
            elif motion_type == "rotate":
                # Rotation
                angle = intensity * progress * 15  # Max 15 degrees
                center = (width // 2, height // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                processed_frame = cv2.warpAffine(frame, M, (width, height))
            
            else:
                processed_frame = frame
            
            processed.append(processed_frame)
        
        return processed
    
    def create_motion_from_static(
        self,
        image_path: str,
        duration: float = 3.0,
        fps: int = 24,
        motion_type: str = "zoom",
        intensity: float = 0.3,
    ) -> str:
        """
        Create motion video from static image using traditional methods.
        
        Args:
            image_path: Path to static image
            duration: Video duration
            fps: Frames per second
            motion_type: Type of motion effect
            intensity: Motion intensity
            
        Returns:
            Path to generated video
        """
        logger.info(f"Creating motion video from static image: {motion_type}")
        
        try:
            # Load image
            image = cv2.imread(image_path)
            height, width = image.shape[:2]
            
            # Calculate frames
            num_frames = int(duration * fps)
            
            # Prepare output
            import tempfile
            output_path = tempfile.mktemp(suffix=".mp4")
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            # Generate frames with motion
            frames = [image] * num_frames
            processed_frames = self._apply_motion_effect(
                frames, motion_type, intensity, width, height
            )
            
            for frame in processed_frames:
                out.write(frame)
            
            out.release()
            
            logger.info(f"Motion video created: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to create motion video: {str(e)}")
            raise VideoAssemblyException(
                "Failed to create motion from static image",
                details={"error": str(e)},
            )
    
    def interpolate_frames(
        self,
        video_path: str,
        target_fps: int = 60,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Interpolate frames to increase FPS for smoother motion.
        
        Args:
            video_path: Input video path
            target_fps: Target frames per second
            output_path: Optional output path
            
        Returns:
            Path to interpolated video
        """
        logger.info(f"Interpolating frames to {target_fps} FPS")
        
        try:
            cap = cv2.VideoCapture(video_path)
            original_fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".mp4")
            
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, target_fps, (width, height))
            
            frames = []
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                frames.append(frame)
            
            cap.release()
            
            # Simple linear interpolation
            interpolation_factor = target_fps / original_fps
            
            for i in range(len(frames) - 1):
                out.write(frames[i])
                
                # Add interpolated frames
                num_interpolated = int(interpolation_factor) - 1
                for j in range(1, num_interpolated + 1):
                    alpha = j / (num_interpolated + 1)
                    interpolated = cv2.addWeighted(
                        frames[i], 1 - alpha, frames[i + 1], alpha, 0
                    )
                    out.write(interpolated)
            
            out.write(frames[-1])
            out.release()
            
            logger.info(f"Frame interpolation complete: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Frame interpolation failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to interpolate frames",
                details={"error": str(e)},
            )
    
    def add_motion_blur(
        self,
        video_path: str,
        blur_strength: int = 5,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Add motion blur effect to video for more natural motion.
        
        Args:
            video_path: Input video path
            blur_strength: Blur kernel size
            output_path: Optional output path
            
        Returns:
            Path to processed video
        """
        logger.info(f"Adding motion blur with strength {blur_strength}")
        
        try:
            cap = cv2.VideoCapture(video_path)
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".mp4")
            
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            prev_frame = None
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if prev_frame is not None:
                    # Blend with previous frame for motion blur
                    blurred = cv2.addWeighted(prev_frame, 0.3, frame, 0.7, 0)
                    blurred = cv2.GaussianBlur(blurred, (blur_strength, blur_strength), 0)
                    out.write(blurred)
                else:
                    out.write(frame)
                
                prev_frame = frame
            
            cap.release()
            out.release()
            
            logger.info(f"Motion blur applied: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Motion blur failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to add motion blur",
                details={"error": str(e)},
            )
    
    def stabilize_video(
        self,
        video_path: str,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Stabilize shaky video footage.
        
        Args:
            video_path: Input video path
            output_path: Optional output path
            
        Returns:
            Path to stabilized video
        """
        logger.info("Stabilizing video")
        
        try:
            cap = cv2.VideoCapture(video_path)
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Read all frames
            frames = []
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                frames.append(frame)
            
            cap.release()
            
            if len(frames) < 2:
                return video_path
            
            # Calculate transformations between frames
            transforms = []
            prev_gray = cv2.cvtColor(frames[0], cv2.COLOR_BGR2GRAY)
            
            for frame in frames[1:]:
                curr_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Detect features
                prev_pts = cv2.goodFeaturesToTrack(
                    prev_gray, maxCorners=200, qualityLevel=0.01, minDistance=30
                )
                
                if prev_pts is not None:
                    curr_pts, status, _ = cv2.calcOpticalFlowPyrLK(
                        prev_gray, curr_gray, prev_pts, None
                    )
                    
                    # Filter valid points
                    idx = np.where(status == 1)[0]
                    prev_pts = prev_pts[idx]
                    curr_pts = curr_pts[idx]
                    
                    # Estimate transformation
                    if len(prev_pts) >= 3:
                        m, _ = cv2.estimateAffinePartial2D(prev_pts, curr_pts)
                        if m is not None:
                            transforms.append(m)
                        else:
                            transforms.append(np.eye(2, 3, dtype=np.float32))
                    else:
                        transforms.append(np.eye(2, 3, dtype=np.float32))
                else:
                    transforms.append(np.eye(2, 3, dtype=np.float32))
                
                prev_gray = curr_gray
            
            # Apply smoothed transformations
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".mp4")
            
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            out.write(frames[0])
            for i, (frame, transform) in enumerate(zip(frames[1:], transforms)):
                stabilized = cv2.warpAffine(frame, transform, (width, height))
                out.write(stabilized)
            
            out.release()
            
            logger.info(f"Video stabilized: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Video stabilization failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to stabilize video",
                details={"error": str(e)},
            )
    
    def unload_model(self):
        """Unload model from memory."""
        logger.info("Unloading animation models")
        
        if self.pipeline is not None:
            del self.pipeline
            self.pipeline = None
        
        if self.motion_adapter is not None:
            del self.motion_adapter
            self.motion_adapter = None
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("Animation models unloaded")


# Global instance
_animation_engine: Optional[AnimationEngine] = None


def get_animation_engine() -> AnimationEngine:
    """Get or create global animation engine instance."""
    global _animation_engine
    if _animation_engine is None:
        _animation_engine = AnimationEngine()
    return _animation_engine
