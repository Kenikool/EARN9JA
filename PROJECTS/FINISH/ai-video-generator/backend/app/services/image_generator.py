"""Image generation service using Stable Diffusion."""

from __future__ import annotations

import os
from typing import Optional, List, Tuple, TYPE_CHECKING, Any

from app.config import settings
from app.exceptions import ImageGenerationException
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Lazy imports for AI libraries
try:
    import torch
    from PIL import Image
    import numpy as np
    from diffusers import (
        StableDiffusionXLPipeline,
        StableDiffusionXLImg2ImgPipeline,
        DPMSolverMultistepScheduler,
    )
    from diffusers.loaders import LoraLoaderMixin
    AI_LIBRARIES_AVAILABLE = True
except ImportError as e:
    logger.warning(f"AI libraries not available: {e}. Image generation will not work.")
    AI_LIBRARIES_AVAILABLE = False
    if TYPE_CHECKING:
        from PIL import Image
        import torch
        import numpy as np
    else:
        torch = None
        Image = None
        np = None
        StableDiffusionXLPipeline = None
        StableDiffusionXLImg2ImgPipeline = None
        DPMSolverMultistepScheduler = None
        LoraLoaderMixin = None


class ImageGenerator:
    """Service for generating images using Stable Diffusion XL."""
    
    def __init__(self):
        """Initialize image generator."""
        if not AI_LIBRARIES_AVAILABLE:
            logger.warning("Image Generator initialized without AI libraries")
            self.device = "cpu"
            self.dtype = None
            self.pipeline = None
            self.img2img_pipeline = None
            return
            
        self.device = self._get_device()
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.pipeline: Optional[StableDiffusionXLPipeline] = None
        self.img2img_pipeline: Optional[StableDiffusionXLImg2ImgPipeline] = None
        self.loaded_loras: dict = {}
        
        logger.info(f"Image generator initialized on device: {self.device}")
    
    def _check_availability(self):
        """Check if AI libraries are available."""
        if not AI_LIBRARIES_AVAILABLE:
            raise ImageGenerationException(
                "AI libraries not installed. Install with: pip install torch diffusers transformers",
                "AI_LIBRARIES_NOT_AVAILABLE"
            )
    
    def _get_device(self) -> str:
        """Determine device to use (cuda/cpu)."""
        if not AI_LIBRARIES_AVAILABLE:
            return "cpu"
        if settings.use_gpu and torch.cuda.is_available():
            return "cuda"
        return "cpu"
    
    def _load_pipeline(self):
        """Load Stable Diffusion XL pipeline."""
        if self.pipeline is not None:
            return
        
        logger.info(f"Loading Stable Diffusion XL model: {settings.default_image_model}")
        
        try:
            self.pipeline = StableDiffusionXLPipeline.from_pretrained(
                settings.default_image_model,
                torch_dtype=self.dtype,
                use_safetensors=True,
                variant="fp16" if self.dtype == torch.float16 else None,
            )
            
            # Optimize pipeline
            self.pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                self.pipeline.scheduler.config
            )
            
            self.pipeline = self.pipeline.to(self.device)
            
            # Enable memory optimizations
            if self.device == "cuda":
                self.pipeline.enable_model_cpu_offload()
                self.pipeline.enable_vae_slicing()
                self.pipeline.enable_vae_tiling()
            
            logger.info("Stable Diffusion XL pipeline loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load SD pipeline: {str(e)}")
            raise ImageGenerationException(
                "Failed to load image generation model",
                details={"error": str(e)},
            )
    
    def _load_img2img_pipeline(self):
        """Load img2img pipeline for image-to-image generation."""
        if self.img2img_pipeline is not None:
            return
        
        logger.info("Loading img2img pipeline")
        
        try:
            self.img2img_pipeline = StableDiffusionXLImg2ImgPipeline.from_pretrained(
                settings.default_image_model,
                torch_dtype=self.dtype,
                use_safetensors=True,
                variant="fp16" if self.dtype == torch.float16 else None,
            )
            
            self.img2img_pipeline = self.img2img_pipeline.to(self.device)
            
            if self.device == "cuda":
                self.img2img_pipeline.enable_model_cpu_offload()
                self.img2img_pipeline.enable_vae_slicing()
            
            logger.info("Img2img pipeline loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load img2img pipeline: {str(e)}")
            raise ImageGenerationException(
                "Failed to load img2img pipeline",
                details={"error": str(e)},
            )
    
    def generate_image(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1024,
        height: int = 1024,
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
        num_images: int = 1,
    ) -> List[Any]:
        """
        Generate images from text prompt.
        
        Args:
            prompt: Text prompt for image generation
            negative_prompt: Negative prompt (things to avoid)
            width: Image width
            height: Image height
            num_inference_steps: Number of denoising steps
            guidance_scale: Guidance scale for prompt adherence
            seed: Random seed for reproducibility
            num_images: Number of images to generate
            
        Returns:
            List of generated PIL Images
        
        Raises:
            ImageGenerationException: If AI libraries not available or generation fails
        """
        self._check_availability()
        self._load_pipeline()
        
        logger.info(
            f"Generating image",
            extra={
                "prompt_length": len(prompt),
                "size": f"{width}x{height}",
                "steps": num_inference_steps,
                "seed": seed,
            },
        )
        
        try:
            # Set seed for reproducibility
            generator = None
            if seed is not None:
                generator = torch.Generator(device=self.device).manual_seed(seed)
            
            # Generate images
            output = self.pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                num_images_per_prompt=num_images,
                generator=generator,
            )
            
            images = output.images
            
            logger.info(f"Generated {len(images)} images successfully")
            
            return images
            
        except torch.cuda.OutOfMemoryError:
            logger.error("GPU out of memory during image generation")
            raise ImageGenerationException(
                "GPU out of memory. Try reducing image size or batch size.",
                details={"width": width, "height": height, "num_images": num_images},
            )
        except Exception as e:
            logger.error(f"Image generation failed: {str(e)}")
            raise ImageGenerationException(
                "Failed to generate image",
                details={"error": str(e)},
            )
    
    def generate_character(
        self,
        prompt: str,
        character_name: str,
        lora_path: Optional[str] = None,
        pose: str = "standing",
        expression: str = "neutral",
        **kwargs,
    ) -> Any:
        """
        Generate character image with consistency.
        
        Args:
            prompt: Base prompt for character
            character_name: Character name for consistency
            lora_path: Path to character LoRA weights
            pose: Character pose
            expression: Facial expression
            **kwargs: Additional generation parameters
            
        Returns:
            Generated character image
        """
        self._load_pipeline()
        
        # Load LoRA if provided
        if lora_path and lora_path not in self.loaded_loras:
            self._load_lora(lora_path, character_name)
        
        # Enhance prompt with character details
        enhanced_prompt = f"{prompt}, {pose} pose, {expression} expression, character portrait, detailed face"
        
        logger.info(
            f"Generating character: {character_name}",
            extra={"pose": pose, "expression": expression},
        )
        
        images = self.generate_image(
            prompt=enhanced_prompt,
            num_images=1,
            **kwargs,
        )
        
        return images[0]
    
    def generate_background(
        self,
        description: str,
        style: str = "realistic",
        time_of_day: str = "day",
        weather: str = "clear",
        **kwargs,
    ) -> Any:
        """
        Generate background/environment image.
        
        Args:
            description: Environment description
            style: Visual style
            time_of_day: Time of day (day, night, sunset, etc.)
            weather: Weather conditions
            **kwargs: Additional generation parameters
            
        Returns:
            Generated background image
        """
        # Enhance prompt with environment details
        enhanced_prompt = (
            f"{description}, {style} style, {time_of_day}, {weather} weather, "
            f"environment, landscape, detailed background, high quality"
        )
        
        negative_prompt = "people, characters, humans, animals, text, watermark"
        
        logger.info(
            f"Generating background",
            extra={"style": style, "time": time_of_day, "weather": weather},
        )
        
        images = self.generate_image(
            prompt=enhanced_prompt,
            negative_prompt=negative_prompt,
            num_images=1,
            **kwargs,
        )
        
        return images[0]
    
    def composite_scene(
        self,
        character_img: Any,
        background_img: Any,
        position: Tuple[int, int] = None,
        scale: float = 1.0,
    ) -> Any:
        """
        Composite character onto background.
        
        Args:
            character_img: Character image (with transparency if possible)
            background_img: Background image
            position: Position to place character (x, y)
            scale: Scale factor for character
            
        Returns:
            Composited image
        """
        logger.info("Compositing character onto background")
        
        try:
            # Resize background to standard size
            bg = background_img.copy()
            
            # Scale character if needed
            if scale != 1.0:
                new_size = (
                    int(character_img.width * scale),
                    int(character_img.height * scale),
                )
                character_img = character_img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Calculate position
            if position is None:
                # Center character
                position = (
                    (bg.width - character_img.width) // 2,
                    (bg.height - character_img.height) // 2,
                )
            
            # Composite
            if character_img.mode == 'RGBA':
                bg.paste(character_img, position, character_img)
            else:
                bg.paste(character_img, position)
            
            logger.info("Scene composited successfully")
            
            return bg
            
        except Exception as e:
            logger.error(f"Scene composition failed: {str(e)}")
            raise ImageGenerationException(
                "Failed to composite scene",
                details={"error": str(e)},
            )
    
    def img2img(
        self,
        image: Any,
        prompt: str,
        strength: float = 0.75,
        **kwargs,
    ) -> Any:
        """
        Generate image from image using img2img.
        
        Args:
            image: Input image
            prompt: Text prompt
            strength: Transformation strength (0-1)
            **kwargs: Additional generation parameters
            
        Returns:
            Generated image
        """
        self._load_img2img_pipeline()
        
        logger.info(f"Running img2img with strength {strength}")
        
        try:
            output = self.img2img_pipeline(
                prompt=prompt,
                image=image,
                strength=strength,
                **kwargs,
            )
            
            return output.images[0]
            
        except Exception as e:
            logger.error(f"Img2img generation failed: {str(e)}")
            raise ImageGenerationException(
                "Failed to generate image from image",
                details={"error": str(e)},
            )
    
    def _load_lora(self, lora_path: str, adapter_name: str):
        """Load LoRA weights for character consistency."""
        logger.info(f"Loading LoRA: {adapter_name}")
        
        try:
            if hasattr(self.pipeline, 'load_lora_weights'):
                self.pipeline.load_lora_weights(lora_path, adapter_name=adapter_name)
                self.loaded_loras[lora_path] = adapter_name
                logger.info(f"LoRA loaded: {adapter_name}")
        except Exception as e:
            logger.error(f"Failed to load LoRA: {str(e)}")
            raise ImageGenerationException(
                "Failed to load character LoRA",
                details={"error": str(e), "lora_path": lora_path},
            )
    
    def save_image(self, image: Any, path: str) -> str:
        """
        Save image to file.
        
        Args:
            image: PIL Image
            path: File path
            
        Returns:
            Saved file path
        """
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            image.save(path, quality=95)
            logger.info(f"Image saved: {path}")
            return path
        except Exception as e:
            logger.error(f"Failed to save image: {str(e)}")
            raise ImageGenerationException(
                "Failed to save image",
                details={"error": str(e), "path": path},
            )
    
    def unload_model(self):
        """Unload model from memory."""
        logger.info("Unloading image generation models")
        
        if self.pipeline is not None:
            del self.pipeline
            self.pipeline = None
        
        if self.img2img_pipeline is not None:
            del self.img2img_pipeline
            self.img2img_pipeline = None
        
        self.loaded_loras.clear()
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("Models unloaded")


# Global instance
_image_generator: Optional[ImageGenerator] = None


def get_image_generator() -> ImageGenerator:
    """Get or create global image generator instance."""
    global _image_generator
    if _image_generator is None:
        _image_generator = ImageGenerator()
    return _image_generator
