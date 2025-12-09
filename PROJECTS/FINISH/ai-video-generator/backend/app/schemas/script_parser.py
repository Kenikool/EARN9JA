"""Script parser schemas."""

from typing import Optional, List
from pydantic import BaseModel, Field


class ScriptParseRequest(BaseModel):
    """Schema for script parse request."""
    
    project_id: str = Field(..., description="Project UUID")
    script: str = Field(..., min_length=1, description="Script text to parse")


class SceneInfo(BaseModel):
    """Schema for scene information."""
    
    id: str
    scene_number: int
    description: str
    dialogue: Optional[str] = None
    duration: float


class CharacterInfo(BaseModel):
    """Schema for character information."""
    
    id: str
    name: str
    description: str


class ScriptParseResponse(BaseModel):
    """Schema for script parse response."""
    
    scenes: List[SceneInfo]
    characters: List[CharacterInfo]
    message: str


class GeneratePromptsRequest(BaseModel):
    """Schema for generate prompts request."""
    
    project_id: str = Field(..., description="Project UUID")
    scene_id: Optional[str] = Field(None, description="Optional specific scene ID")
    character_consistency: bool = Field(True, description="Maintain character consistency")


class ScenePrompts(BaseModel):
    """Schema for scene prompts."""
    
    scene_id: str
    image_prompt: str
    motion_prompt: str
    negative_prompt: str


class GeneratePromptsResponse(BaseModel):
    """Schema for generate prompts response."""
    
    prompts: List[ScenePrompts]
    message: str
