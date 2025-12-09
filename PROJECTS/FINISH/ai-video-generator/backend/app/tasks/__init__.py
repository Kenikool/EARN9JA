"""Celery tasks for async video generation."""

from app.tasks.video_generation import (
    generate_video_task,
    generate_scene_task,
    regenerate_asset_task,
    cancel_job_task
)

__all__ = [
    'generate_video_task',
    'generate_scene_task',
    'regenerate_asset_task',
    'cancel_job_task'
]
