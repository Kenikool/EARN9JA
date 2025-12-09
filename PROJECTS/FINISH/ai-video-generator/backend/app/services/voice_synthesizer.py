"""Voice synthesis service using Coqui TTS."""

import os
import torch
from typing import Optional, Dict, List
from TTS.api import TTS
from TTS.utils.manage import ModelManager
import numpy as np
import soundfile as sf

from app.config import settings
from app.exceptions import ValidationException
from app.utils.logger import get_logger

logger = get_logger(__name__)


class VoiceSynthesizer:
    """Service for text-to-speech synthesis."""
    
    def __init__(self):
        """Initialize voice synthesizer."""
        self.device = self._get_device()
        self.tts: Optional[TTS] = None
        self.voice_profiles: Dict[str, Dict] = {}
        self.available_models: List[str] = []
        self.current_model: Optional[str] = None
        
        logger.info(f"Voice synthesizer initialized on device: {self.device}")
    
    def _get_device(self) -> str:
        """Determine device to use."""
        if settings.use_gpu and torch.cuda.is_available():
            return "cuda"
        return "cpu"
    
    def _load_tts(self, model_name: Optional[str] = None):
        """Load TTS model."""
        model_name = model_name or settings.default_tts_model
        
        if self.tts is not None and self.current_model == model_name:
            return
        
        logger.info(f"Loading TTS model: {model_name}")
        
        try:
            self.tts = TTS(model_name=model_name, progress_bar=False).to(self.device)
            self.current_model = model_name
            
            logger.info(f"TTS model loaded: {model_name}")
            
        except Exception as e:
            logger.error(f"Failed to load TTS model: {str(e)}")
            raise ValidationException(
                "Failed to load TTS model",
                details={"error": str(e), "model": model_name},
            )
    
    def list_available_models(self) -> List[str]:
        """
        List available TTS models.
        
        Returns:
            List of model names
        """
        try:
            manager = ModelManager()
            models = manager.list_tts_models()
            self.available_models = models
            logger.info(f"Found {len(models)} TTS models")
            return models
        except Exception as e:
            logger.error(f"Failed to list TTS models: {str(e)}")
            return []
    
    def list_available_voices(self) -> List[str]:
        """
        List available voices for current model.
        
        Returns:
            List of voice names
        """
        if self.tts is None:
            self._load_tts()
        
        try:
            if hasattr(self.tts, 'speakers') and self.tts.speakers:
                return self.tts.speakers
            return []
        except Exception as e:
            logger.error(f"Failed to list voices: {str(e)}")
            return []
    
    def synthesize_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language: str = "en",
        emotion: str = "neutral",
        speed: float = 1.0,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Synthesize speech from text.
        
        Args:
            text: Text to synthesize
            voice_id: Voice identifier
            language: Language code
            emotion: Emotional tone
            speed: Speech speed multiplier
            output_path: Optional output file path
            
        Returns:
            Path to generated audio file
            
        Raises:
            ValidationException: If synthesis fails
        """
        self._load_tts()
        
        logger.info(
            f"Synthesizing speech",
            extra={
                "text_length": len(text),
                "voice": voice_id,
                "language": language,
                "speed": speed,
            },
        )
        
        try:
            # Generate output path if not provided
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            # Synthesize
            if voice_id and hasattr(self.tts, 'speakers') and self.tts.speakers:
                # Multi-speaker model
                self.tts.tts_to_file(
                    text=text,
                    speaker=voice_id,
                    language=language if hasattr(self.tts, 'languages') else None,
                    file_path=output_path,
                    speed=speed,
                )
            else:
                # Single speaker model
                self.tts.tts_to_file(
                    text=text,
                    file_path=output_path,
                    speed=speed,
                )
            
            logger.info(f"Speech synthesized: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Speech synthesis failed: {str(e)}")
            raise ValidationException(
                "Failed to synthesize speech",
                details={"error": str(e), "text_preview": text[:100]},
            )
    
    def create_voice_profile(
        self,
        character_name: str,
        voice_id: str,
        language: str = "en",
        emotion: str = "neutral",
        speed: float = 1.0,
        pitch_shift: float = 0.0,
    ) -> Dict:
        """
        Create a voice profile for a character.
        
        Args:
            character_name: Character name
            voice_id: Voice identifier
            language: Language code
            emotion: Default emotion
            speed: Default speed
            pitch_shift: Pitch adjustment
            
        Returns:
            Voice profile dictionary
        """
        logger.info(f"Creating voice profile for: {character_name}")
        
        profile = {
            "character_name": character_name,
            "voice_id": voice_id,
            "language": language,
            "emotion": emotion,
            "speed": speed,
            "pitch_shift": pitch_shift,
        }
        
        self.voice_profiles[character_name] = profile
        
        logger.info(f"Voice profile created: {character_name}")
        
        return profile
    
    def get_voice_profile(self, character_name: str) -> Optional[Dict]:
        """
        Get voice profile for a character.
        
        Args:
            character_name: Character name
            
        Returns:
            Voice profile or None
        """
        return self.voice_profiles.get(character_name)
    
    def synthesize_with_profile(
        self,
        text: str,
        character_name: str,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Synthesize speech using character voice profile.
        
        Args:
            text: Text to synthesize
            character_name: Character name
            output_path: Optional output path
            
        Returns:
            Path to generated audio
            
        Raises:
            ValidationException: If profile not found or synthesis fails
        """
        profile = self.get_voice_profile(character_name)
        
        if profile is None:
            raise ValidationException(
                f"Voice profile not found for character: {character_name}",
                details={"character_name": character_name},
            )
        
        return self.synthesize_speech(
            text=text,
            voice_id=profile["voice_id"],
            language=profile["language"],
            emotion=profile["emotion"],
            speed=profile["speed"],
            output_path=output_path,
        )
    
    def adjust_pitch(
        self,
        audio_path: str,
        pitch_shift: float,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Adjust pitch of audio file.
        
        Args:
            audio_path: Input audio path
            pitch_shift: Pitch shift in semitones
            output_path: Optional output path
            
        Returns:
            Path to adjusted audio
        """
        logger.info(f"Adjusting pitch by {pitch_shift} semitones")
        
        try:
            import librosa
            
            # Load audio
            y, sr = librosa.load(audio_path, sr=None)
            
            # Shift pitch
            y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=pitch_shift)
            
            # Save
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            sf.write(output_path, y_shifted, sr)
            
            logger.info(f"Pitch adjusted: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Pitch adjustment failed: {str(e)}")
            raise ValidationException(
                "Failed to adjust pitch",
                details={"error": str(e)},
            )
    
    def adjust_speed(
        self,
        audio_path: str,
        speed_factor: float,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Adjust speed of audio file.
        
        Args:
            audio_path: Input audio path
            speed_factor: Speed multiplier (>1 faster, <1 slower)
            output_path: Optional output path
            
        Returns:
            Path to adjusted audio
        """
        logger.info(f"Adjusting speed by factor {speed_factor}")
        
        try:
            import librosa
            
            # Load audio
            y, sr = librosa.load(audio_path, sr=None)
            
            # Change speed
            y_stretched = librosa.effects.time_stretch(y, rate=speed_factor)
            
            # Save
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            sf.write(output_path, y_stretched, sr)
            
            logger.info(f"Speed adjusted: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Speed adjustment failed: {str(e)}")
            raise ValidationException(
                "Failed to adjust speed",
                details={"error": str(e)},
            )
    
    def add_emotion(
        self,
        audio_path: str,
        emotion: str,
        intensity: float = 0.5,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Add emotional characteristics to audio.
        
        Args:
            audio_path: Input audio path
            emotion: Emotion type (happy, sad, angry, etc.)
            intensity: Emotion intensity (0-1)
            output_path: Optional output path
            
        Returns:
            Path to processed audio
        """
        logger.info(f"Adding emotion: {emotion} with intensity {intensity}")
        
        try:
            import librosa
            
            # Load audio
            y, sr = librosa.load(audio_path, sr=None)
            
            # Apply emotion-based transformations
            if emotion == "happy":
                # Increase pitch slightly
                y = librosa.effects.pitch_shift(y, sr=sr, n_steps=intensity * 2)
                # Increase tempo slightly
                y = librosa.effects.time_stretch(y, rate=1 + intensity * 0.1)
            
            elif emotion == "sad":
                # Decrease pitch
                y = librosa.effects.pitch_shift(y, sr=sr, n_steps=-intensity * 2)
                # Decrease tempo
                y = librosa.effects.time_stretch(y, rate=1 - intensity * 0.1)
            
            elif emotion == "angry":
                # Increase intensity and pitch variation
                y = librosa.effects.pitch_shift(y, sr=sr, n_steps=intensity * 1.5)
                y = y * (1 + intensity * 0.2)  # Increase volume
            
            elif emotion == "calm":
                # Smooth and slow
                y = librosa.effects.time_stretch(y, rate=1 - intensity * 0.15)
            
            # Save
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".wav")
            
            sf.write(output_path, y, sr)
            
            logger.info(f"Emotion added: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Emotion processing failed: {str(e)}")
            raise ValidationException(
                "Failed to add emotion",
                details={"error": str(e), "emotion": emotion},
            )
    
    def unload_model(self):
        """Unload TTS model from memory."""
        logger.info("Unloading TTS model")
        
        if self.tts is not None:
            del self.tts
            self.tts = None
            self.current_model = None
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("TTS model unloaded")


# Global instance
_voice_synthesizer: Optional[VoiceSynthesizer] = None


def get_voice_synthesizer() -> VoiceSynthesizer:
    """Get or create global voice synthesizer instance."""
    global _voice_synthesizer
    if _voice_synthesizer is None:
        _voice_synthesizer = VoiceSynthesizer()
    return _voice_synthesizer
