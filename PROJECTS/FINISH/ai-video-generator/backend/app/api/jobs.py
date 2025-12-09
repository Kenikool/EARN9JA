"""Generation job API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, status, Query, Path
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.job_service import JobService
from app.models.generation_job import JobStatus
from app.schemas.job import (
    JobResponse,
    JobListResponse,
    JobCancelResponse,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str = Path(..., description="Job UUID"),
    db: Session = Depends(get_db),
):
    """
    Get a specific generation job by ID.
    
    Args:
        job_id: Job UUID
        db: Database session
        
    Returns:
        Job details including status and progress
        
    Raises:
        ResourceNotFoundException: If job not found
    """
    logger.debug(f"Fetching job: {job_id}")
    
    job = JobService.get_job(db, job_id)
    return job


@router.get("", response_model=JobListResponse)
async def list_jobs(
    project_id: str = Query(..., description="Project UUID"),
    status_filter: Optional[JobStatus] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
):
    """
    List all jobs for a project.
    
    Args:
        project_id: Project UUID
        status_filter: Optional status filter
        db: Database session
        
    Returns:
        List of generation jobs
    """
    logger.debug(
        f"Listing jobs for project: {project_id}",
        extra={"project_id": project_id, "status_filter": status_filter},
    )
    
    jobs = JobService.get_project_jobs(db, project_id, status_filter)
    
    return JobListResponse(
        jobs=jobs,
        total=len(jobs),
    )


@router.post("/{job_id}/cancel", response_model=JobCancelResponse)
async def cancel_job(
    job_id: str = Path(..., description="Job UUID"),
    db: Session = Depends(get_db),
):
    """
    Cancel a running or queued generation job.
    
    Args:
        job_id: Job UUID
        db: Database session
        
    Returns:
        Cancellation confirmation
        
    Raises:
        ResourceNotFoundException: If job not found
        ValidationException: If job cannot be cancelled
    """
    logger.info(f"Cancelling job: {job_id}")
    
    job = JobService.cancel_job(db, job_id)
    
    return JobCancelResponse(
        message="Job cancelled successfully",
        job_id=job.id,
        status=job.status,
    )
