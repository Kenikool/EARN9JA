"""
Video Generation Tasks

Celery tasks for orchestrating the complete video generation pipeline.
"""

import uuid
from typing import List, Dict, Any, Optional
from celery import Task, chain, group
from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models.project import Project, ProjectStatus
from app.models.scene import Scene, SceneStatus
from app.models.generation_job import GenerationJob, JobStatus, JobType
from app.models.asset import Asset, AssetType, SceneAsset, AssetRole
from app.models.video_file import VideoFile
from app.services.script_parser import get_script_parser
from app.services.image_generator import ImageGeneratorService
from app.services.animation_engine import AnimationEngineService
from app.services.voice_synthesizer import VoiceSynthesizerService
from app.services.music_generator import MusicGeneratorService
from app.services.lip_sync_engine import LipSyncEngineService
from app.services.video_assembler import VideoAssemblerService, OutputConfig, Resolution, AspectRatio
from app.services.job_service import JobService
from app.utils.logger import get_logger
from app.exceptions import (
    ScriptParsingError,
    ImageGenerationError,
    AnimationError,
    VoiceSynthesisError,
    MusicGenerationError,
    LipSyncError,
    VideoAssemblyError
)

logger = get_logger(__name__)


class VideoGenerationTask(Task):
    """Base task with error handling and progress tracking"""

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure"""
        logger.error(f"Task {task_id} failed: {exc}")
        
        # Update job status
        db = SessionLocal()
        try:
            job_id = kwargs.get('job_id')
            if job_id:
                job_service = JobService(db)
                job_service.update_job_status(
                    job_id=job_id,
                    status=JobStatus.FAILED,
                    error_message=str(exc)
                )
        finally:
            db.close()


@celery_app.task(base=VideoGenerationTask, bind=True, name="generate_video")
def generate_video_task(
    self,
    project_id: str,
    job_id: str,
    settings: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Main orchestration task for complete video generation pipeline

    Args:
        project_id: Project ID
        job_id: Generation job ID
        settings: Optional generation settings

    Returns:
        Dictionary with video generation results
    """
    db = SessionLocal()
    job_service = JobService(db)

    try:
        logger.info(f"Starting video generation for project {project_id}")

        # Update job status
        job_service.update_job_status(
            job_id=job_id,
            status=JobStatus.PROCESSING,
            current_stage="Initializing"
        )

        # Get project
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Project not found: {project_id}")

        # Update project status
        project.status = ProjectStatus.PROCESSING
        db.commit()

        # Stage 1: Parse script
        logger.info("Stage 1: Parsing script")
        job_service.update_job_progress(job_id, 0.1, "Parsing script")
        
        script_parser = get_script_parser()
        
        # Parse script and create scenes (async call needs to be awaited)
        import asyncio
        parsed_result = asyncio.run(script_parser.parse_script(db, project_id, project.script))
        
        scenes = parsed_result['scenes']
        logger.info(f"Created {len(scenes)} scenes")
        
        # Generate image prompts for all scenes
        logger.info("Generating image prompts for scenes")
        asyncio.run(script_parser.generate_all_scene_prompts(db, project_id))
        
        # Refresh scenes to get updated prompts
        for scene in scenes:
            db.refresh(scene)

        # Stage 2: Generate scenes
        logger.info("Stage 2: Generating scenes")
        total_scenes = len(scenes)
        
        for idx, scene in enumerate(scenes):
            progress = 0.1 + (0.7 * (idx / total_scenes))
            job_service.update_job_progress(
                job_id,
                progress,
                f"Generating scene {idx + 1}/{total_scenes}"
            )

            # Generate individual scene
            scene_result = generate_scene_task.apply_async(
                kwargs={
                    'scene_id': scene.id,
                    'job_id': job_id,
                    'settings': settings
                }
            ).get()  # Wait for completion

            logger.info(f"Scene {idx + 1} generated: {scene_result}")

        # Stage 3: Assemble final video
        logger.info("Stage 3: Assembling final video")
        job_service.update_job_progress(job_id, 0.8, "Assembling video")

        # Collect scene video paths
        scene_clips = []
        audio_tracks = []

        for scene in scenes:
            db.refresh(scene)
            
            # Get video asset
            video_asset = next(
                (a.asset for a in scene.assets if a.asset_role == "video"),
                None
            )
            if video_asset:
                scene_clips.append(video_asset.file_path)

            # Get audio asset
            audio_asset = next(
                (a.asset for a in scene.assets if a.asset_role == "audio"),
                None
            )
            if audio_asset:
                audio_tracks.append(audio_asset.file_path)

        # Get project settings
        resolution = settings.get('resolution', '1080p') if settings else '1080p'
        aspect_ratio = settings.get('aspect_ratio', '16:9') if settings else '16:9'
        
        # Assemble video
        video_assembler = VideoAssemblerService()
        output_config = OutputConfig(
            resolution=Resolution(resolution),
            aspect_ratio=AspectRatio(aspect_ratio)
        )

        video_path = video_assembler.assemble_video(
            scene_clips=scene_clips,
            audio_tracks=audio_tracks if audio_tracks else None,
            output_config=output_config,
            output_filename=f"{project_id}_final.mp4"
        )

        # Get video info
        video_info = video_assembler.get_video_info(video_path)

        # Save video file record
        video_file = VideoFile(
            id=str(uuid.uuid4()),
            project_id=project_id,
            file_path=video_path,
            resolution=resolution,
            aspect_ratio=aspect_ratio,
            duration=video_info.get('duration', 0),
            file_size=video_info.get('size', 0)
        )
        db.add(video_file)

        # Update project status
        project.status = ProjectStatus.COMPLETED
        db.commit()

        # Update job status
        job_service.update_job_status(
            job_id=job_id,
            status=JobStatus.COMPLETED,
            progress=1.0,
            current_stage="Completed"
        )

        logger.info(f"Video generation completed: {video_path}")

        return {
            'success': True,
            'video_path': video_path,
            'video_id': video_file.id,
            'duration': video_info.get('duration', 0),
            'file_size': video_info.get('size', 0)
        }

    except Exception as e:
        logger.error(f"Video generation failed: {e}", exc_info=True)
        
        # Update project status
        if project:
            project.status = ProjectStatus.FAILED
            db.commit()

        # Update job status
        job_service.update_job_status(
            job_id=job_id,
            status=JobStatus.FAILED,
            error_message=str(e)
        )

        raise

    finally:
        db.close()


