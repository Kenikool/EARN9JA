"""
Model Manager Schemas

Pydantic models for model management requests and responses.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class ModelType(str, Enum):
    """AI model types"""
    IMAGE_GEN = "image_gen"
    ANIMATION = "animation"
    TTS = "tts"
    MUSIC = "music"
    LIP_SYNC = "lip_sync"
    LLM = "llm"


class ModelStatus(str, Enum):
    """Model status"""
    NOT_INSTALLED = "not_installed"
    DOWNLOADING = "downloading"
    INSTALLED = "installed"
    ACTIVE = "active"
    ERROR = "error"


class ModelInfoResponse(BaseModel):
    """Model information response"""
    model_id: str = Field(..., description="Model identifier")
    model_type: ModelType = Field(..., description="Model type")
    name: str = Field(..., description="Model name")
    description: str = Field(..., description="Model description")
    source: str = Field(..., description="Model source (huggingface, url, ollama)")
    source_url: Optional[str] = Field(None, description="Source URL")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    file_size_gb: Optional[float] = Field(None, description="File size in GB")
    checksum: Optional[str] = Field(None, description="MD5 checksum")
    requirements: Optional[Dict[str, Any]] = Field(None, description="Model requirements")
    status: ModelStatus = Field(..., description="Model status")
    local_path: Optional[str] = Field(None, description="Local file path")

    class Config:
        from_attributes = True


class ListModelsResponse(BaseModel):
    """List models response"""
    models: List[ModelInfoResponse] = Field(..., description="List of models")
    total: int = Field(..., description="Total number of models")


class DownloadModelRequest(BaseModel):
    """Download model request"""
    model_id: str = Field(..., description="Model identifier")


class DownloadModelResponse(BaseModel):
    """Download model response"""
    model_id: str = Field(..., description="Model identifier")
    status: str = Field(..., description="Download status")
    local_path: str = Field(..., description="Local path to model")
    message: str = Field(..., description="Status message")


class ActivateModelRequest(BaseModel):
    """Activate model request"""
    model_id: str = Field(..., description="Model identifier")


class ActivateModelResponse(BaseModel):
    """Activate model response"""
    model_id: str = Field(..., description="Model identifier")
    status: ModelStatus = Field(..., description="Model status")
    message: str = Field(..., description="Status message")


class DeleteModelRequest(BaseModel):
    """Delete model request"""
    model_id: str = Field(..., description="Model identifier")


class DeleteModelResponse(BaseModel):
    """Delete model response"""
    model_id: str = Field(..., description="Model identifier")
    message: str = Field(..., description="Status message")


class StorageInfoResponse(BaseModel):
    """Storage information response"""
    total_models: int = Field(..., description="Total number of models")
    installed_models: int = Field(..., description="Number of installed models")
    total_size_bytes: int = Field(..., description="Total size in bytes")
    total_size_gb: float = Field(..., description="Total size in GB")
    models_path: str = Field(..., description="Models storage path")


class AddModelRequest(BaseModel):
    """Add custom model request"""
    model_id: str = Field(..., description="Model identifier")
    model_type: ModelType = Field(..., description="Model type")
    name: str = Field(..., description="Model name")
    description: str = Field(..., description="Model description")
    source: str = Field(..., description="Model source (huggingface, url, ollama)")
    source_url: str = Field(..., description="Source URL")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    checksum: Optional[str] = Field(None, description="MD5 checksum")
    requirements: Optional[Dict[str, Any]] = Field(None, description="Model requirements")


class ModelConfigUpdate(BaseModel):
    """Update model configuration"""
    parameters: Optional[Dict[str, Any]] = Field(None, description="Model parameters")
    is_active: Optional[bool] = Field(None, description="Activation status")
