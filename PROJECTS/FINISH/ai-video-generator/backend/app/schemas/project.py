"""Project schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.project import ProjectStatus


class ProjectSettings(BaseModel):
    """Project settings schema."""
    
    style: Optional[str] = Field(None, description="Visual style (realistic, anime, cartoon)")
    resolution: Optional[str] = Field(None, description="Video resolution (480p, 720p, 1080p)")
    aspect_ratio: Optional[str] = Field(None, description="Aspect ratio (16:9, 9:16, 1:1, 4:3)")
    fps: Optional[int] = Field(24, description="Frames per second")
    inference_steps: Optional[int] = Field(30, description="Number of inference steps")
    guidance_scale: Optional[float] = Field(7.5, description="Guidance scale")


class ProjectCreate(BaseModel):
    """Schema for creating a project."""
    
    title: str = Field(..., min_length=1, max_length=255, description="Project title")
    script: str = Field(..., min_length=1, description="Video script")
    settings: Optional[ProjectSettings] = Field(None, description="Project settings")


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    script: Optional[str] = Field(None, min_length=1)
    settings: Optional[ProjectSettings] = None
    status: Optional[ProjectStatus] = None


class ProjectResponse(BaseModel):
    """Schema for project response."""
    
    id: str
    user_id: str
    title: str
    script: str
    status: ProjectStatus
    settings: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Schema for project list response."""
    
    projects: list[ProjectResponse]
    total: int
    page: int
    page_size: int
