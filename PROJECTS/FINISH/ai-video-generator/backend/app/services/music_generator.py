"""Music generation service using MusicGen."""

import torch
import os
from typing import Optional
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy.io.wavfile as wavfile
import numpy as np

from app.config import settings
from app.exceptions import ValidationException
from app.utils.logger import get_logger

logger = get_logger(__name__)


class MusicGenerator:
    """Service for generating background music."""
    
    def __init__(self):
        """Initialize music generator."""
        self.device = self._get_device()
        self.model: Optional[MusicgenForConditionalGeneration] = None
        self.processor: Optional[AutoProcessor] = None
        self.current_model: Optional[str] = None
        
        logger.info(f"Music generator initialized on device: {self.device}")
    
    def _get_device(self) -> str:
        """Determine device to use."""
        if settings.use_gpu and torch.cuda.is_available():
            return "cuda"
        return "cpu"
    
    def _load_model(self, model_name: Optional[str] = None):
        """Load MusicGen model."""
        model_name = model_name or settings.default_music_model
        
        if self.model is not None and self.current_model == model_name:
            return
        
        logger.info(f"Loading MusicGen model: {model_name}")
        
        try:
            self.processor = AutoProcessor.from_pretrained(model_name)
            self.model = MusicgenForConditionalGeneration.from_pretrained(model_name)
            self.model = self.model.to(self.device)
            self.current_model = model_name
            
            logger.info(f"MusicGen model loaded: {model_name}")
            
        except Exception as e:
            logger.error(f"Failed to load MusicGen model: {str(e)}")
            raise ValidationException(
                "Failed to load music generation model",
                details={"error": str(e), "model": model_name},
            )
    
    def generate_music(
        self,
        description: str,
        duration: float = 30.0,
        genre: str = "cinematic",
        tempo: int = 120,
        mood: str = "neutral",
        output_path: Optional[str] = None,
    ) -> str:
        """
        Generate background music from text description.
        
        Args:
            description: Text description of desired music
            duration: Duration in seconds
            genre: Music genre
            tempo: Tempo in BPM
            mood: Mood/emotion
            output_path: Optional output file path
            
        Returns:
            Path to generated audio file
            
        Raises:
            ValidationException: If generation fails
        """
        self._load_model()
        
        logger.info(
            f"Generating music",
            extra={
                "duration": duration,
                "genre": genre,
                "tempo": tempo,
                "mood": mood,
            },
        )
        
        try:
            # Enhance prompt with genre, tempo, and mood
            enhanced_prompt = f"{genre} music, {mood} mood, {tempo} BPM, {description}"
            
            # Process inputs
            inputs = self.processor(
                text=[enhanced_prompt],
                padding=True,
                return_tensors="pt",
            ).to(self.device)
            
            # Calculate max_new_tokens based on duration
            # MusicGen generates at 50 Hz, so tokens = duration * 50
            max_new_tokens = int(duration * 50)
            
            # Generate
            with torch.no_grad():
                audio_values = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    do_sample=True,
                    guidance_scale=3.0,
                )
            
            # Convert to numpy
            audio_array = audio_values[0, 0].cpu().numpy()
            
            # Save to file
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            # MusicGen outputs at 32kHz
            sample_rate = self.model.config.audio_encoder.sampling_rate
            wavfile.write(output_path, sample_rate, audio_array)
            
            logger.info(f"Music generated: {output_path}")
            
            return output_path
            
        except torch.cuda.OutOfMemoryError:
            logger.error("GPU out of memory during music generation")
            raise ValidationException(
                "GPU out of memory. Try reducing duration.",
                details={"duration": duration},
            )
        except Exception as e:
            logger.error(f"Music generation failed: {str(e)}")
            raise ValidationException(
                "Failed to generate music",
                details={"error": str(e)},
            )
    
    def extend_music(
        self,
        audio_path: str,
        target_duration: float,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Extend music to match target duration.
        
        Args:
            audio_path: Input audio path
            target_duration: Target duration in seconds
            output_path: Optional output path
            
        Returns:
            Path to extended audio
        """
        logger.info(f"Extending music to {target_duration} seconds")
        
        try:
            import librosa
            import soundfile as sf
            
            # Load audio
            y, sr = librosa.load(audio_path, sr=None)
            current_duration = len(y) / sr
            
            if current_duration >= target_duration:
                # Already long enough
                return audio_path
            
            # Calculate how many times to loop
            num_loops = int(np.ceil(target_duration / current_duration))
            
            # Loop audio
            y_extended = np.tile(y, num_loops)
            
            # Trim to exact duration
            target_samples = int(target_duration * sr)
            y_extended = y_extended[:target_samples]
            
            # Apply fade at loop points for seamless transition
            fade_duration = int(0.5 * sr)  # 0.5 second fade
            for i in range(1, num_loops):
                loop_point = int(i * len(y))
                if loop_point < len(y_extended):
                    # Fade out before loop point
                    start_fade = max(0, loop_point - fade_duration)
                    fade_out = np.linspace(1, 0, loop_point - start_fade)
                    y_extended[start_fade:loop_point] *= fade_out
                    
                    # Fade in after loop point
                    end_fade = min(len(y_extended), loop_point + fade_duration)
                    fade_in = np.linspace(0, 1, end_fade - loop_point)
                    y_extended[loop_point:end_fade] *= fade_in
            
            # Save
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            sf.write(output_path, y_extended, sr)
            
            logger.info(f"Music extended: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Music extension failed: {str(e)}")
            raise ValidationException(
                "Failed to extend music",
                details={"error": str(e)},
            )
    
    def create_seamless_loop(
        self,
        audio_path: str,
        loop_duration: Optional[float] = None,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Create seamless looping audio.
        
        Args:
            audio_path: Input audio path
            loop_duration: Optional loop duration (uses full audio if None)
            output_path: Optional output path
            
        Returns:
            Path to loopable audio
        """
        logger.info("Creating seamless loop")
        
        try:
            import librosa
            import soundfile as sf
            
            # Load audio
            y, sr = librosa.load(audio_path, sr=None)
            
            # Trim to loop duration if specified
            if loop_duration:
                target_samples = int(loop_duration * sr)
                y = y[:target_samples]
            
            # Apply crossfade at endpoints
            fade_duration = int(0.5 * sr)  # 0.5 second crossfade
            
            # Fade out at end
            y[-fade_duration:] *= np.linspace(1, 0, fade_duration)
            
            # Fade in at start
            y[:fade_duration] *= np.linspace(0, 1, fade_duration)
            
            # Crossfade: add faded end to faded start
            y[:fade_duration] += y[-fade_duration:] * np.linspace(1, 0, fade_duration)
            
            # Save
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            sf.write(output_path, y, sr)
            
            logger.info(f"Seamless loop created: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Loop creation failed: {str(e)}")
            raise ValidationException(
                "Failed to create seamless loop",
                details={"error": str(e)},
            )
    
    def adjust_tempo(
        self,
        audio_path: str,
        target_tempo: int,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Adjust tempo of music.
        
        Args:
            audio_path: Input audio path
            target_tempo: Target tempo in BPM
            output_path: Optional output path
            
        Returns:
            Path to adjusted audio
        """
        logger.info(f"Adjusting tempo to {target_tempo} BPM")
        
        try:
            import librosa
            import soundfile as sf
            
            # Load audio
            y, sr = librosa.load(audio_path, sr=None)
            
            # Estimate current tempo
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            
            # Calculate stretch rate
            rate = target_tempo / tempo
            
            # Time stretch
            y_stretched = librosa.effects.time_stretch(y, rate=rate)
            
            # Save
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            sf.write(output_path, y_stretched, sr)
            
            logger.info(f"Tempo adjusted: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Tempo adjustment failed: {str(e)}")
            raise ValidationException(
                "Failed to adjust tempo",
                details={"error": str(e)},
            )
    
    def mix_with_audio(
        self,
        music_path: str,
        audio_path: str,
        music_volume: float = 0.3,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Mix music with other audio (e.g., dialogue).
        
        Args:
            music_path: Background music path
            audio_path: Foreground audio path
            music_volume: Music volume (0-1)
            output_path: Optional output path
            
        Returns:
            Path to mixed audio
        """
        logger.info(f"Mixing audio with music volume {music_volume}")
        
        try:
            import librosa
            import soundfile as sf
            
            # Load both audio files
            music, sr_music = librosa.load(music_path, sr=None)
            audio, sr_audio = librosa.load(audio_path, sr=None)
            
            # Resample if needed
            if sr_music != sr_audio:
                music = librosa.resample(music, orig_sr=sr_music, target_sr=sr_audio)
                sr = sr_audio
            else:
                sr = sr_music
            
            # Match lengths
            if len(music) < len(audio):
                # Loop music to match audio length
                num_loops = int(np.ceil(len(audio) / len(music)))
                music = np.tile(music, num_loops)[:len(audio)]
            else:
                music = music[:len(audio)]
            
            # Mix with volume adjustment
            mixed = audio + (music * music_volume)
            
            # Normalize to prevent clipping
            max_val = np.abs(mixed).max()
            if max_val > 1.0:
                mixed = mixed / max_val
            
            # Save
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            sf.write(output_path, mixed, sr)
            
            logger.info(f"Audio mixed: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Audio mixing failed: {str(e)}")
            raise ValidationException(
                "Failed to mix audio",
                details={"error": str(e)},
            )
    
    def unload_model(self):
        """Unload model from memory."""
        logger.info("Unloading MusicGen model")
        
        if self.model is not None:
            del self.model
            self.model = None
        
        if self.processor is not None:
            del self.processor
            self.processor = None
        
        self.current_model = None
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("MusicGen model unloaded")


# Global instance
_music_generator: Optional[MusicGenerator] = None


def get_music_generator() -> MusicGenerator:
    """Get or create global music generator instance."""
    global _music_generator
    if _music_generator is None:
        _music_generator = MusicGenerator()
    return _music_generator
