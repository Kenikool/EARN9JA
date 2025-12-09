"""WebSocket endpoints for real-time updates."""

import json
import asyncio
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import redis.asyncio as aioredis

from app.config import settings
from app.database import get_db
from app.services.job_service import JobService
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["websocket"])

# Connection manager for WebSocket clients
class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""
    
    def __init__(self):
        # job_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.redis_client: aioredis.Redis = None
        self.pubsub_task: asyncio.Task = None
    
    async def connect(self, websocket: WebSocket, job_id: str):
        """
        Connect a WebSocket client to a job channel.
        
        Args:
            websocket: WebSocket connection
            job_id: Job UUID to subscribe to
        """
        await websocket.accept()
        
        if job_id not in self.active_connections:
            self.active_connections[job_id] = set()
        
        self.active_connections[job_id].add(websocket)
        
        logger.info(
            f"WebSocket connected to job: {job_id}",
            extra={
                "job_id": job_id,
                "total_connections": len(self.active_connections[job_id]),
            },
        )
    
    def disconnect(self, websocket: WebSocket, job_id: str):
        """
        Disconnect a WebSocket client from a job channel.
        
        Args:
            websocket: WebSocket connection
            job_id: Job UUID
        """
        if job_id in self.active_connections:
            self.active_connections[job_id].discard(websocket)
            
            # Clean up empty sets
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]
        
        logger.info(
            f"WebSocket disconnected from job: {job_id}",
            extra={"job_id": job_id},
        )
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Send a message to a specific WebSocket client.
        
        Args:
            message: Message dictionary
            websocket: WebSocket connection
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Failed to send WebSocket message: {str(e)}")
    
    async def broadcast_to_job(self, job_id: str, message: dict):
        """
        Broadcast a message to all clients subscribed to a job.
        
        Args:
            job_id: Job UUID
            message: Message dictionary
        """
        if job_id not in self.active_connections:
            return
        
        # Create a copy of the set to avoid modification during iteration
        connections = self.active_connections[job_id].copy()
        
        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(
                    f"Failed to broadcast to WebSocket: {str(e)}",
                    extra={"job_id": job_id},
                )
                # Remove failed connection
                self.disconnect(websocket, job_id)
    
    async def start_redis_listener(self):
        """Start listening to Redis pub/sub for job updates."""
        try:
            self.redis_client = await aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
            
            pubsub = self.redis_client.pubsub()
            await pubsub.psubscribe("job:*")
            
            logger.info("Redis pub/sub listener started")
            
            async for message in pubsub.listen():
                if message["type"] == "pmessage":
                    channel = message["channel"]
                    data = message["data"]
                    
                    # Extract job_id from channel name (job:job_id)
                    job_id = channel.split(":", 1)[1]
                    
                    try:
                        message_data = json.loads(data)
                        await self.broadcast_to_job(job_id, message_data)
                    except json.JSONDecodeError:
                        logger.error(f"Invalid JSON in Redis message: {data}")
                    except Exception as e:
                        logger.error(f"Error processing Redis message: {str(e)}")
        
        except Exception as e:
            logger.error(f"Redis listener error: {str(e)}")
        finally:
            if self.redis_client:
                await self.redis_client.close()
    
    async def publish_job_update(self, job_id: str, update: dict):
        """
        Publish a job update to Redis pub/sub.
        
        Args:
            job_id: Job UUID
            update: Update dictionary
        """
        if not self.redis_client:
            return
        
        try:
            channel = f"job:{job_id}"
            await self.redis_client.publish(channel, json.dumps(update))
        except Exception as e:
            logger.error(f"Failed to publish job update: {str(e)}")


# Global connection manager
manager = ConnectionManager()


@router.on_event("startup")
async def startup_event():
    """Start Redis listener on application startup."""
    manager.pubsub_task = asyncio.create_task(manager.start_redis_listener())


@router.on_event("shutdown")
async def shutdown_event():
    """Stop Redis listener on application shutdown."""
    if manager.pubsub_task:
        manager.pubsub_task.cancel()
        try:
            await manager.pubsub_task
        except asyncio.CancelledError:
            pass


@router.websocket("/ws/jobs/{job_id}")
async def websocket_job_updates(
    websocket: WebSocket,
    job_id: str,
    db: Session = Depends(get_db),
):
    """
    WebSocket endpoint for real-time job updates.
    
    Clients can connect to this endpoint to receive real-time updates
    about a specific generation job.
    
    Args:
        websocket: WebSocket connection
        job_id: Job UUID to subscribe to
        db: Database session
    """
    # Verify job exists
    try:
        job = JobService.get_job(db, job_id)
    except Exception as e:
        await websocket.close(code=1008, reason=f"Job not found: {job_id}")
        return
    
    await manager.connect(websocket, job_id)
    
    try:
        # Send initial job status
        await manager.send_personal_message(
            {
                "type": "status",
                "job_id": job_id,
                "status": job.status.value,
                "progress": job.progress,
                "current_stage": job.current_stage,
            },
            websocket,
        )
        
        # Keep connection alive and handle incoming messages
        while True:
            # Wait for messages from client (e.g., ping/pong)
            data = await websocket.receive_text()
            
            # Handle ping
            if data == "ping":
                await websocket.send_text("pong")
            
            # Refresh job status on request
            elif data == "refresh":
                db.refresh(job)
                await manager.send_personal_message(
                    {
                        "type": "status",
                        "job_id": job_id,
                        "status": job.status.value,
                        "progress": job.progress,
                        "current_stage": job.current_stage,
                    },
                    websocket,
                )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, job_id)
        logger.info(f"Client disconnected from job: {job_id}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket, job_id)
        await websocket.close(code=1011, reason="Internal server error")


# Helper function to publish job updates (to be used by Celery tasks)
async def publish_job_update(
    job_id: str,
    status: str,
    progress: float,
    current_stage: str,
    error_message: str = None,
):
    """
    Publish a job update to all connected WebSocket clients.
    
    This function should be called from Celery tasks to broadcast updates.
    
    Args:
        job_id: Job UUID
        status: Job status
        progress: Progress percentage (0-100)
        current_stage: Current processing stage
        error_message: Optional error message
    """
    update = {
        "type": "update",
        "job_id": job_id,
        "status": status,
        "progress": progress,
        "current_stage": current_stage,
    }
    
    if error_message:
        update["error_message"] = error_message
    
    await manager.publish_job_update(job_id, update)
