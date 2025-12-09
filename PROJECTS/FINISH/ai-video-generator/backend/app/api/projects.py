"""Project management API endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db
from app.models import Project
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
)
from app.exceptions import ResourceNotFoundException, ValidationException
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new video generation project.
    
    Args:
        project_data: Project creation data
        db: Database session
        
    Returns:
        Created project
        
    Raises:
        ValidationException: If project data is invalid
    """
    # TODO: Get user_id from authentication (Task 18)
    user_id = "default_user"
    
    logger.info(f"Creating new project: {project_data.title}", extra={"user_id": user_id})
    
    try:
        # Validate script is not empty
        if not project_data.script.strip():
            raise ValidationException("Script cannot be empty")
        
        # Create project
        project = Project(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=project_data.title,
            script=project_data.script,
            settings=project_data.settings.model_dump() if project_data.settings else None,
        )
        
        db.add(project)
        db.commit()
        db.refresh(project)
        
        logger.info(
            f"Project created successfully: {project.id}",
            extra={"project_id": project.id, "user_id": user_id},
        )
        
        return project
        
    except ValidationException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error creating project: {str(e)}")
        db.rollback()
        raise ValidationException("Failed to create project", details={"error": str(e)})


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
):
    """
    List all projects with pagination and filtering.
    
    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page (max 100)
        status_filter: Optional status filter (draft, processing, completed, failed)
        db: Database session
        
    Returns:
        Paginated list of projects
    """
    # TODO: Filter by authenticated user (Task 18)
    user_id = "default_user"
    
    logger.debug(
        f"Listing projects for user: {user_id}",
        extra={"page": page, "page_size": page_size, "status_filter": status_filter},
    )
    
    try:
        # Build query
        query = db.query(Project).filter(Project.user_id == user_id)
        
        # Apply status filter
        if status_filter:
            query = query.filter(Project.status == status_filter)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        projects = (
            query.order_by(Project.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        
        logger.debug(f"Found {total} projects, returning page {page}")
        
        return ProjectListResponse(
            projects=projects,
            total=total,
            page=page,
            page_size=page_size,
        )
        
    except SQLAlchemyError as e:
        logger.error(f"Database error listing projects: {str(e)}")
        raise ValidationException("Failed to list projects", details={"error": str(e)})


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
):
    """
    Get a specific project by ID.
    
    Args:
        project_id: Project UUID
        db: Database session
        
    Returns:
        Project details
        
    Raises:
        ResourceNotFoundException: If project not found
    """
    logger.debug(f"Fetching project: {project_id}")
    
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        logger.warning(f"Project not found: {project_id}")
        raise ResourceNotFoundException("Project", project_id)
    
    # TODO: Check user ownership (Task 18)
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
):
    """
    Update a project.
    
    Args:
        project_id: Project UUID
        project_data: Project update data
        db: Database session
        
    Returns:
        Updated project
        
    Raises:
        ResourceNotFoundException: If project not found
        ValidationException: If update data is invalid
    """
    logger.info(f"Updating project: {project_id}")
    
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        logger.warning(f"Project not found for update: {project_id}")
        raise ResourceNotFoundException("Project", project_id)
    
    # TODO: Check user ownership (Task 18)
    
    try:
        # Update fields
        update_data = project_data.model_dump(exclude_unset=True)
        
        # Validate script if being updated
        if "script" in update_data and not update_data["script"].strip():
            raise ValidationException("Script cannot be empty")
        
        if "settings" in update_data and update_data["settings"]:
            update_data["settings"] = update_data["settings"].model_dump()
        
        for field, value in update_data.items():
            setattr(project, field, value)
        
        db.commit()
        db.refresh(project)
        
        logger.info(f"Project updated successfully: {project_id}")
        
        return project
        
    except ValidationException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error updating project: {str(e)}")
        db.rollback()
        raise ValidationException("Failed to update project", details={"error": str(e)})


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a project and all associated data.
    
    This will cascade delete all scenes, characters, assets, and generation jobs.
    
    Args:
        project_id: Project UUID
        db: Database session
        
    Raises:
        ResourceNotFoundException: If project not found
    """
    logger.info(f"Deleting project: {project_id}")
    
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        logger.warning(f"Project not found for deletion: {project_id}")
        raise ResourceNotFoundException("Project", project_id)
    
    # TODO: Check user ownership (Task 18)
    
    try:
        db.delete(project)
        db.commit()
        
        logger.info(f"Project deleted successfully: {project_id}")
        
        return None
        
    except SQLAlchemyError as e:
        logger.error(f"Database error deleting project: {str(e)}")
        db.rollback()
        raise ValidationException("Failed to delete project", details={"error": str(e)})


@router.post("/{project_id}/generate")
async def generate_video(
    project_id: str,
    settings: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """
    Start video generation for a project

    Args:
        project_id: Project ID
        settings: Optional generation settings (resolution, aspect_ratio, etc.)
        db: Database session

    Returns:
        Job information
    """
    from app.models.generation_job import GenerationJob, JobStatus, JobType
    from app.tasks.video_generation import generate_video_task
    import uuid

    logger.info(f"Starting video generation for project {project_id}")

    # Get project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ResourceNotFoundException(f"Project not found: {project_id}")

    # Create generation job
    job = GenerationJob(
        id=str(uuid.uuid4()),
        project_id=project_id,
        job_type=JobType.FULL_VIDEO,
        status=JobStatus.QUEUED,
        progress=0.0
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Start Celery task
    task = generate_video_task.apply_async(
        kwargs={
            'project_id': project_id,
            'job_id': job.id,
            'settings': settings or {}
        }
    )

    # Update job with Celery task ID
    job.celery_task_id = task.id
    db.commit()

    logger.info(f"Video generation job created: {job.id}")

    return {
        'job_id': job.id,
        'project_id': project_id,
        'status': job.status.value,
        'celery_task_id': task.id
    }
