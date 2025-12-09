"""Script parsing API endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.script_parser import get_script_parser
from app.schemas.script_parser import (
    ScriptParseRequest,
    ScriptParseResponse,
    GeneratePromptsRequest,
    GeneratePromptsResponse,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/script-parser", tags=["script-parser"])


@router.post("/parse", response_model=ScriptParseResponse, status_code=status.HTTP_200_OK)
async def parse_script(
    request: ScriptParseRequest,
    db: Session = Depends(get_db),
):
    """
    Parse a video script and extract scenes and characters.
    
    This endpoint uses an LLM (Ollama) to analyze the script and automatically
    create scene breakdowns and character profiles.
    
    Args:
        request: Script parse request with project_id and script
        db: Database session
        
    Returns:
        Parsed scenes and characters
        
    Raises:
        ResourceNotFoundException: If project not found
        ScriptParsingException: If parsing fails
    """
    logger.info(
        f"Parsing script for project: {request.project_id}",
        extra={"project_id": request.project_id},
    )
    
    parser = get_script_parser()
    result = await parser.parse_script(
        db=db,
        project_id=request.project_id,
        script=request.script,
    )
    
    return ScriptParseResponse(
        scenes=[
            {
                "id": scene.id,
                "scene_number": scene.scene_number,
                "description": scene.description,
                "dialogue": scene.dialogue,
                "duration": scene.duration,
            }
            for scene in result["scenes"]
        ],
        characters=[
            {
                "id": char.id,
                "name": char.name,
                "description": char.description,
            }
            for char in result["characters"]
        ],
        message=f"Successfully parsed {len(result['scenes'])} scenes and {len(result['characters'])} characters",
    )


@router.post("/generate-prompts", response_model=GeneratePromptsResponse)
async def generate_prompts(
    request: GeneratePromptsRequest,
    db: Session = Depends(get_db),
):
    """
    Generate image and motion prompts for scenes.
    
    This endpoint generates detailed prompts for image generation and animation
    based on scene descriptions and character information.
    
    Args:
        request: Generate prompts request
        db: Database session
        
    Returns:
        Generated prompts for scenes
        
    Raises:
        ResourceNotFoundException: If project or scene not found
        ScriptParsingException: If prompt generation fails
    """
    logger.info(
        f"Generating prompts for project: {request.project_id}",
        extra={"project_id": request.project_id},
    )
    
    parser = get_script_parser()
    
    if request.scene_id:
        # Generate for single scene
        prompts = await parser.generate_image_prompts(
            db=db,
            scene_id=request.scene_id,
            character_consistency=request.character_consistency,
        )
        
        return GeneratePromptsResponse(
            prompts=[
                {
                    "scene_id": request.scene_id,
                    "image_prompt": prompts["image_prompt"],
                    "motion_prompt": prompts["motion_prompt"],
                    "negative_prompt": prompts.get("negative_prompt", ""),
                }
            ],
            message="Prompts generated successfully",
        )
    else:
        # Generate for all scenes in project
        scenes = await parser.generate_all_scene_prompts(
            db=db,
            project_id=request.project_id,
        )
        
        return GeneratePromptsResponse(
            prompts=[
                {
                    "scene_id": scene.id,
                    "image_prompt": scene.image_prompt or "",
                    "motion_prompt": scene.motion_prompt or "",
                    "negative_prompt": "",
                }
                for scene in scenes
            ],
            message=f"Generated prompts for {len(scenes)} scenes",
        )
