"""Image generation API endpoints."""

import uuid
import os
from fastapi import APIRouter, status
from fastapi.responses import FileResponse

from app.services.image_generator import get_image_generator
from app.schemas.image_generation import (
    ImageGenerationRequest,
    CharacterGenerationRequest,
    BackgroundGenerationRequest,
    ImageGenerationResponse,
)
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/image-generation", tags=["image-generation"])


@router.post("/generate", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """
    Generate images from text prompt using Stable Diffusion XL.
    
    Args:
        request: Image generation parameters
        
    Returns:
        Generated image paths
        
    Raises:
        ImageGenerationException: If generation fails
    """
    logger.info(
        f"Generating {request.num_images} image(s)",
        extra={"prompt_length": len(request.prompt), "seed": request.seed},
    )
    
    generator = get_image_generator()
    
    images = generator.generate_image(
        prompt=request.prompt,
        negative_prompt=request.negative_prompt,
        width=request.width,
        height=request.height,
        num_inference_steps=request.num_inference_steps,
        guidance_scale=request.guidance_scale,
        seed=request.seed,
        num_images=request.num_images,
    )
    
    # Save images
    image_paths = []
    for i, image in enumerate(images):
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(settings.assets_path, filename)
        generator.save_image(image, filepath)
        image_paths.append(filepath)
    
    return ImageGenerationResponse(
        image_paths=image_paths,
        message=f"Successfully generated {len(images)} image(s)",
        seed=request.seed,
    )


@router.post("/generate-character", response_model=ImageGenerationResponse)
async def generate_character(request: CharacterGenerationRequest):
    """
    Generate character image with consistency support.
    
    Args:
        request: Character generation parameters
        
    Returns:
        Generated character image path
        
    Raises:
        ImageGenerationException: If generation fails
    """
    logger.info(
        f"Generating character: {request.character_name}",
        extra={"pose": request.pose, "expression": request.expression},
    )
    
    generator = get_image_generator()
    
    image = generator.generate_character(
        prompt=request.prompt,
        character_name=request.character_name,
        lora_path=request.lora_path,
        pose=request.pose,
        expression=request.expression,
        negative_prompt=request.negative_prompt,
        width=request.width,
        height=request.height,
        num_inference_steps=request.num_inference_steps,
        guidance_scale=request.guidance_scale,
        seed=request.seed,
    )
    
    # Save image
    filename = f"char_{request.character_name}_{uuid.uuid4()}.png"
    filepath = os.path.join(settings.assets_path, filename)
    generator.save_image(image, filepath)
    
    return ImageGenerationResponse(
        image_paths=[filepath],
        message=f"Successfully generated character: {request.character_name}",
        seed=request.seed,
    )


@router.post("/generate-background", response_model=ImageGenerationResponse)
async def generate_background(request: BackgroundGenerationRequest):
    """
    Generate background/environment image.
    
    Args:
        request: Background generation parameters
        
    Returns:
        Generated background image path
        
    Raises:
        ImageGenerationException: If generation fails
    """
    logger.info(
        f"Generating background",
        extra={
            "style": request.style,
            "time": request.time_of_day,
            "weather": request.weather,
        },
    )
    
    generator = get_image_generator()
    
    image = generator.generate_background(
        description=request.description,
        style=request.style,
        time_of_day=request.time_of_day,
        weather=request.weather,
        width=request.width,
        height=request.height,
        num_inference_steps=request.num_inference_steps,
        guidance_scale=request.guidance_scale,
        seed=request.seed,
    )
    
    # Save image
    filename = f"bg_{uuid.uuid4()}.png"
    filepath = os.path.join(settings.assets_path, filename)
    generator.save_image(image, filepath)
    
    return ImageGenerationResponse(
        image_paths=[filepath],
        message="Successfully generated background",
        seed=request.seed,
    )


@router.get("/image/{filename}")
async def get_image(filename: str):
    """
    Retrieve generated image file.
    
    Args:
        filename: Image filename
        
    Returns:
        Image file
    """
    filepath = os.path.join(settings.assets_path, filename)
    
    if not os.path.exists(filepath):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(filepath, media_type="image/png")
