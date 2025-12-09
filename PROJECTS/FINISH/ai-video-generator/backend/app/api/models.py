"""
Model Management API Endpoints

REST API for managing AI models - download, activate, configure.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.schemas.model_manager import (
    ModelType,
    ModelStatus,
    ModelInfoResponse,
    ListModelsResponse,
    DownloadModelRequest,
    DownloadModelResponse,
    ActivateModelRequest,
    ActivateModelResponse,
    DeleteModelRequest,
    DeleteModelResponse,
    StorageInfoResponse,
    AddModelRequest,
    ModelConfigUpdate
)
from app.services.model_manager import (
    ModelManagerService,
    ModelInfo,
    ModelDownloadError,
    ModelVerificationError
)
from app.models.model_config import ModelConfig as ModelConfigDB
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/models", tags=["models"])

# Initialize service
model_manager = ModelManagerService()


@router.get("/", response_model=ListModelsResponse)
async def list_models(
    model_type: Optional[ModelType] = None,
    status: Optional[ModelStatus] = None
):
    """
    List available models

    Returns all models or filtered by type and status.
    """
    try:
        from app.services.model_manager import ModelType as ServiceModelType
        from app.services.model_manager import ModelStatus as ServiceModelStatus

        # Convert enum types - handle both enum and string values
        service_type = None
        if model_type:
            if isinstance(model_type, str):
                service_type = ServiceModelType(model_type)
            else:
                service_type = ServiceModelType(model_type.value)
        
        service_status = None
        if status:
            if isinstance(status, str):
                service_status = ServiceModelStatus(status)
            else:
                service_status = ServiceModelStatus(status.value)

        models = model_manager.list_models(
            model_type=service_type,
            status=service_status
        )

        model_responses = []
        for model in models:
            model_responses.append(
                ModelInfoResponse(
                    model_id=model.model_id,
                    model_type=ModelType(model.model_type.value),
                    name=model.name,
                    description=model.description,
                    source=model.source,
                    source_url=model.source_url,
                    file_size=model.file_size,
                    file_size_gb=round(model.file_size / (1024**3), 2) if model.file_size else None,
                    checksum=model.checksum,
                    requirements=model.requirements,
                    status=ModelStatus(model.status.value),
                    local_path=model.local_path
                )
            )

        return ListModelsResponse(
            models=model_responses,
            total=len(model_responses)
        )

    except Exception as e:
        logger.error(f"Error listing models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{model_id}", response_model=ModelInfoResponse)
async def get_model(model_id: str):
    """
    Get model information

    Returns detailed information about a specific model.
    """
    try:
        model = model_manager.get_model(model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        return ModelInfoResponse(
            model_id=model.model_id,
            model_type=ModelType(model.model_type.value),
            name=model.name,
            description=model.description,
            source=model.source,
            source_url=model.source_url,
            file_size=model.file_size,
            file_size_gb=round(model.file_size / (1024**3), 2) if model.file_size else None,
            checksum=model.checksum,
            requirements=model.requirements,
            status=ModelStatus(model.status.value),
            local_path=model.local_path
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/download", response_model=DownloadModelResponse)
async def download_model(
    request: DownloadModelRequest,
    background_tasks: BackgroundTasks
):
    """
    Download a model

    Downloads model from source (HuggingFace, URL, or Ollama).
    Large models are downloaded in the background.
    """
    try:
        model = model_manager.get_model(request.model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        if model.status == ModelStatus.INSTALLED or model.status == ModelStatus.ACTIVE:
            return DownloadModelResponse(
                model_id=request.model_id,
                status="already_installed",
                local_path=model.local_path,
                message="Model is already installed"
            )

        # For large models, download in background
        if model.file_size and model.file_size > 1_000_000_000:  # > 1GB
            background_tasks.add_task(
                model_manager.download_model,
                request.model_id
            )
            return DownloadModelResponse(
                model_id=request.model_id,
                status="downloading",
                local_path="",
                message="Model download started in background"
            )
        else:
            # Download immediately for small models
            local_path = model_manager.download_model(request.model_id)
            return DownloadModelResponse(
                model_id=request.model_id,
                status="completed",
                local_path=local_path,
                message="Model downloaded successfully"
            )

    except ModelDownloadError as e:
        logger.error(f"Model download error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/activate", response_model=ActivateModelResponse)
async def activate_model(request: ActivateModelRequest):
    """
    Activate a model

    Sets the model as active for its type. Deactivates other models of the same type.
    """
    try:
        model_manager.activate_model(request.model_id)

        model = model_manager.get_model(request.model_id)

        return ActivateModelResponse(
            model_id=request.model_id,
            status=ModelStatus(model.status.value),
            message=f"Model {request.model_id} activated successfully"
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error activating model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deactivate/{model_id}", response_model=ActivateModelResponse)
async def deactivate_model(model_id: str):
    """
    Deactivate a model

    Deactivates the model but keeps it installed.
    """
    try:
        model_manager.deactivate_model(model_id)

        model = model_manager.get_model(model_id)

        return ActivateModelResponse(
            model_id=model_id,
            status=ModelStatus(model.status.value),
            message=f"Model {model_id} deactivated successfully"
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error deactivating model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{model_id}", response_model=DeleteModelResponse)
async def delete_model(model_id: str):
    """
    Delete a model

    Removes the model from disk and marks it as not installed.
    """
    try:
        model_manager.delete_model(model_id)

        return DeleteModelResponse(
            model_id=model_id,
            message=f"Model {model_id} deleted successfully"
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/storage/info", response_model=StorageInfoResponse)
async def get_storage_info():
    """
    Get storage information

    Returns statistics about model storage usage.
    """
    try:
        info = model_manager.get_storage_info()
        return StorageInfoResponse(**info)

    except Exception as e:
        logger.error(f"Error getting storage info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/add", response_model=ModelInfoResponse)
async def add_custom_model(request: AddModelRequest):
    """
    Add a custom model

    Adds a new model to the registry that can be downloaded later.
    """
    try:
        from app.services.model_manager import ModelInfo as ServiceModelInfo
        from app.services.model_manager import ModelType as ServiceModelType
        from app.services.model_manager import ModelStatus as ServiceModelStatus

        # Create model info
        model_info = ServiceModelInfo(
            model_id=request.model_id,
            model_type=ServiceModelType(request.model_type.value),
            name=request.name,
            description=request.description,
            source=request.source,
            source_url=request.source_url,
            file_size=request.file_size,
            checksum=request.checksum,
            requirements=request.requirements,
            status=ServiceModelStatus.NOT_INSTALLED
        )

        # Add to registry
        model_manager.models[request.model_id] = model_info
        model_manager._save_registry()

        logger.info(f"Custom model added: {request.model_id}")

        return ModelInfoResponse(
            model_id=model_info.model_id,
            model_type=ModelType(model_info.model_type.value),
            name=model_info.name,
            description=model_info.description,
            source=model_info.source,
            source_url=model_info.source_url,
            file_size=model_info.file_size,
            file_size_gb=round(model_info.file_size / (1024**3), 2) if model_info.file_size else None,
            checksum=model_info.checksum,
            requirements=model_info.requirements,
            status=ModelStatus(model_info.status.value),
            local_path=model_info.local_path
        )

    except Exception as e:
        logger.error(f"Error adding custom model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active/{model_type}", response_model=ModelInfoResponse)
async def get_active_model(model_type: ModelType):
    """
    Get active model for a type

    Returns the currently active model for the specified type.
    """
    try:
        from app.services.model_manager import ModelType as ServiceModelType

        service_type = ServiceModelType(model_type.value)
        model = model_manager.get_active_model(service_type)

        if not model:
            raise HTTPException(
                status_code=404,
                detail=f"No active model for type: {model_type}"
            )

        return ModelInfoResponse(
            model_id=model.model_id,
            model_type=ModelType(model.model_type.value),
            name=model.name,
            description=model.description,
            source=model.source,
            source_url=model.source_url,
            file_size=model.file_size,
            file_size_gb=round(model.file_size / (1024**3), 2) if model.file_size else None,
            checksum=model.checksum,
            requirements=model.requirements,
            status=ModelStatus(model.status.value),
            local_path=model.local_path
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting active model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{model_id}/config", response_model=ModelInfoResponse)
async def update_model_config(
    model_id: str,
    config: ModelConfigUpdate,
    db: Session = Depends(get_db)
):
    """
    Update model configuration

    Updates model parameters and activation status in database.
    """
    try:
        # Get or create model config in database
        model_config = db.query(ModelConfigDB).filter(
            ModelConfigDB.model_name == model_id
        ).first()

        if not model_config:
            # Get model info from manager
            model = model_manager.get_model(model_id)
            if not model:
                raise HTTPException(status_code=404, detail="Model not found")

            # Create new config
            model_config = ModelConfigDB(
                model_type=model.model_type.value,
                model_name=model_id,
                model_path=model.local_path or "",
                is_active=config.is_active if config.is_active is not None else False,
                parameters=config.parameters or {}
            )
            db.add(model_config)
        else:
            # Update existing config
            if config.parameters is not None:
                model_config.parameters = config.parameters
            if config.is_active is not None:
                model_config.is_active = config.is_active

        db.commit()
        db.refresh(model_config)

        # Update in model manager if activation changed
        if config.is_active is not None:
            if config.is_active:
                model_manager.activate_model(model_id)
            else:
                model_manager.deactivate_model(model_id)

        # Return updated model info
        model = model_manager.get_model(model_id)
        return ModelInfoResponse(
            model_id=model.model_id,
            model_type=ModelType(model.model_type.value),
            name=model.name,
            description=model.description,
            source=model.source,
            source_url=model.source_url,
            file_size=model.file_size,
            file_size_gb=round(model.file_size / (1024**3), 2) if model.file_size else None,
            checksum=model.checksum,
            requirements=model.requirements,
            status=ModelStatus(model.status.value),
            local_path=model.local_path
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating model config: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{model_id}/switch", response_model=ModelInfoResponse)
async def switch_model(model_id: str, clear_gpu: bool = True):
    """
    Switch to a different model (hot-swap)

    Switches to the specified model without restarting the service.
    Optionally clears GPU memory before switching.
    """
    try:
        model = model_manager.switch_model(model_id, clear_gpu_memory=clear_gpu)

        return ModelInfoResponse(
            model_id=model.model_id,
            model_type=ModelType(model.model_type.value),
            name=model.name,
            description=model.description,
            source=model.source,
            source_url=model.source_url,
            file_size=model.file_size,
            file_size_gb=round(model.file_size / (1024**3), 2) if model.file_size else None,
            checksum=model.checksum,
            requirements=model.requirements,
            status=ModelStatus(model.status.value),
            local_path=model.local_path
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error switching model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{model_id}/reload", response_model=ModelInfoResponse)
async def reload_model(model_id: str):
    """
    Reload a model

    Reloads the model, useful after configuration changes.
    """
    try:
        model = model_manager.reload_model(model_id)

        return ModelInfoResponse(
            model_id=model.model_id,
            model_type=ModelType(model.model_type.value),
            name=model.name,
            description=model.description,
            source=model.source,
            source_url=model.source_url,
            file_size=model.file_size,
            file_size_gb=round(model.file_size / (1024**3), 2) if model.file_size else None,
            checksum=model.checksum,
            requirements=model.requirements,
            status=ModelStatus(model.status.value),
            local_path=model.local_path
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error reloading model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{model_id}/requirements")
async def get_model_requirements(model_id: str):
    """
    Get model requirements

    Returns system requirements for the model.
    """
    try:
        requirements = model_manager.get_model_requirements(model_id)
        return requirements

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting requirements: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{model_id}/compatibility")
async def check_compatibility(model_id: str):
    """
    Check system compatibility

    Checks if the system meets the model's requirements.
    """
    try:
        compatibility = model_manager.check_system_compatibility(model_id)
        return compatibility

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error checking compatibility: {e}")
        raise HTTPException(status_code=500, detail=str(e))
