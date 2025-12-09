"""Asset schemas."""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.asset import AssetType


class AssetCreate(BaseModel):
    """Schema for creating an asset."""
    
    asset_type: AssetType = Field(..., description="Type of asset")
    file_path: str = Field(..., description="Path to asset file")
    thumbnail_path: Optional[str] = Field(None, description="Path to thumbnail")
    asset_metadata: Optional[dict] = Field(None, description="Asset metadata")
    tags: Optional[list[str]] = Field(None, description="Asset tags")
    reusable: bool = Field(True, description="Whether asset can be reused")


class AssetUpdate(BaseModel):
    """Schema for updating an asset."""
    
    thumbnail_path: Optional[str] = None
    asset_metadata: Optional[dict] = None
    tags: Optional[list[str]] = None
    reusable: Optional[bool] = None


class AssetResponse(BaseModel):
    """Schema for asset response."""
    
    id: str
    asset_type: AssetType
    file_path: str
    thumbnail_path: Optional[str] = None
    asset_metadata: Optional[dict] = None
    tags: Optional[list] = None
    reusable: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AssetListResponse(BaseModel):
    """Schema for asset list response."""
    
    assets: list[AssetResponse]
    total: int
    page: int
    page_size: int


class AssetSearchRequest(BaseModel):
    """Schema for asset search request."""
    
    query: Optional[str] = Field(None, description="Search query")
    asset_type: Optional[AssetType] = Field(None, description="Filter by asset type")
    tags: Optional[list[str]] = Field(None, description="Filter by tags")
    reusable_only: bool = Field(False, description="Only show reusable assets")
