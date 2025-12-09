"""Job management service for tracking generation jobs."""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models import GenerationJob, Project
from app.models.generation_job import JobType, JobStatus
from app.exceptions import ResourceNotFoundException, ValidationException
from app.utils.logger import get_logger

logger = get_logger(__name__)


class JobService:
    """Service for managing generation jobs."""
    
    @staticmethod
    def create_job(
        db: Session,
        project_id: str,
        job_type: JobType,
        celery_task_id: Optional[str] = None,
    ) -> GenerationJob:
        """
        Create a new generation job.
        
        Args:
            db: Database session
            project_id: Project UUID
            job_type: Type of generation job
            celery_task_id: Optional Celery task ID
            
        Returns:
            Created generation job
            
        Raises:
            ResourceNotFoundException: If project not found
            ValidationException: If job creation fails
        """
        logger.info(
            f"Creating job for project: {project_id}",
            extra={"project_id": project_id, "job_type": job_type.value},
        )
        
        # Verify project exists
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ResourceNotFoundException("Project", project_id)
        
        try:
            job = GenerationJob(
                id=str(uuid.uuid4()),
                project_id=project_id,
                job_type=job_type,
                status=JobStatus.QUEUED,
                progress=0.0,
                celery_task_id=celery_task_id,
            )
            
            db.add(job)
            db.commit()
            db.refresh(job)
            
            logger.info(
                f"Job created: {job.id}",
                extra={"job_id": job.id, "project_id": project_id},
            )
            
            return job
            
        except SQLAlchemyError as e:
            logger.error(f"Failed to create job: {str(e)}")
            db.rollback()
            raise ValidationException("Failed to create job", details={"error": str(e)})
    
    @staticmethod
    def get_job(db: Session, job_id: str) -> GenerationJob:
        """
        Get a generation job by ID.
        
        Args:
            db: Database session
            job_id: Job UUID
            
        Returns:
            Generation job
            
        Raises:
            ResourceNotFoundException: If job not found
        """
        job = db.query(GenerationJob).filter(GenerationJob.id == job_id).first()
        
        if not job:
            raise ResourceNotFoundException("GenerationJob", job_id)
        
        return job
    
    @staticmethod
    def update_job_status(
        db: Session,
        job_id: str,
        status: JobStatus,
        progress: Optional[float] = None,
        current_stage: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> GenerationJob:
        """
        Update job status and progress.
        
        Args:
            db: Database session
            job_id: Job UUID
            status: New job status
            progress: Optional progress percentage (0-100)
            current_stage: Optional current processing stage
            error_message: Optional error message if failed
            
        Returns:
            Updated generation job
            
        Raises:
            ResourceNotFoundException: If job not found
            ValidationException: If update fails
        """
        logger.info(
            f"Updating job status: {job_id}",
            extra={
                "job_id": job_id,
                "status": status.value,
                "progress": progress,
                "stage": current_stage,
            },
        )
        
        job = JobService.get_job(db, job_id)
        
        try:
            job.status = status
            
            if progress is not None:
                job.progress = max(0.0, min(100.0, progress))  # Clamp to 0-100
            
            if current_stage is not None:
                job.current_stage = current_stage
            
            if error_message is not None:
                job.error_message = error_message
            
            # Set timestamps
            if status == JobStatus.PROCESSING and not job.started_at:
                job.started_at = datetime.utcnow()
            
            if status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]:
                job.completed_at = datetime.utcnow()
                job.progress = 100.0 if status == JobStatus.COMPLETED else job.progress
            
            db.commit()
            db.refresh(job)
            
            logger.info(
                f"Job status updated: {job_id}",
                extra={"job_id": job_id, "status": status.value},
            )
            
            return job
            
        except SQLAlchemyError as e:
            logger.error(f"Failed to update job: {str(e)}")
            db.rollback()
            raise ValidationException("Failed to update job", details={"error": str(e)})
    
    @staticmethod
    def update_job_progress(
        db: Session,
        job_id: str,
        progress: float,
        current_stage: str,
    ) -> GenerationJob:
        """
        Update job progress.
        
        Args:
            db: Database session
            job_id: Job UUID
            progress: Progress percentage (0-100)
            current_stage: Current processing stage
            
        Returns:
            Updated generation job
        """
        return JobService.update_job_status(
            db=db,
            job_id=job_id,
            status=JobStatus.PROCESSING,
            progress=progress,
            current_stage=current_stage,
        )
    
    @staticmethod
    def mark_job_completed(db: Session, job_id: str) -> GenerationJob:
        """
        Mark job as completed.
        
        Args:
            db: Database session
            job_id: Job UUID
            
        Returns:
            Updated generation job
        """
        return JobService.update_job_status(
            db=db,
            job_id=job_id,
            status=JobStatus.COMPLETED,
            progress=100.0,
            current_stage="Completed",
        )
    
    @staticmethod
    def mark_job_failed(
        db: Session,
        job_id: str,
        error_message: str,
    ) -> GenerationJob:
        """
        Mark job as failed.
        
        Args:
            db: Database session
            job_id: Job UUID
            error_message: Error message
            
        Returns:
            Updated generation job
        """
        return JobService.update_job_status(
            db=db,
            job_id=job_id,
            status=JobStatus.FAILED,
            error_message=error_message,
            current_stage="Failed",
        )
    
    @staticmethod
    def cancel_job(db: Session, job_id: str) -> GenerationJob:
        """
        Cancel a job.
        
        Args:
            db: Database session
            job_id: Job UUID
            
        Returns:
            Updated generation job
            
        Raises:
            ValidationException: If job cannot be cancelled
        """
        job = JobService.get_job(db, job_id)
        
        # Can only cancel queued or processing jobs
        if job.status not in [JobStatus.QUEUED, JobStatus.PROCESSING]:
            raise ValidationException(
                f"Cannot cancel job in {job.status.value} status",
                details={"job_id": job_id, "current_status": job.status.value},
            )
        
        logger.info(f"Cancelling job: {job_id}")
        
        # TODO: Revoke Celery task if it exists
        # if job.celery_task_id:
        #     celery_app.control.revoke(job.celery_task_id, terminate=True)
        
        return JobService.update_job_status(
            db=db,
            job_id=job_id,
            status=JobStatus.CANCELLED,
            current_stage="Cancelled",
        )
    
    @staticmethod
    def get_project_jobs(
        db: Session,
        project_id: str,
        status_filter: Optional[JobStatus] = None,
    ) -> list[GenerationJob]:
        """
        Get all jobs for a project.
        
        Args:
            db: Database session
            project_id: Project UUID
            status_filter: Optional status filter
            
        Returns:
            List of generation jobs
        """
        query = db.query(GenerationJob).filter(GenerationJob.project_id == project_id)
        
        if status_filter:
            query = query.filter(GenerationJob.status == status_filter)
        
        return query.order_by(GenerationJob.started_at.desc()).all()
