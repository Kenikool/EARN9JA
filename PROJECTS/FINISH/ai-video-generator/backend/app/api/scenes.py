"""Scene management API endpoints."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Scene, Project
from app.schemas.scene import (
    SceneCreate,
    SceneUpdate,
    SceneResponse,
    SceneListResponse,
    SceneRegenerateRequest,
)

router = APIRouter(prefix="/api/scenes", tags=["scenes"])


@router.post("", response_model=SceneResponse, status_code=status.HTTP_201_CREATED)
async def create_scene(
    scene_data: SceneCreate,
    db: Session = Depends(get_db),
):
    """Create a new scene."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == scene_data.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {scene_data.project_id} not found",
        )
    
    # Check if scene number already exists
    existing_scene = (
        db.query(Scene)
        .filter(
            Scene.project_id == scene_data.project_id,
            Scene.scene_number == scene_data.scene_number,
        )
        .first()
    )
    if existing_scene:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Scene number {scene_data.scene_number} already exists in this project",
        )
    
    # Create scene
    scene = Scene(
        id=str(uuid.uuid4()),
        project_id=scene_data.project_id,
        scene_number=scene_data.scene_number,
        description=scene_data.description,
        dialogue=scene_data.dialogue,
        duration=scene_data.duration,
        image_prompt=scene_data.image_prompt,
        motion_prompt=scene_data.motion_prompt,
    )
    
    db.add(scene)
    db.commit()
    db.refresh(scene)
    
    return scene


@router.get("", response_model=SceneListResponse)
async def list_scenes(
    project_id: str,
    db: Session = Depends(get_db),
):
    """List all scenes for a project."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )
    
    # Get scenes ordered by scene number
    scenes = (
        db.query(Scene)
        .filter(Scene.project_id == project_id)
        .order_by(Scene.scene_number)
        .all()
    )
    
    return SceneListResponse(
        scenes=scenes,
        total=len(scenes),
    )


@router.get("/{scene_id}", response_model=SceneResponse)
async def get_scene(
    scene_id: str,
    db: Session = Depends(get_db),
):
    """Get a specific scene by ID."""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    
    if not scene:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scene with id {scene_id} not found",
        )
    
    return scene


@router.put("/{scene_id}", response_model=SceneResponse)
async def update_scene(
    scene_id: str,
    scene_data: SceneUpdate,
    db: Session = Depends(get_db),
):
    """Update a scene."""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    
    if not scene:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scene with id {scene_id} not found",
        )
    
    # Check if scene number is being changed and if it conflicts
    if scene_data.scene_number and scene_data.scene_number != scene.scene_number:
        existing_scene = (
            db.query(Scene)
            .filter(
                Scene.project_id == scene.project_id,
                Scene.scene_number == scene_data.scene_number,
                Scene.id != scene_id,
            )
            .first()
        )
        if existing_scene:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Scene number {scene_data.scene_number} already exists in this project",
            )
    
    # Update fields
    update_data = scene_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(scene, field, value)
    
    db.commit()
    db.refresh(scene)
    
    return scene


@router.delete("/{scene_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scene(
    scene_id: str,
    db: Session = Depends(get_db),
):
    """Delete a scene."""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    
    if not scene:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scene with id {scene_id} not found",
        )
    
    db.delete(scene)
    db.commit()
    
    return None


@router.post("/{scene_id}/regenerate", response_model=dict)
async def regenerate_scene(
    scene_id: str,
    regenerate_data: SceneRegenerateRequest,
    db: Session = Depends(get_db),
):
    """Regenerate a scene with new parameters."""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    
    if not scene:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scene with id {scene_id} not found",
        )
    
    # Update prompts if provided
    if regenerate_data.image_prompt:
        scene.image_prompt = regenerate_data.image_prompt
    if regenerate_data.motion_prompt:
        scene.motion_prompt = regenerate_data.motion_prompt
    
    # TODO: Trigger Celery task for regeneration (Task 12)
    # For now, just update status to pending
    from app.models.scene import SceneStatus
    scene.status = SceneStatus.PENDING
    
    db.commit()
    db.refresh(scene)
    
    return {
        "message": "Scene regeneration queued",
        "scene_id": scene_id,
        "regenerate_video": regenerate_data.regenerate_video,
        "regenerate_audio": regenerate_data.regenerate_audio,
    }
