"""Job schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.generation_job import JobType, JobStatus


class JobResponse(BaseModel):
    """Schema for job response."""
    
    id: str
    project_id: str
    job_type: JobType
    status: JobStatus
    progress: float
    current_stage: Optional[str] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    celery_task_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    """Schema for job list response."""
    
    jobs: list[JobResponse]
    total: int


class JobCancelResponse(BaseModel):
    """Schema for job cancellation response."""
    
    message: str
    job_id: str
    status: JobStatus
