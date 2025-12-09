"""
Model Manager Service

Handles downloading, configuring, and managing AI models.
Supports HuggingFace models, direct URLs, and model verification.
"""

import os
import hashlib
import json
from pathlib import Path
from typing import Optional, Dict, Any, List, Callable
from dataclasses import dataclass
from enum import Enum
import requests
from tqdm import tqdm

from app.utils.logger import get_logger
from app.exceptions import VideoGeneratorException

logger = get_logger(__name__)


class ModelType(str, Enum):
    """AI model types"""
    IMAGE_GEN = "image_gen"
    ANIMATION = "animation"
    TTS = "tts"
    MUSIC = "music"
    LIP_SYNC = "lip_sync"
    LLM = "llm"


class ModelStatus(str, Enum):
    """Model download/installation status"""
    NOT_INSTALLED = "not_installed"
    DOWNLOADING = "downloading"
    INSTALLED = "installed"
    ACTIVE = "active"
    ERROR = "error"


@dataclass
class ModelInfo:
    """Model information"""
    model_id: str
    model_type: ModelType
    name: str
    description: str
    source: str  # huggingface, url, local
    source_url: Optional[str] = None
    file_size: Optional[int] = None
    checksum: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None
    status: ModelStatus = ModelStatus.NOT_INSTALLED
    local_path: Optional[str] = None


class ModelDownloadError(VideoGeneratorException):
    """Error during model download"""
    def __init__(self, message: str, details: Dict = None):
        super().__init__(message, "MODEL_DOWNLOAD_ERROR", details, 500)


class ModelVerificationError(VideoGeneratorException):
    """Error during model verification"""
    def __init__(self, message: str, details: Dict = None):
        super().__init__(message, "MODEL_VERIFICATION_ERROR", details, 500)


