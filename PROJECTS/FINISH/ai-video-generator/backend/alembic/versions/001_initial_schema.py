"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('script', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED', name='projectstatus'), nullable=False),
        sa.Column('settings', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_projects_user_id', 'projects', ['user_id'])
    op.create_index('ix_projects_user_id_status', 'projects', ['user_id', 'status'])
    op.create_index('ix_projects_created_at', 'projects', ['created_at'])

    # Create characters table
    op.create_table(
        'characters',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('visual_embedding', sa.String(), nullable=True),
        sa.Column('voice_profile_id', sa.String(), nullable=True),
        sa.Column('appearance_params', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create scenes table
    op.create_table(
        'scenes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=False),
        sa.Column('scene_number', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('dialogue', sa.String(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=False),
        sa.Column('image_prompt', sa.String(), nullable=True),
        sa.Column('motion_prompt', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'GENERATING', 'COMPLETED', 'FAILED', name='scenestatus'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_scenes_project_id', 'scenes', ['project_id'])
    op.create_index('ix_scenes_project_scene_number', 'scenes', ['project_id', 'scene_number'])

    # Create assets table
    op.create_table(
        'assets',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('asset_type', sa.Enum('IMAGE', 'VIDEO', 'AUDIO', 'CHARACTER', 'BACKGROUND', name='assettype'), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('thumbnail_path', sa.String(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('reusable', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_assets_type', 'assets', ['asset_type'])
    op.create_index('ix_assets_reusable', 'assets', ['reusable'])
    op.create_index('ix_assets_created_at', 'assets', ['created_at'])

    # Create scene_assets table
    op.create_table(
        'scene_assets',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('scene_id', sa.String(), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('asset_role', sa.Enum('CHARACTER', 'BACKGROUND', 'VIDEO', 'AUDIO', 'MUSIC', name='assetrole'), nullable=False),
        sa.ForeignKeyConstraint(['scene_id'], ['scenes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_scene_assets_scene_id', 'scene_assets', ['scene_id'])
    op.create_index('ix_scene_assets_asset_id', 'scene_assets', ['asset_id'])

    # Create generation_jobs table
    op.create_table(
        'generation_jobs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=False),
        sa.Column('job_type', sa.Enum('FULL_VIDEO', 'SINGLE_SCENE', 'ASSET_REGENERATION', name='jobtype'), nullable=False),
        sa.Column('status', sa.Enum('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', name='jobstatus'), nullable=False),
        sa.Column('progress', sa.Float(), nullable=False),
        sa.Column('current_stage', sa.String(), nullable=True),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('celery_task_id', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_generation_jobs_project_id', 'generation_jobs', ['project_id'])
    op.create_index('ix_generation_jobs_status', 'generation_jobs', ['status'])
    op.create_index('ix_generation_jobs_celery_task_id', 'generation_jobs', ['celery_task_id'])

    # Create video_files table
    op.create_table(
        'video_files',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('resolution', sa.String(), nullable=True),
        sa.Column('aspect_ratio', sa.String(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id')
    )

    # Create model_configs table
    op.create_table(
        'model_configs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('model_type', sa.Enum('IMAGE_GEN', 'ANIMATION', 'TTS', 'MUSIC', 'LIP_SYNC', name='modeltype'), nullable=False),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('model_path', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('parameters', sa.JSON(), nullable=True),
        sa.Column('download_url', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('model_configs')
    op.drop_table('video_files')
    op.drop_table('generation_jobs')
    op.drop_table('scene_assets')
    op.drop_table('assets')
    op.drop_table('scenes')
    op.drop_table('characters')
    op.drop_table('projects')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS projectstatus')
    op.execute('DROP TYPE IF EXISTS scenestatus')
    op.execute('DROP TYPE IF EXISTS assettype')
    op.execute('DROP TYPE IF EXISTS assetrole')
    op.execute('DROP TYPE IF EXISTS jobtype')
    op.execute('DROP TYPE IF EXISTS jobstatus')
    op.execute('DROP TYPE IF EXISTS modeltype')
