"""Scene schemas."""

from typing import Optional
from pydantic import BaseModel, Field
from app.models.scene import SceneStatus


class SceneCreate(BaseModel):
    """Schema for creating a scene."""
    
    project_id: str = Field(..., description="Project ID")
    scene_number: int = Field(..., ge=1, description="Scene number")
    description: str = Field(..., min_length=1, description="Scene description")
    dialogue: Optional[str] = Field(None, description="Scene dialogue")
    duration: float = Field(5.0, gt=0, description="Scene duration in seconds")
    image_prompt: Optional[str] = Field(None, description="Image generation prompt")
    motion_prompt: Optional[str] = Field(None, description="Motion/animation prompt")


class SceneUpdate(BaseModel):
    """Schema for updating a scene."""
    
    scene_number: Optional[int] = Field(None, ge=1)
    description: Optional[str] = Field(None, min_length=1)
    dialogue: Optional[str] = None
    duration: Optional[float] = Field(None, gt=0)
    image_prompt: Optional[str] = None
    motion_prompt: Optional[str] = None
    status: Optional[SceneStatus] = None


class SceneResponse(BaseModel):
    """Schema for scene response."""
    
    id: str
    project_id: str
    scene_number: int
    description: str
    dialogue: Optional[str] = None
    duration: float
    image_prompt: Optional[str] = None
    motion_prompt: Optional[str] = None
    status: SceneStatus
    
    class Config:
        from_attributes = True


class SceneListResponse(BaseModel):
    """Schema for scene list response."""
    
    scenes: list[SceneResponse]
    total: int


class SceneRegenerateRequest(BaseModel):
    """Schema for scene regeneration request."""
    
    image_prompt: Optional[str] = Field(None, description="Override image prompt")
    motion_prompt: Optional[str] = Field(None, description="Override motion prompt")
    regenerate_video: bool = Field(True, description="Regenerate video clip")
    regenerate_audio: bool = Field(False, description="Regenerate audio")