class ModelManagerService:
    """Service for managing AI models"""

    def __init__(self, models_path: str = "./models"):
        """
        Initialize Model Manager Service

        Args:
            models_path: Base path for model storage
        """
        self.models_path = Path(models_path)
        self.models_path.mkdir(parents=True, exist_ok=True)

        # Model registry
        self.models: Dict[str, ModelInfo] = {}
        
        # Progress callbacks
        self.progress_callbacks: Dict[str, Callable] = {}

        # Load model registry
        self._load_registry()

        logger.info(f"Model Manager initialized with path: {self.models_path}")

    def _load_registry(self) -> None:
        """Load model registry from disk"""
        registry_path = self.models_path / "registry.json"
        
        if registry_path.exists():
            try:
                with open(registry_path, 'r') as f:
                    data = json.load(f)
                    
                for model_data in data.get("models", []):
                    model_info = ModelInfo(**model_data)
                    self.models[model_info.model_id] = model_info
                    
                logger.info(f"Loaded {len(self.models)} models from registry")
            except Exception as e:
                logger.error(f"Failed to load model registry: {e}")
        else:
            # Initialize with default models
            self._initialize_default_models()

    def _save_registry(self) -> None:
        """Save model registry to disk"""
        registry_path = self.models_path / "registry.json"
        
        try:
            data = {
                "models": [
                    {
                        "model_id": m.model_id,
                        "model_type": m.model_type.value,
                        "name": m.name,
                        "description": m.description,
                        "source": m.source,
                        "source_url": m.source_url,
                        "file_size": m.file_size,
                        "checksum": m.checksum,
                        "requirements": m.requirements,
                        "status": m.status.value,
                        "local_path": m.local_path,
                    }
                    for m in self.models.values()
                ]
            }
            
            with open(registry_path, 'w') as f:
                json.dump(data, f, indent=2)
                
            logger.info("Model registry saved")
        except Exception as e:
            logger.error(f"Failed to save model registry: {e}")

    def _initialize_default_models(self) -> None:
        """Initialize registry with default models"""
        default_models = [
            ModelInfo(
                model_id="sdxl-base-1.0",
                model_type=ModelType.IMAGE_GEN,
                name="Stable Diffusion XL Base 1.0",
                description="Base SDXL model for image generation",
                source="huggingface",
                source_url="stabilityai/stable-diffusion-xl-base-1.0",
                file_size=6_900_000_000,  # ~6.9GB
                requirements={"gpu_memory": "8GB", "torch": ">=2.0.0"}
            ),
            ModelInfo(
                model_id="animatediff-motion",
                model_type=ModelType.ANIMATION,
                name="AnimateDiff Motion Module",
                description="Motion module for AnimateDiff",
                source="huggingface",
                source_url="guoyww/animatediff-motion-adapter-v1-5-2",
                file_size=1_700_000_000,  # ~1.7GB
                requirements={"gpu_memory": "6GB"}
            ),
            ModelInfo(
                model_id="coqui-tts-vits",
                model_type=ModelType.TTS,
                name="Coqui TTS VITS",
                description="VITS-based TTS model",
                source="huggingface",
                source_url="coqui/XTTS-v2",
                file_size=1_800_000_000,  # ~1.8GB
                requirements={"gpu_memory": "4GB"}
            ),
            ModelInfo(
                model_id="musicgen-small",
                model_type=ModelType.MUSIC,
                name="MusicGen Small",
                description="Small MusicGen model for music generation",
                source="huggingface",
                source_url="facebook/musicgen-small",
                file_size=1_500_000_000,  # ~1.5GB
                requirements={"gpu_memory": "4GB"}
            ),
            ModelInfo(
                model_id="wav2lip",
                model_type=ModelType.LIP_SYNC,
                name="Wav2Lip",
                description="Lip sync model",
                source="url",
                source_url="https://github.com/Rudrabha/Wav2Lip/releases/download/v1.0/wav2lip_gan.pth",
                file_size=150_000_000,  # ~150MB
                checksum="d3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3",
                requirements={"gpu_memory": "2GB"}
            ),
            ModelInfo(
                model_id="llama-3-8b",
                model_type=ModelType.LLM,
                name="Llama 3 8B",
                description="Llama 3 8B for script parsing (via Ollama)",
                source="ollama",
                source_url="llama3:8b",
                file_size=4_700_000_000,  # ~4.7GB
                requirements={"gpu_memory": "8GB"}
            ),
        ]

        for model in default_models:
            self.models[model.model_id] = model

        self._save_registry()
        logger.info(f"Initialized {len(default_models)} default models")

    def list_models(
        self,
        model_type: Optional[ModelType] = None,
        status: Optional[ModelStatus] = None
    ) -> List[ModelInfo]:
        """
        List available models

        Args:
            model_type: Filter by model type
            status: Filter by status

        Returns:
            List of model information
        """
        models = list(self.models.values())

        if model_type:
            models = [m for m in models if m.model_type == model_type]

        if status:
            models = [m for m in models if m.status == status]

        return models

    def get_model(self, model_id: str) -> Optional[ModelInfo]:
        """
        Get model information

        Args:
            model_id: Model identifier

        Returns:
            Model information or None
        """
        return self.models.get(model_id)

    def download_model(
        self,
        model_id: str,
        progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> str:
        """
        Download model from source

        Args:
            model_id: Model identifier
            progress_callback: Callback for progress updates (downloaded, total)

        Returns:
            Local path to downloaded model

        Raises:
            ModelDownloadError: If download fails
        """
        model = self.models.get(model_id)
        if not model:
            raise ModelDownloadError(
                f"Model not found: {model_id}",
                {"model_id": model_id}
            )

        if model.status == ModelStatus.INSTALLED:
            logger.info(f"Model already installed: {model_id}")
            return model.local_path

        logger.info(f"Downloading model: {model_id}")
        model.status = ModelStatus.DOWNLOADING
        self._save_registry()

        try:
            if model.source == "huggingface":
                local_path = self._download_from_huggingface(
                    model,
                    progress_callback
                )
            elif model.source == "url":
                local_path = self._download_from_url(
                    model,
                    progress_callback
                )
            elif model.source == "ollama":
                local_path = self._download_from_ollama(model)
            else:
                raise ModelDownloadError(
                    f"Unsupported model source: {model.source}",
                    {"source": model.source}
                )

            # Verify download
            if model.checksum:
                self._verify_checksum(local_path, model.checksum)

            # Update model info
            model.local_path = local_path
            model.status = ModelStatus.INSTALLED
            self._save_registry()

            logger.info(f"Model downloaded successfully: {model_id}")
            return local_path

        except Exception as e:
            model.status = ModelStatus.ERROR
            self._save_registry()
            logger.error(f"Model download failed: {e}")
            raise ModelDownloadError(
                f"Failed to download model: {str(e)}",
                {"model_id": model_id, "error": str(e)}
            )

    def _download_from_huggingface(
        self,
        model: ModelInfo,
        progress_callback: Optional[Callable] = None
    ) -> str:
        """Download model from HuggingFace"""
        try:
            from huggingface_hub import snapshot_download

            model_path = self.models_path / model.model_type.value / model.model_id

            logger.info(f"Downloading from HuggingFace: {model.source_url}")

            local_path = snapshot_download(
                repo_id=model.source_url,
                local_dir=str(model_path),
                local_dir_use_symlinks=False,
            )

            return str(local_path)

        except ImportError:
            raise ModelDownloadError(
                "huggingface_hub not installed. Install with: pip install huggingface_hub",
                {"model_id": model.model_id}
            )
        except Exception as e:
            raise ModelDownloadError(
                f"HuggingFace download failed: {str(e)}",
                {"model_id": model.model_id, "error": str(e)}
            )

    def _download_from_url(
        self,
        model: ModelInfo,
        progress_callback: Optional[Callable] = None
    ) -> str:
        """Download model from direct URL"""
        model_path = self.models_path / model.model_type.value / model.model_id
        model_path.mkdir(parents=True, exist_ok=True)

        filename = model.source_url.split('/')[-1]
        local_path = model_path / filename

        logger.info(f"Downloading from URL: {model.source_url}")

        try:
            response = requests.get(model.source_url, stream=True)
            response.raise_for_status()

            total_size = int(response.headers.get('content-length', 0))

            with open(local_path, 'wb') as f:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)

                        if progress_callback:
                            progress_callback(downloaded, total_size)

            return str(local_path)

        except Exception as e:
            if local_path.exists():
                local_path.unlink()
            raise ModelDownloadError(
                f"URL download failed: {str(e)}",
                {"model_id": model.model_id, "url": model.source_url}
            )

    def _download_from_ollama(self, model: ModelInfo) -> str:
        """Download model via Ollama"""
        import subprocess

        logger.info(f"Pulling Ollama model: {model.source_url}")

        try:
            result = subprocess.run(
                ["ollama", "pull", model.source_url],
                capture_output=True,
                text=True,
                check=True
            )

            logger.info(f"Ollama model pulled: {result.stdout}")
            return model.source_url  # Ollama manages its own storage

        except subprocess.CalledProcessError as e:
            raise ModelDownloadError(
                f"Ollama pull failed: {e.stderr}",
                {"model_id": model.model_id, "error": e.stderr}
            )
        except FileNotFoundError:
            raise ModelDownloadError(
                "Ollama not found. Please install Ollama first.",
                {"model_id": model.model_id}
            )

    def _verify_checksum(self, file_path: str, expected_checksum: str) -> None:
        """
        Verify file checksum

        Args:
            file_path: Path to file
            expected_checksum: Expected MD5 checksum

        Raises:
            ModelVerificationError: If checksum doesn't match
        """
        logger.info(f"Verifying checksum for {file_path}")

        md5_hash = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                md5_hash.update(chunk)

        actual_checksum = md5_hash.hexdigest()

        if actual_checksum != expected_checksum:
            raise ModelVerificationError(
                "Checksum verification failed",
                {
                    "expected": expected_checksum,
                    "actual": actual_checksum,
                    "file": file_path
                }
            )

        logger.info("Checksum verification passed")

    def activate_model(self, model_id: str) -> None:
        """
        Activate a model for use

        Args:
            model_id: Model identifier
        """
        model = self.models.get(model_id)
        if not model:
            raise ValueError(f"Model not found: {model_id}")

        if model.status != ModelStatus.INSTALLED:
            raise ValueError(f"Model not installed: {model_id}")

        # Deactivate other models of same type
        for m in self.models.values():
            if m.model_type == model.model_type and m.status == ModelStatus.ACTIVE:
                m.status = ModelStatus.INSTALLED

        model.status = ModelStatus.ACTIVE
        self._save_registry()

        logger.info(f"Model activated: {model_id}")

    def deactivate_model(self, model_id: str) -> None:
        """
        Deactivate a model

        Args:
            model_id: Model identifier
        """
        model = self.models.get(model_id)
        if not model:
            raise ValueError(f"Model not found: {model_id}")

        if model.status == ModelStatus.ACTIVE:
            model.status = ModelStatus.INSTALLED
            self._save_registry()

        logger.info(f"Model deactivated: {model_id}")

    def delete_model(self, model_id: str) -> None:
        """
        Delete a model from disk

        Args:
            model_id: Model identifier
        """
        model = self.models.get(model_id)
        if not model:
            raise ValueError(f"Model not found: {model_id}")

        if model.local_path and os.path.exists(model.local_path):
            import shutil
            if os.path.isdir(model.local_path):
                shutil.rmtree(model.local_path)
            else:
                os.remove(model.local_path)

            logger.info(f"Model deleted from disk: {model_id}")

        model.status = ModelStatus.NOT_INSTALLED
        model.local_path = None
        self._save_registry()

    def get_active_model(self, model_type: ModelType) -> Optional[ModelInfo]:
        """
        Get active model for a type

        Args:
            model_type: Model type

        Returns:
            Active model info or None
        """
        for model in self.models.values():
            if model.model_type == model_type and model.status == ModelStatus.ACTIVE:
                return model
        return None

    def get_storage_info(self) -> Dict[str, Any]:
        """
        Get storage information

        Returns:
            Dictionary with storage stats
        """
        total_size = 0
        installed_count = 0

        for model in self.models.values():
            if model.status in [ModelStatus.INSTALLED, ModelStatus.ACTIVE]:
                installed_count += 1
                if model.file_size:
                    total_size += model.file_size

        return {
            "total_models": len(self.models),
            "installed_models": installed_count,
            "total_size_bytes": total_size,
            "total_size_gb": round(total_size / (1024**3), 2),
            "models_path": str(self.models_path)
        }

    def switch_model(
        self,
        model_id: str,
        clear_gpu_memory: bool = True
    ) -> ModelInfo:
        """
        Switch to a different model (hot-swap)

        Args:
            model_id: Model identifier to switch to
            clear_gpu_memory: Whether to clear GPU memory before switching

        Returns:
            Activated model info

        Raises:
            ValueError: If model not found or not installed
        """
        model = self.models.get(model_id)
        if not model:
            raise ValueError(f"Model not found: {model_id}")

        if model.status not in [ModelStatus.INSTALLED, ModelStatus.ACTIVE]:
            raise ValueError(f"Model not installed: {model_id}")

        logger.info(f"Switching to model: {model_id}")

        # Clear GPU memory if requested
        if clear_gpu_memory:
            self._clear_gpu_memory()

        # Deactivate current active model of same type
        current_active = self.get_active_model(model.model_type)
        if current_active and current_active.model_id != model_id:
            logger.info(f"Deactivating current model: {current_active.model_id}")
            self.deactivate_model(current_active.model_id)

        # Activate new model
        self.activate_model(model_id)

        logger.info(f"Model switched successfully: {model_id}")
        return model

    def _clear_gpu_memory(self) -> None:
        """Clear GPU memory cache"""
        try:
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.synchronize()
                logger.info("GPU memory cleared")
        except ImportError:
            logger.warning("PyTorch not available, skipping GPU memory clear")
        except Exception as e:
            logger.warning(f"Failed to clear GPU memory: {e}")

    def reload_model(self, model_id: str) -> ModelInfo:
        """
        Reload a model (useful after configuration changes)

        Args:
            model_id: Model identifier

        Returns:
            Reloaded model info
        """
        model = self.models.get(model_id)
        if not model:
            raise ValueError(f"Model not found: {model_id}")

        logger.info(f"Reloading model: {model_id}")

        # If model is active, switch to it (which will reload)
        if model.status == ModelStatus.ACTIVE:
            return self.switch_model(model_id, clear_gpu_memory=True)

        return model

    def get_model_requirements(self, model_id: str) -> Dict[str, Any]:
        """
        Get model requirements

        Args:
            model_id: Model identifier

        Returns:
            Dictionary with model requirements
        """
        model = self.models.get(model_id)
        if not model:
            raise ValueError(f"Model not found: {model_id}")

        requirements = model.requirements or {}

        # Add computed requirements
        requirements["disk_space_gb"] = (
            round(model.file_size / (1024**3), 2) if model.file_size else 0
        )
        requirements["installed"] = model.status in [
            ModelStatus.INSTALLED,
            ModelStatus.ACTIVE
        ]

        return requirements

    def check_system_compatibility(self, model_id: str) -> Dict[str, Any]:
        """
        Check if system meets model requirements

        Args:
            model_id: Model identifier

        Returns:
            Dictionary with compatibility check results
        """
        model = self.models.get(model_id)
        if not model:
            raise ValueError(f"Model not found: {model_id}")

        requirements = model.requirements or {}
        results = {
            "compatible": True,
            "checks": {},
            "warnings": []
        }

        # Check GPU memory
        if "gpu_memory" in requirements:
            try:
                import torch
                if torch.cuda.is_available():
                    gpu_memory_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
                    required_gb = float(requirements["gpu_memory"].replace("GB", ""))

                    results["checks"]["gpu_memory"] = {
                        "required": required_gb,
                        "available": round(gpu_memory_gb, 2),
                        "sufficient": gpu_memory_gb >= required_gb
                    }

                    if gpu_memory_gb < required_gb:
                        results["compatible"] = False
                        results["warnings"].append(
                            f"Insufficient GPU memory: {gpu_memory_gb:.1f}GB available, "
                            f"{required_gb}GB required"
                        )
                else:
                    results["checks"]["gpu_memory"] = {
                        "required": requirements["gpu_memory"],
                        "available": "No GPU",
                        "sufficient": False
                    }
                    results["warnings"].append("No GPU available, model will run on CPU (slow)")
            except ImportError:
                results["warnings"].append("PyTorch not installed, cannot check GPU")

        # Check disk space
        if model.file_size:
            import shutil
            disk_stats = shutil.disk_usage(self.models_path)
            free_gb = disk_stats.free / (1024**3)
            required_gb = model.file_size / (1024**3)

            results["checks"]["disk_space"] = {
                "required": round(required_gb, 2),
                "available": round(free_gb, 2),
                "sufficient": free_gb >= required_gb
            }

            if free_gb < required_gb:
                results["compatible"] = False
                results["warnings"].append(
                    f"Insufficient disk space: {free_gb:.1f}GB available, "
                    f"{required_gb:.1f}GB required"
                )

        return results
