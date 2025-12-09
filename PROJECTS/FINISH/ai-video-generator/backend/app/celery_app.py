"""Celery application configuration."""

from celery import Celery
from celery.signals import task_prerun, task_postrun, task_failure, task_success
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Create Celery app
celery_app = Celery(
    "video_generator",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.tasks"],
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task execution settings
    task_track_started=True,
    task_time_limit=settings.job_timeout,
    task_soft_time_limit=settings.job_timeout - 60,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    result_persistent=True,
    
    # Worker settings
    worker_prefetch_multiplier=1,  # One task at a time for GPU-intensive work
    worker_max_tasks_per_child=10,  # Restart worker after 10 tasks to prevent memory leaks
    worker_disable_rate_limits=False,
    
    # Broker settings
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    
    # Task routing
    task_routes={
        "app.tasks.video_generation.*": {"queue": "video_generation"},
        "app.tasks.image_generation.*": {"queue": "image_generation"},
        "app.tasks.audio_generation.*": {"queue": "audio_generation"},
    },
    
    # Task priority
    task_default_priority=5,
    task_inherit_parent_priority=True,
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
)


# Celery signals for logging and monitoring
@task_prerun.connect
def task_prerun_handler(task_id, task, args, kwargs, **extra):
    """Log when a task starts."""
    logger.info(
        f"Task started: {task.name}",
        extra={
            "task_id": task_id,
            "task_name": task.name,
            "args": str(args)[:100],  # Limit log size
        },
    )


@task_postrun.connect
def task_postrun_handler(task_id, task, args, kwargs, retval, **extra):
    """Log when a task completes."""
    logger.info(
        f"Task completed: {task.name}",
        extra={
            "task_id": task_id,
            "task_name": task.name,
            "state": extra.get("state", "SUCCESS"),
        },
    )


@task_failure.connect
def task_failure_handler(task_id, exception, args, kwargs, traceback, einfo, **extra):
    """Log when a task fails."""
    logger.error(
        f"Task failed: {extra.get('sender', 'unknown')}",
        extra={
            "task_id": task_id,
            "exception": str(exception),
            "traceback": str(traceback)[:500],  # Limit log size
        },
    )


@task_success.connect
def task_success_handler(sender, result, **extra):
    """Log when a task succeeds."""
    logger.debug(
        f"Task succeeded: {sender.name}",
        extra={
            "task_name": sender.name,
            "result_type": type(result).__name__,
        },
    )


# Task base class with common functionality
class BaseTask(celery_app.Task):
    """Base task class with common functionality."""
    
    autoretry_for = (Exception,)
    retry_kwargs = {"max_retries": 3, "countdown": 60}
    retry_backoff = True
    retry_backoff_max = 600
    retry_jitter = True
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure."""
        logger.error(
            f"Task {self.name} failed",
            extra={
                "task_id": task_id,
                "exception": str(exc),
                "args": str(args)[:100],
            },
        )
        super().on_failure(exc, task_id, args, kwargs, einfo)
    
    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Handle task retry."""
        logger.warning(
            f"Task {self.name} retrying",
            extra={
                "task_id": task_id,
                "exception": str(exc),
                "retry_count": self.request.retries,
            },
        )
        super().on_retry(exc, task_id, args, kwargs, einfo)


# Export celery app
__all__ = ["celery_app", "BaseTask"]
