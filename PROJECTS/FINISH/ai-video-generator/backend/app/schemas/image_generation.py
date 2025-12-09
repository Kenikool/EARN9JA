"""Image generation schemas."""

from typing import Optional
from pydantic import BaseModel, Field


class ImageGenerationRequest(BaseModel):
    """Schema for image generation request."""
    
    prompt: str = Field(..., min_length=1, description="Text prompt for image generation")
    negative_prompt: str = Field("", description="Negative prompt (things to avoid)")
    width: int = Field(1024, ge=512, le=2048, description="Image width")
    height: int = Field(1024, ge=512, le=2048, description="Image height")
    num_inference_steps: int = Field(30, ge=1, le=150, description="Number of denoising steps")
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0, description="Guidance scale")
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    num_images: int = Field(1, ge=1, le=4, description="Number of images to generate")


class CharacterGenerationRequest(BaseModel):
    """Schema for character generation request."""
    
    prompt: str = Field(..., min_length=1, description="Character description")
    character_name: str = Field(..., description="Character name")
    lora_path: Optional[str] = Field(None, description="Path to character LoRA weights")
    pose: str = Field("standing", description="Character pose")
    expression: str = Field("neutral", description="Facial expression")
    negative_prompt: str = Field("", description="Negative prompt")
    width: int = Field(1024, ge=512, le=2048)
    height: int = Field(1024, ge=512, le=2048)
    num_inference_steps: int = Field(30, ge=1, le=150)
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0)
    seed: Optional[int] = None


class BackgroundGenerationRequest(BaseModel):
    """Schema for background generation request."""
    
    description: str = Field(..., min_length=1, description="Environment description")
    style: str = Field("realistic", description="Visual style")
    time_of_day: str = Field("day", description="Time of day")
    weather: str = Field("clear", description="Weather conditions")
    width: int = Field(1024, ge=512, le=2048)
    height: int = Field(1024, ge=512, le=2048)
    num_inference_steps: int = Field(30, ge=1, le=150)
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0)
    seed: Optional[int] = None


class ImageGenerationResponse(BaseModel):
    """Schema for image generation response."""
    
    image_paths: list[str]
    message: str
    seed: Optional[int] = None
