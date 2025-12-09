"""Asset management API endpoints."""

import uuid
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Asset
from app.models.asset import AssetType
from app.schemas.asset import (
    AssetCreate,
    AssetUpdate,
    AssetResponse,
    AssetListResponse,
)
from app.config import settings

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.post("/upload", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_asset(
    file: UploadFile = File(...),
    asset_type: AssetType = Query(..., description="Type of asset"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    reusable: bool = Query(True, description="Whether asset can be reused"),
    db: Session = Depends(get_db),
):
    """Upload a new asset file."""
    # Validate file type
    allowed_extensions = {
        AssetType.IMAGE: [".png", ".jpg", ".jpeg", ".webp"],
        AssetType.VIDEO: [".mp4", ".avi", ".mov", ".webm"],
        AssetType.AUDIO: [".mp3", ".wav", ".ogg", ".m4a"],
        AssetType.CHARACTER: [".png", ".jpg", ".jpeg"],
        AssetType.BACKGROUND: [".png", ".jpg", ".jpeg"],
    }
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions.get(asset_type, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type for {asset_type}. Allowed: {allowed_extensions.get(asset_type)}",
        )
    
    # Generate unique filename
    asset_id = str(uuid.uuid4())
    filename = f"{asset_id}{file_ext}"
    file_path = os.path.join(settings.assets_path, filename)
    
    # TODO: Save file to storage (implement actual file saving)
    # For now, just use the path
    # with open(file_path, "wb") as f:
    #     content = await file.read()
    #     f.write(content)
    
    # Parse tags
    tag_list = [tag.strip() for tag in tags.split(",")] if tags else None
    
    # Create asset record
    asset = Asset(
        id=asset_id,
        asset_type=asset_type,
        file_path=file_path,
        tags=tag_list,
        reusable=reusable,
        asset_metadata={"original_filename": file.filename, "size": file.size},
    )
    
    db.add(asset)
    db.commit()
    db.refresh(asset)
    
    return asset


@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    asset_data: AssetCreate,
    db: Session = Depends(get_db),
):
    """Create a new asset record (for programmatically generated assets)."""
    asset = Asset(
        id=str(uuid.uuid4()),
        asset_type=asset_data.asset_type,
        file_path=asset_data.file_path,
        thumbnail_path=asset_data.thumbnail_path,
        asset_metadata=asset_data.asset_metadata,
        tags=asset_data.tags,
        reusable=asset_data.reusable,
    )
    
    db.add(asset)
    db.commit()
    db.refresh(asset)
    
    return asset


@router.get("", response_model=AssetListResponse)
async def list_assets(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    asset_type: Optional[AssetType] = Query(None, description="Filter by asset type"),
    reusable_only: bool = Query(False, description="Only show reusable assets"),
    search: Optional[str] = Query(None, description="Search in metadata"),
    db: Session = Depends(get_db),
):
    """List all assets with pagination and filters."""
    query = db.query(Asset)
    
    # Apply filters
    if asset_type:
        query = query.filter(Asset.asset_type == asset_type)
    
    if reusable_only:
        query = query.filter(Asset.reusable == True)
    
    if search:
        # Search in file_path and asset_metadata
        query = query.filter(
            or_(
                Asset.file_path.ilike(f"%{search}%"),
                Asset.asset_metadata.astext.ilike(f"%{search}%"),
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    assets = (
        query.order_by(Asset.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return AssetListResponse(
        assets=assets,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    db: Session = Depends(get_db),
):
    """Get a specific asset by ID."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found",
        )
    
    return asset


@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: str,
    asset_data: AssetUpdate,
    db: Session = Depends(get_db),
):
    """Update an asset."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found",
        )
    
    # Update fields
    update_data = asset_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)
    
    db.commit()
    db.refresh(asset)
    
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
):
    """Delete an asset."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found",
        )
    
    # TODO: Delete actual file from storage
    # os.remove(asset.file_path)
    # if asset.thumbnail_path:
    #     os.remove(asset.thumbnail_path)
    
    db.delete(asset)
    db.commit()
    
    return None
