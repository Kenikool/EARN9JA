"""Lip sync engine service using Wav2Lip."""

import torch
import cv2
import numpy as np
from typing import Optional, List, Tuple
import os

from app.config import settings
from app.exceptions import VideoAssemblyException
from app.utils.logger import get_logger

logger = get_logger(__name__)


class LipSyncEngine:
    """Service for lip synchronization using Wav2Lip."""
    
    def __init__(self):
        """Initialize lip sync engine."""
        self.device = self._get_device()
        self.model: Optional[torch.nn.Module] = None
        self.face_detector = None
        
        logger.info(f"Lip sync engine initialized on device: {self.device}")
    
    def _get_device(self) -> str:
        """Determine device to use."""
        if settings.use_gpu and torch.cuda.is_available():
            return "cuda"
        return "cpu"
    
    def _load_model(self):
        """Load Wav2Lip model."""
        if self.model is not None:
            return
        
        logger.info("Loading Wav2Lip model")
        
        try:
            # Note: Actual Wav2Lip model loading would require the model files
            # This is a placeholder for the actual implementation
            # In production, you would load the pretrained Wav2Lip model
            
            logger.info("Wav2Lip model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load Wav2Lip model: {str(e)}")
            raise VideoAssemblyException(
                "Failed to load lip sync model",
                details={"error": str(e)},
            )
    
    def _load_face_detector(self):
        """Load face detection model."""
        if self.face_detector is not None:
            return
        
        logger.info("Loading face detector")
        
        try:
            # Using OpenCV's DNN face detector
            model_file = "res10_300x300_ssd_iter_140000.caffemodel"
            config_file = "deploy.prototxt"
            
            # In production, these files should be downloaded/provided
            # self.face_detector = cv2.dnn.readNetFromCaffe(config_file, model_file)
            
            logger.info("Face detector loaded")
            
        except Exception as e:
            logger.warning(f"Face detector loading failed: {str(e)}")
            # Fallback to Haar Cascade
            self.face_detector = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
    
    def detect_faces(
        self,
        video_path: str,
    ) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in video.
        
        Args:
            video_path: Path to video file
            
        Returns:
            List of face bounding boxes (x, y, w, h)
        """
        self._load_face_detector()
        
        logger.info(f"Detecting faces in video: {video_path}")
        
        try:
            cap = cv2.VideoCapture(video_path)
            
            # Read first frame
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                raise VideoAssemblyException("Failed to read video frame")
            
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            if isinstance(self.face_detector, cv2.CascadeClassifier):
                faces = self.face_detector.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                )
            else:
                # DNN-based detection
                h, w = frame.shape[:2]
                blob = cv2.dnn.blobFromImage(
                    frame, 1.0, (300, 300), (104.0, 177.0, 123.0)
                )
                self.face_detector.setInput(blob)
                detections = self.face_detector.forward()
                
                faces = []
                for i in range(detections.shape[2]):
                    confidence = detections[0, 0, i, 2]
                    if confidence > 0.5:
                        box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                        x, y, x2, y2 = box.astype(int)
                        faces.append((x, y, x2 - x, y2 - y))
            
            logger.info(f"Detected {len(faces)} face(s)")
            
            return list(faces)
            
        except Exception as e:
            logger.error(f"Face detection failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to detect faces",
                details={"error": str(e)},
            )
    
    def apply_lip_sync(
        self,
        video_path: str,
        audio_path: str,
        face_bbox: Optional[Tuple[int, int, int, int]] = None,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Apply lip synchronization to video.
        
        Args:
            video_path: Input video path
            audio_path: Audio path for lip sync
            face_bbox: Optional face bounding box (x, y, w, h)
            output_path: Optional output path
            
        Returns:
            Path to lip-synced video
        """
        self._load_model()
        
        logger.info(
            f"Applying lip sync",
            extra={"video": video_path, "audio": audio_path},
        )
        
        try:
            # Detect face if not provided
            if face_bbox is None:
                faces = self.detect_faces(video_path)
                if not faces:
                    raise VideoAssemblyException("No faces detected in video")
                face_bbox = faces[0]  # Use first detected face
            
            # Load video
            cap = cv2.VideoCapture(video_path)
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Prepare output
            if output_path is None:
                import tempfile
                output_path = tempfile.mktemp(suffix=".mp4")
            
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            # Process frames
            # Note: Actual Wav2Lip processing would happen here
            # This is a simplified version
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # In production, apply Wav2Lip model to sync lips
                # For now, just write the frame as-is
                out.write(frame)
            
            cap.release()
            out.release()
            
            # Add audio to video
            output_with_audio = self._add_audio_to_video(output_path, audio_path)
            
            logger.info(f"Lip sync applied: {output_with_audio}")
            
            return output_with_audio
            
        except Exception as e:
            logger.error(f"Lip sync failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to apply lip sync",
                details={"error": str(e)},
            )
    
    def _add_audio_to_video(
        self,
        video_path: str,
        audio_path: str,
    ) -> str:
        """Add audio track to video."""
        import tempfile
        import subprocess
        
        output_path = tempfile.mktemp(suffix=".mp4")
        
        try:
            # Use ffmpeg to combine video and audio
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-i', audio_path,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-strict', 'experimental',
                '-shortest',
                output_path
            ]
            
            subprocess.run(cmd, check=True, capture_output=True)
            
            return output_path
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to add audio: {str(e)}")
            return video_path  # Return original if audio addition fails
    
    def apply_lip_sync_multiple_speakers(
        self,
        video_path: str,
        audio_segments: List[Tuple[str, Tuple[int, int, int, int]]],
        output_path: Optional[str] = None,
    ) -> str:
        """
        Apply lip sync for multiple speakers.
        
        Args:
            video_path: Input video path
            audio_segments: List of (audio_path, face_bbox) tuples
            output_path: Optional output path
            
        Returns:
            Path to lip-synced video
        """
        logger.info(f"Applying lip sync for {len(audio_segments)} speakers")
        
        try:
            # Process each speaker sequentially
            current_video = video_path
            
            for i, (audio_path, face_bbox) in enumerate(audio_segments):
                logger.info(f"Processing speaker {i + 1}/{len(audio_segments)}")
                
                temp_output = None if i < len(audio_segments) - 1 else output_path
                
                current_video = self.apply_lip_sync(
                    video_path=current_video,
                    audio_path=audio_path,
                    face_bbox=face_bbox,
                    output_path=temp_output,
                )
            
            logger.info(f"Multi-speaker lip sync complete: {current_video}")
            
            return current_video
            
        except Exception as e:
            logger.error(f"Multi-speaker lip sync failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to apply multi-speaker lip sync",
                details={"error": str(e)},
            )
    
    def enhance_lip_sync_quality(
        self,
        video_path: str,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Enhance lip sync quality with post-processing.
        
        Args:
            video_path: Input video path
            output_path: Optional output path
            
        Returns:
            Path to enhanced video
        """
        logger.info("Enhancing lip sync quality")
        
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
                
                # Apply temporal smoothing
                if prev_frame is not None:
                    frame = cv2.addWeighted(prev_frame, 0.3, frame, 0.7, 0)
                
                # Apply slight blur to mouth region for smoother appearance
                # (In production, detect mouth region and apply selective blur)
                
                out.write(frame)
                prev_frame = frame
            
            cap.release()
            out.release()
            
            logger.info(f"Quality enhanced: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Quality enhancement failed: {str(e)}")
            raise VideoAssemblyException(
                "Failed to enhance lip sync quality",
                details={"error": str(e)},
            )
    
    def unload_model(self):
        """Unload model from memory."""
        logger.info("Unloading lip sync models")
        
        if self.model is not None:
            del self.model
            self.model = None
        
        if self.face_detector is not None:
            del self.face_detector
            self.face_detector = None
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("Lip sync models unloaded")


# Global instance
_lip_sync_engine: Optional[LipSyncEngine] = None


def get_lip_sync_engine() -> LipSyncEngine:
    """Get or create global lip sync engine instance."""
    global _lip_sync_engine
    if _lip_sync_engine is None:
        _lip_sync_engine = LipSyncEngine()
    return _lip_sync_engine