@celery_app.task(base=VideoGenerationTask, bind=True, name="generate_scene")
def generate_scene_task(
    self,
    scene_id: str,
    job_id: str,
    settings: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate individual scene with all assets

    Args:
        scene_id: Scene ID
        job_id: Parent job ID
        settings: Optional generation settings

    Returns:
        Dictionary with scene generation results
    """
    db = SessionLocal()

    try:
        logger.info(f"Generating scene {scene_id}")

        # Get scene
        scene = db.query(Scene).filter(Scene.id == scene_id).first()
        if not scene:
            raise ValueError(f"Scene not found: {scene_id}")

        # Update scene status
        scene.status = SceneStatus.GENERATING
        db.commit()

        # Step 1: Generate image
        logger.info(f"Scene {scene_id}: Generating image")
        image_generator = ImageGeneratorService()
        
        image_result = image_generator.generate_image(
            prompt=scene.image_prompt,
            width=1024,
            height=1024,
            seed=settings.get('seed') if settings else None
        )

        # Save image asset
        image_asset = Asset(
            id=str(uuid.uuid4()),
            asset_type=AssetType.IMAGE,
            file_path=image_result.file_path,
            metadata={
                'prompt': scene.image_prompt,
                'seed': image_result.seed,
                'width': 1024,
                'height': 1024
            }
        )
        db.add(image_asset)
        db.flush()

        # Link to scene
        scene_asset = SceneAsset(
            id=str(uuid.uuid4()),
            scene_id=scene_id,
            asset_id=image_asset.id,
            asset_role=AssetRole.VIDEO  # Image will be used for video generation
        )
        db.add(scene_asset)

        # Step 2: Animate image
        logger.info(f"Scene {scene_id}: Animating image")
        animation_engine = AnimationEngineService()
        
        video_result = animation_engine.animate_image(
            image_path=image_result.file_path,
            motion_prompt=scene.motion_prompt or "subtle movement",
            duration=scene.duration,
            fps=24
        )

        # Save video asset
        video_asset = Asset(
            id=str(uuid.uuid4()),
            asset_type=AssetType.VIDEO,
            file_path=video_result.file_path,
            metadata={
                'duration': scene.duration,
                'fps': 24,
                'motion_prompt': scene.motion_prompt
            }
        )
        db.add(video_asset)
        db.flush()

        scene_asset = SceneAsset(
            id=str(uuid.uuid4()),
            scene_id=scene_id,
            asset_id=video_asset.id,
            asset_role=AssetRole.VIDEO
        )
        db.add(scene_asset)

        # Step 3: Generate voice (if dialogue exists)
        if scene.dialogue:
            logger.info(f"Scene {scene_id}: Generating voice")
            voice_synthesizer = VoiceSynthesizerService()
            
            audio_result = voice_synthesizer.synthesize_speech(
                text=scene.dialogue,
                voice_id="default",
                language="en"
            )

            # Save audio asset
            audio_asset = Asset(
                id=str(uuid.uuid4()),
                asset_type=AssetType.AUDIO,
                file_path=audio_result.file_path,
                metadata={
                    'text': scene.dialogue,
                    'voice_id': "default",
                    'duration': audio_result.duration
                }
            )
            db.add(audio_asset)
            db.flush()

            scene_asset = SceneAsset(
                id=str(uuid.uuid4()),
                scene_id=scene_id,
                asset_id=audio_asset.id,
                asset_role=AssetRole.AUDIO
            )
            db.add(scene_asset)

            # Step 4: Apply lip sync (if character in scene)
            logger.info(f"Scene {scene_id}: Applying lip sync")
            lip_sync_engine = LipSyncEngineService()
            
            synced_video_result = lip_sync_engine.apply_lip_sync(
                video_path=video_result.file_path,
                audio_path=audio_result.file_path
            )

            # Update video asset with synced version
            video_asset.file_path = synced_video_result.file_path
            video_asset.metadata['lip_synced'] = True

        # Update scene status
        scene.status = SceneStatus.COMPLETED
        db.commit()

        logger.info(f"Scene {scene_id} generation completed")

        return {
            'success': True,
            'scene_id': scene_id,
            'video_path': video_asset.file_path
        }

    except Exception as e:
        logger.error(f"Scene generation failed: {e}", exc_info=True)
        
        # Update scene status
        if scene:
            scene.status = SceneStatus.FAILED
            db.commit()

        raise

    finally:
        db.close()


@celery_app.task(base=VideoGenerationTask, bind=True, name="regenerate_asset")
def regenerate_asset_task(
    self,
    asset_id: str,
    job_id: str,
    params: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Regenerate specific asset with adjusted parameters

    Args:
        asset_id: Asset ID to regenerate
        job_id: Job ID
        params: New generation parameters

    Returns:
        Dictionary with regeneration results
    """
    db = SessionLocal()

    try:
        logger.info(f"Regenerating asset {asset_id}")

        # Get asset
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            raise ValueError(f"Asset not found: {asset_id}")

        # Regenerate based on asset type
        if asset.asset_type == AssetType.IMAGE:
            image_generator = ImageGeneratorService()
            result = image_generator.generate_image(
                prompt=params.get('prompt', asset.metadata.get('prompt')),
                width=params.get('width', 1024),
                height=params.get('height', 1024),
                seed=params.get('seed')
            )
            asset.file_path = result.file_path
            asset.metadata.update({
                'prompt': params.get('prompt'),
                'seed': result.seed
            })

        elif asset.asset_type == AssetType.VIDEO:
            animation_engine = AnimationEngineService()
            result = animation_engine.animate_image(
                image_path=params.get('image_path'),
                motion_prompt=params.get('motion_prompt', 'subtle movement'),
                duration=params.get('duration', 5.0),
                fps=params.get('fps', 24)
            )
            asset.file_path = result.file_path
            asset.metadata.update({
                'motion_prompt': params.get('motion_prompt'),
                'duration': params.get('duration')
            })

        elif asset.asset_type == AssetType.AUDIO:
            voice_synthesizer = VoiceSynthesizerService()
            result = voice_synthesizer.synthesize_speech(
                text=params.get('text', asset.metadata.get('text')),
                voice_id=params.get('voice_id', 'default'),
                language=params.get('language', 'en')
            )
            asset.file_path = result.file_path
            asset.metadata.update({
                'text': params.get('text'),
                'voice_id': params.get('voice_id')
            })

        db.commit()

        logger.info(f"Asset {asset_id} regenerated successfully")

        return {
            'success': True,
            'asset_id': asset_id,
            'file_path': asset.file_path
        }

    except Exception as e:
        logger.error(f"Asset regeneration failed: {e}", exc_info=True)
        raise

    finally:
        db.close()


@celery_app.task(name="cancel_job")
def cancel_job_task(job_id: str) -> Dict[str, Any]:
    """
    Cancel running job and cleanup partial assets

    Args:
        job_id: Job ID to cancel

    Returns:
        Dictionary with cancellation results
    """
    db = SessionLocal()
    job_service = JobService(db)

    try:
        logger.info(f"Cancelling job {job_id}")

        # Get job
        job = db.query(GenerationJob).filter(GenerationJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job not found: {job_id}")

        # Revoke Celery task
        if job.celery_task_id:
            celery_app.control.revoke(job.celery_task_id, terminate=True)

        # Update job status
        job_service.update_job_status(
            job_id=job_id,
            status=JobStatus.CANCELLED
        )

        # Cleanup partial assets
        # TODO: Implement asset cleanup logic

        logger.info(f"Job {job_id} cancelled successfully")

        return {
            'success': True,
            'job_id': job_id,
            'status': 'cancelled'
        }

    except Exception as e:
        logger.error(f"Job cancellation failed: {e}", exc_info=True)
        raise

    finally:
        db.close()
