"""
Video Assembler Service

Combines generated assets into final video with transitions, audio mixing, and export.
Uses FFmpeg for encoding and MoviePy for Python-based editing.
"""

import os
import subprocess
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum

from moviepy.editor import (
    VideoFileClip,
    AudioFileClip,
    CompositeVideoClip,
    CompositeAudioClip,
    concatenate_videoclips,
    vfx
)
from moviepy.video.fx.fadein import fadein
from moviepy.video.fx.fadeout import fadeout
from moviepy.video.fx.crossfadein import crossfadein
from moviepy.video.fx.crossfadeout import crossfadeout

from app.utils.logger import get_logger
from app.exceptions import VideoAssemblyError

logger = get_logger(__name__)


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


@dataclass
class OutputConfig:
    """Video output configuration"""
    resolution: Resolution = Resolution.FHD_1080P
    aspect_ratio: AspectRatio = AspectRatio.RATIO_16_9
    codec: str = "libx264"
    audio_codec: str = "aac"
    bitrate: str = "5M"
    audio_bitrate: str = "192k"
    fps: int = 24
    preset: str = "medium"  # ultrafast, fast, medium, slow, slower
    crf: int = 23  # Constant Rate Factor (0-51, lower is better quality)


@dataclass
class Transition:
    """Transition configuration between clips"""
    type: TransitionType = TransitionType.FADE
    duration: float = 0.5


