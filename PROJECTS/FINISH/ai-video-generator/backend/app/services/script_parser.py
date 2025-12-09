"""Script parsing service using Ollama LLM."""

import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.services.ollama_client import get_ollama_client
from app.models import Scene, Character, Project
from app.models.scene import SceneStatus
from app.exceptions import ScriptParsingException, ResourceNotFoundException
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ScriptParser:
    """Service for parsing video scripts using LLM."""
    
    def __init__(self):
        """Initialize script parser."""
        self.ollama = get_ollama_client()
    
    def _create_parsing_prompt(self, script: str) -> str:
        """
        Create prompt for script parsing.
        
        Args:
            script: Input script text
            
        Returns:
            Formatted prompt for LLM
        """
        return f"""Analyze the following video script and extract structured information.

Script:
{script}

Extract the following information and return as JSON:
1. scenes: Array of scenes, each with:
   - scene_number: Sequential number starting from 1
   - description: Detailed visual description of what happens
   - dialogue: Any spoken dialogue or narration
   - duration: Estimated duration in seconds (default 5.0)
   - setting: Location/environment description
   - action: What actions occur in the scene

2. characters: Array of unique characters mentioned, each with:
   - name: Character name
   - description: Physical appearance and characteristics
   - role: Their role in the story

Return ONLY valid JSON in this exact format:
{{
  "scenes": [
    {{
      "scene_number": 1,
      "description": "...",
      "dialogue": "...",
      "duration": 5.0,
      "setting": "...",
      "action": "..."
    }}
  ],
  "characters": [
    {{
      "name": "...",
      "description": "...",
      "role": "..."
    }}
  ]
}}"""
    
    async def parse_script(
        self,
        db: Session,
        project_id: str,
        script: str,
    ) -> Dict[str, Any]:
        """
        Parse script and create scenes and characters.
        
        Args:
            db: Database session
            project_id: Project UUID
            script: Script text to parse
            
        Returns:
            Dictionary with created scenes and characters
            
        Raises:
            ResourceNotFoundException: If project not found
            ScriptParsingException: If parsing fails
        """
        logger.info(
            f"Parsing script for project: {project_id}",
            extra={"project_id": project_id, "script_length": len(script)},
        )
        
        # Verify project exists
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ResourceNotFoundException("Project", project_id)
        
        try:
            # Generate parsing prompt
            prompt = self._create_parsing_prompt(script)
            
            # Get structured data from LLM
            system_prompt = "You are a professional script analyzer for video production. Extract structured information accurately."
            
            parsed_data = await self.ollama.generate_json(
                prompt=prompt,
                system=system_prompt,
                temperature=0.3,  # Lower temperature for more consistent parsing
            )
            
            # Validate parsed data
            if "scenes" not in parsed_data or "characters" not in parsed_data:
                raise ScriptParsingException(
                    "Invalid parsed data structure",
                    details={"missing_keys": ["scenes", "characters"]},
                )
            
            # Create characters
            created_characters = []
            for char_data in parsed_data.get("characters", []):
                character = Character(
                    id=str(uuid.uuid4()),
                    project_id=project_id,
                    name=char_data.get("name", "Unknown"),
                    description=char_data.get("description", ""),
                    appearance_params={
                        "role": char_data.get("role", ""),
                    },
                )
                db.add(character)
                created_characters.append(character)
            
            # Create scenes
            created_scenes = []
            for scene_data in parsed_data.get("scenes", []):
                scene = Scene(
                    id=str(uuid.uuid4()),
                    project_id=project_id,
                    scene_number=scene_data.get("scene_number", len(created_scenes) + 1),
                    description=scene_data.get("description", ""),
                    dialogue=scene_data.get("dialogue"),
                    duration=float(scene_data.get("duration", 5.0)),
                    status=SceneStatus.PENDING,
                )
                db.add(scene)
                created_scenes.append(scene)
            
            db.commit()
            
            logger.info(
                f"Script parsed successfully",
                extra={
                    "project_id": project_id,
                    "scenes_created": len(created_scenes),
                    "characters_created": len(created_characters),
                },
            )
            
            return {
                "scenes": created_scenes,
                "characters": created_characters,
                "raw_data": parsed_data,
            }
        
        except ScriptParsingException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error parsing script: {str(e)}")
            raise ScriptParsingException(
                "Failed to parse script",
                details={"error": str(e)},
            )
    
    async def generate_image_prompts(
        self,
        db: Session,
        scene_id: str,
        character_consistency: bool = True,
    ) -> Dict[str, str]:
        """
        Generate detailed image prompts for a scene.
        
        Args:
            db: Database session
            scene_id: Scene UUID
            character_consistency: Whether to maintain character consistency
            
        Returns:
            Dictionary with image_prompt and motion_prompt
            
        Raises:
            ResourceNotFoundException: If scene not found
            ScriptParsingException: If prompt generation fails
        """
        logger.info(f"Generating image prompts for scene: {scene_id}")
        
        # Get scene
        scene = db.query(Scene).filter(Scene.id == scene_id).first()
        if not scene:
            raise ResourceNotFoundException("Scene", scene_id)
        
        # Get project and characters
        project = db.query(Project).filter(Project.id == scene.project_id).first()
        characters = db.query(Character).filter(Character.project_id == scene.project_id).all()
        
        try:
            # Create prompt for image generation
            prompt_template = f"""Generate a detailed image generation prompt for this scene:

Scene Description: {scene.description}
Dialogue: {scene.dialogue or "None"}
Duration: {scene.duration} seconds

"""
            
            if characters and character_consistency:
                char_descriptions = "\n".join([
                    f"- {char.name}: {char.description}"
                    for char in characters
                ])
                prompt_template += f"""
Characters in this project:
{char_descriptions}

"""
            
            prompt_template += """Create a detailed Stable Diffusion prompt that:
1. Describes the visual scene in detail
2. Includes lighting, atmosphere, and mood
3. Specifies camera angle and composition
4. Maintains character consistency if characters are present
5. Uses high-quality descriptive keywords

Also create a motion prompt describing how the scene should be animated.

Return as JSON:
{
  "image_prompt": "detailed stable diffusion prompt...",
  "motion_prompt": "description of motion and camera movement...",
  "negative_prompt": "things to avoid in the image..."
}"""
            
            system_prompt = "You are an expert at creating prompts for AI image and video generation."
            
            result = await self.ollama.generate_json(
                prompt=prompt_template,
                system=system_prompt,
                temperature=0.7,
            )
            
            # Update scene with prompts
            scene.image_prompt = result.get("image_prompt", "")
            scene.motion_prompt = result.get("motion_prompt", "")
            
            db.commit()
            
            logger.info(
                f"Image prompts generated for scene: {scene_id}",
                extra={"scene_id": scene_id},
            )
            
            return {
                "image_prompt": scene.image_prompt,
                "motion_prompt": scene.motion_prompt,
                "negative_prompt": result.get("negative_prompt", ""),
            }
        
        except ScriptParsingException:
            raise
        except Exception as e:
            logger.error(f"Failed to generate image prompts: {str(e)}")
            raise ScriptParsingException(
                "Failed to generate image prompts",
                details={"error": str(e), "scene_id": scene_id},
            )
    
    async def generate_all_scene_prompts(
        self,
        db: Session,
        project_id: str,
    ) -> List[Scene]:
        """
        Generate image prompts for all scenes in a project.
        
        Args:
            db: Database session
            project_id: Project UUID
            
        Returns:
            List of updated scenes
            
        Raises:
            ResourceNotFoundException: If project not found
        """
        logger.info(f"Generating prompts for all scenes in project: {project_id}")
        
        # Get all scenes
        scenes = (
            db.query(Scene)
            .filter(Scene.project_id == project_id)
            .order_by(Scene.scene_number)
            .all()
        )
        
        if not scenes:
            logger.warning(f"No scenes found for project: {project_id}")
            return []
        
        # Generate prompts for each scene
        updated_scenes = []
        for scene in scenes:
            try:
                await self.generate_image_prompts(db, scene.id)
                updated_scenes.append(scene)
            except Exception as e:
                logger.error(
                    f"Failed to generate prompts for scene {scene.id}: {str(e)}"
                )
                # Continue with other scenes
                continue
        
        logger.info(
            f"Generated prompts for {len(updated_scenes)}/{len(scenes)} scenes",
            extra={"project_id": project_id},
        )
        
        return updated_scenes


# Global parser instance
_script_parser: ScriptParser = None


def get_script_parser() -> ScriptParser:
    """
    Get or create global script parser instance.
    
    Returns:
        ScriptParser instance
    """
    global _script_parser
    if _script_parser is None:
        _script_parser = ScriptParser()
    return _script_parser