class VideoAssemblerService:
    """Service for assembling final videos from generated assets"""

    def __init__(self, storage_path: str = "./storage"):
        """
        Initialize Video Assembler Service

        Args:
            storage_path: Base path for file storage
        """
        self.storage_path = Path(storage_path)
        self.temp_path = self.storage_path / "temp"
        self.output_path = self.storage_path / "videos"

        # Create directories
        self.temp_path.mkdir(parents=True, exist_ok=True)
        self.output_path.mkdir(parents=True, exist_ok=True)

        # Check FFmpeg availability
        self._check_ffmpeg()

        logger.info("Video Assembler Service initialized")

    def _check_ffmpeg(self) -> None:
        """Check if FFmpeg is available"""
        try:
            result = subprocess.run(
                ["ffmpeg", "-version"],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"FFmpeg available: {result.stdout.split()[2]}")
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            logger.error(f"FFmpeg not available: {e}")
            raise VideoAssemblyError(
                "FFmpeg not found. Please install FFmpeg.",
                "FFMPEG_NOT_FOUND"
            )

    def _check_hardware_acceleration(self) -> Dict[str, bool]:
        """Check available hardware acceleration options"""
        hw_accel = {
            "nvenc": False,  # NVIDIA
            "qsv": False,    # Intel Quick Sync
            "vaapi": False,  # VA-API
        }

        try:
            result = subprocess.run(
                ["ffmpeg", "-encoders"],
                capture_output=True,
                text=True,
                check=True
            )
            output = result.stdout

            if "h264_nvenc" in output:
                hw_accel["nvenc"] = True
            if "h264_qsv" in output:
                hw_accel["qsv"] = True
            if "h264_vaapi" in output:
                hw_accel["vaapi"] = True

            logger.info(f"Hardware acceleration available: {hw_accel}")
        except Exception as e:
            logger.warning(f"Could not check hardware acceleration: {e}")

        return hw_accel

    def _get_resolution_dimensions(
        self,
        resolution: Resolution,
        aspect_ratio: AspectRatio
    ) -> Tuple[int, int]:
        """
        Get width and height for resolution and aspect ratio

        Args:
            resolution: Target resolution
            aspect_ratio: Target aspect ratio

        Returns:
            Tuple of (width, height)
        """
        # Base heights for resolutions
        heights = {
            Resolution.SD_480P: 480,
            Resolution.HD_720P: 720,
            Resolution.FHD_1080P: 1080,
            Resolution.UHD_4K: 2160,
        }

        # Aspect ratio multipliers
        ratios = {
            AspectRatio.RATIO_16_9: 16 / 9,
            AspectRatio.RATIO_9_16: 9 / 16,
            AspectRatio.RATIO_1_1: 1 / 1,
            AspectRatio.RATIO_4_3: 4 / 3,
        }

        height = heights[resolution]
        width = int(height * ratios[aspect_ratio])

        # Ensure dimensions are even (required for some codecs)
        width = width if width % 2 == 0 else width + 1
        height = height if height % 2 == 0 else height + 1

        return width, height

    def assemble_video(
        self,
        scene_clips: List[str],
        audio_tracks: Optional[List[str]] = None,
        transitions: Optional[List[Transition]] = None,
        output_config: Optional[OutputConfig] = None,
        output_filename: Optional[str] = None
    ) -> str:
        """
        Assemble final video from scene clips and audio

        Args:
            scene_clips: List of paths to scene video files
            audio_tracks: List of paths to audio files (dialogue, music)
            transitions: List of transitions between clips
            output_config: Output configuration
            output_filename: Custom output filename

        Returns:
            Path to assembled video file

        Raises:
            VideoAssemblyError: If assembly fails
        """
        try:
            logger.info(f"Assembling video from {len(scene_clips)} scenes")

            if not scene_clips:
                raise VideoAssemblyError(
                    "No scene clips provided",
                    "NO_CLIPS"
                )

            # Use default config if not provided
            config = output_config or OutputConfig()

            # Load video clips
            clips = []
            for clip_path in scene_clips:
                if not os.path.exists(clip_path):
                    raise VideoAssemblyError(
                        f"Clip not found: {clip_path}",
                        "CLIP_NOT_FOUND"
                    )
                clip = VideoFileClip(clip_path)
                clips.append(clip)

            # Apply transitions
            if transitions:
                clips = self._apply_transitions(clips, transitions)
            else:
                # Default fade transitions
                default_transitions = [
                    Transition(TransitionType.FADE, 0.5)
                    for _ in range(len(clips) - 1)
                ]
                clips = self._apply_transitions(clips, default_transitions)

            # Concatenate clips
            final_video = concatenate_videoclips(clips, method="compose")

            # Resize to target resolution
            width, height = self._get_resolution_dimensions(
                config.resolution,
                config.aspect_ratio
            )
            final_video = final_video.resize((width, height))

            # Handle audio
            if audio_tracks:
                final_audio = self._mix_audio_tracks(audio_tracks, final_video.duration)
                final_video = final_video.set_audio(final_audio)

            # Generate output path
            if not output_filename:
                output_filename = f"video_{os.urandom(8).hex()}.mp4"
            output_path = self.output_path / output_filename

            # Export video
            self._export_video(final_video, str(output_path), config)

            # Cleanup
            for clip in clips:
                clip.close()
            final_video.close()

            logger.info(f"Video assembled successfully: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Video assembly failed: {e}")
            raise VideoAssemblyError(
                f"Failed to assemble video: {str(e)}",
                "ASSEMBLY_FAILED",
                {"error": str(e)}
            )

    def add_transition(
        self,
        clip1: VideoFileClip,
        clip2: VideoFileClip,
        transition_type: TransitionType = TransitionType.FADE,
        duration: float = 0.5
    ) -> VideoFileClip:
        """
        Add transition between two clips

        Args:
            clip1: First video clip
            clip2: Second video clip
            transition_type: Type of transition
            duration: Transition duration in seconds

        Returns:
            Combined clip with transition
        """
        if transition_type == TransitionType.CUT:
            # Simple concatenation
            return concatenate_videoclips([clip1, clip2])

        elif transition_type == TransitionType.FADE:
            # Fade out first clip, fade in second clip
            clip1_faded = clip1.fx(fadeout, duration)
            clip2_faded = clip2.fx(fadein, duration)
            return concatenate_videoclips([clip1_faded, clip2_faded])

        elif transition_type == TransitionType.CROSS_DISSOLVE:
            # Overlap clips with crossfade
            clip1_out = clip1.fx(crossfadeout, duration)
            clip2_in = clip2.fx(crossfadein, duration)

            # Overlap the clips
            clip2_in = clip2_in.set_start(clip1.duration - duration)
            return CompositeVideoClip([clip1_out, clip2_in])

        else:
            # Default to fade
            return self.add_transition(clip1, clip2, TransitionType.FADE, duration)

    def _apply_transitions(
        self,
        clips: List[VideoFileClip],
        transitions: List[Transition]
    ) -> List[VideoFileClip]:
        """
        Apply transitions between clips

        Args:
            clips: List of video clips
            transitions: List of transitions

        Returns:
            List of clips with transitions applied
        """
        if len(transitions) != len(clips) - 1:
            logger.warning(
                f"Transition count mismatch: {len(transitions)} transitions "
                f"for {len(clips)} clips. Using default transitions."
            )
            transitions = [
                Transition(TransitionType.FADE, 0.5)
                for _ in range(len(clips) - 1)
            ]

        processed_clips = []

        for i, clip in enumerate(clips):
            if i == 0:
                # First clip: fade in
                clip = clip.fx(fadein, transitions[0].duration)
            elif i == len(clips) - 1:
                # Last clip: fade out
                clip = clip.fx(fadeout, transitions[-1].duration)
            else:
                # Middle clips: crossfade
                trans = transitions[i - 1]
                if trans.type == TransitionType.CROSS_DISSOLVE:
                    clip = clip.fx(crossfadein, trans.duration)
                    clip = clip.fx(crossfadeout, trans.duration)
                elif trans.type == TransitionType.FADE:
                    clip = clip.fx(fadein, trans.duration)
                    clip = clip.fx(fadeout, trans.duration)

            processed_clips.append(clip)

        return processed_clips

    def mix_audio(
        self,
        dialogue: Optional[str] = None,
        music: Optional[str] = None,
        music_volume: float = 0.3,
        target_duration: Optional[float] = None
    ) -> AudioFileClip:
        """
        Mix dialogue and background music

        Args:
            dialogue: Path to dialogue audio file
            music: Path to music audio file
            music_volume: Volume level for music (0.0 to 1.0)
            target_duration: Target duration for mixed audio

        Returns:
            Mixed audio clip
        """
        audio_clips = []

        # Load dialogue
        if dialogue and os.path.exists(dialogue):
            dialogue_clip = AudioFileClip(dialogue)
            audio_clips.append(dialogue_clip)

            if target_duration is None:
                target_duration = dialogue_clip.duration

        # Load music
        if music and os.path.exists(music):
            music_clip = AudioFileClip(music)

            # Adjust music duration
            if target_duration:
                if music_clip.duration < target_duration:
                    # Loop music if too short
                    repeats = int(target_duration / music_clip.duration) + 1
                    music_clip = music_clip.loop(n=repeats).subclip(0, target_duration)
                elif music_clip.duration > target_duration:
                    # Trim music if too long
                    music_clip = music_clip.subclip(0, target_duration)

            # Adjust volume
            music_clip = music_clip.volumex(music_volume)
            audio_clips.append(music_clip)

        if not audio_clips:
            return None

        # Composite audio
        if len(audio_clips) == 1:
            return audio_clips[0]
        else:
            return CompositeAudioClip(audio_clips)

    def normalize_audio(
        self,
        audio_path: str,
        target_level: float = -20.0
    ) -> str:
        """
        Normalize audio to target level using FFmpeg

        Args:
            audio_path: Path to audio file
            target_level: Target loudness level in dB

        Returns:
            Path to normalized audio file
        """
        output_path = str(self.temp_path / f"normalized_{os.path.basename(audio_path)}")

        try:
            # Use FFmpeg loudnorm filter
            cmd = [
                "ffmpeg",
                "-i", audio_path,
                "-af", f"loudnorm=I={target_level}:TP=-1.5:LRA=11",
                "-ar", "48000",
                "-y",
                output_path
            ]

            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Audio normalized: {output_path}")
            return output_path

        except subprocess.CalledProcessError as e:
            logger.error(f"Audio normalization failed: {e}")
            return audio_path  # Return original if normalization fails

    def _mix_audio_tracks(
        self,
        audio_paths: List[str],
        target_duration: float
    ) -> CompositeAudioClip:
        """
        Mix multiple audio tracks

        Args:
            audio_paths: List of paths to audio files
            target_duration: Target duration for mixed audio

        Returns:
            Mixed audio clip
        """
        audio_clips = []

        for i, audio_path in enumerate(audio_paths):
            if not os.path.exists(audio_path):
                logger.warning(f"Audio file not found: {audio_path}")
                continue

            audio = AudioFileClip(audio_path)

            # Adjust duration if needed
            if audio.duration < target_duration:
                # Loop audio if too short
                repeats = int(target_duration / audio.duration) + 1
                audio = audio.loop(n=repeats).subclip(0, target_duration)
            elif audio.duration > target_duration:
                # Trim audio if too long
                audio = audio.subclip(0, target_duration)

            # Volume adjustment: first track (dialogue) at full, others at 30%
            if i > 0:
                audio = audio.volumex(0.3)

            audio_clips.append(audio)

        if not audio_clips:
            logger.warning("No valid audio tracks found")
            return None

        # Composite audio
        mixed_audio = CompositeAudioClip(audio_clips)
        return mixed_audio

    def export_video(
        self,
        video: VideoFileClip,
        output_path: str,
        resolution: Resolution = Resolution.FHD_1080P,
        aspect_ratio: AspectRatio = AspectRatio.RATIO_16_9,
        codec: str = "h264",
        bitrate: str = "5M"
    ) -> str:
        """
        Export video to file with format options

        Args:
            video: Video clip to export
            output_path: Output file path
            resolution: Target resolution (480p, 720p, 1080p, 4k)
            aspect_ratio: Target aspect ratio (16:9, 9:16, 1:1, 4:3)
            codec: Video codec (h264, h265, vp9)
            bitrate: Video bitrate

        Returns:
            Path to exported video file
        """
        config = OutputConfig(
            resolution=resolution,
            aspect_ratio=aspect_ratio,
            codec=f"lib{codec}" if not codec.startswith("lib") else codec,
            bitrate=bitrate
        )

        self._export_video(video, output_path, config)
        return output_path

    def _export_video(
        self,
        video: VideoFileClip,
        output_path: str,
        config: OutputConfig
    ) -> None:
        """
        Export video with specified configuration

        Args:
            video: Video clip to export
            output_path: Output file path
            config: Output configuration
        """
        logger.info(f"Exporting video to {output_path}")
        logger.info(f"Resolution: {config.resolution}, Aspect: {config.aspect_ratio}")

        # Check for hardware acceleration
        hw_accel = self._check_hardware_acceleration()
        codec = config.codec

        # Use hardware encoder if available
        if hw_accel["nvenc"] and codec == "libx264":
            codec = "h264_nvenc"
            logger.info("Using NVIDIA NVENC hardware acceleration")
        elif hw_accel["qsv"] and codec == "libx264":
            codec = "h264_qsv"
            logger.info("Using Intel Quick Sync hardware acceleration")

        # FFmpeg parameters
        ffmpeg_params = [
            "-c:v", codec,
            "-preset", config.preset,
            "-crf", str(config.crf),
            "-b:v", config.bitrate,
            "-c:a", config.audio_codec,
            "-b:a", config.audio_bitrate,
            "-movflags", "+faststart",  # Enable streaming
            "-pix_fmt", "yuv420p",  # Compatibility
        ]

        # Add hardware-specific parameters
        if "nvenc" in codec:
            ffmpeg_params.extend([
                "-rc", "vbr",
                "-cq", str(config.crf),
                "-qmin", str(config.crf),
                "-qmax", str(config.crf + 4),
            ])

        # Export
        try:
            video.write_videofile(
                output_path,
                fps=config.fps,
                codec=codec,
                audio_codec=config.audio_codec,
                bitrate=config.bitrate,
                ffmpeg_params=ffmpeg_params,
                logger=None,  # Suppress MoviePy progress bar
                threads=4,
                preset=config.preset
            )
            logger.info(f"Video exported successfully: {output_path}")

        except Exception as e:
            logger.error(f"Video export failed: {e}")
            raise VideoAssemblyError(
                f"Failed to export video: {str(e)}",
                "EXPORT_FAILED",
                {"error": str(e)}
            )

    def get_video_info(self, video_path: str) -> Dict[str, Any]:
        """
        Get video file information using FFprobe

        Args:
            video_path: Path to video file

        Returns:
            Dictionary with video information
        """
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                video_path
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )

            import json
            info = json.loads(result.stdout)

            # Extract relevant information
            video_stream = next(
                (s for s in info["streams"] if s["codec_type"] == "video"),
                None
            )
            audio_stream = next(
                (s for s in info["streams"] if s["codec_type"] == "audio"),
                None
            )

            return {
                "duration": float(info["format"].get("duration", 0)),
                "size": int(info["format"].get("size", 0)),
                "bitrate": int(info["format"].get("bit_rate", 0)),
                "video": {
                    "codec": video_stream.get("codec_name") if video_stream else None,
                    "width": video_stream.get("width") if video_stream else None,
                    "height": video_stream.get("height") if video_stream else None,
                    "fps": eval(video_stream.get("r_frame_rate", "0/1")) if video_stream else None,
                } if video_stream else None,
                "audio": {
                    "codec": audio_stream.get("codec_name") if audio_stream else None,
                    "sample_rate": audio_stream.get("sample_rate") if audio_stream else None,
                    "channels": audio_stream.get("channels") if audio_stream else None,
                } if audio_stream else None,
            }

        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            return {}
