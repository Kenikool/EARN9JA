"""Database connection and session management."""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.config import settings

# MongoDB client
mongodb_client: Optional[AsyncIOMotorClient] = None


def get_database():
    """Get MongoDB database instance."""
    return mongodb_client.get_default_database()


async def connect_to_mongo():
    """Connect to MongoDB."""
    global mongodb_client
    mongodb_client = AsyncIOMotorClient(settings.mongodb_uri)
    print(f"Connected to MongoDB at {settings.mongodb_uri}")


async def close_mongo_connection():
    """Close MongoDB connection."""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        print("Closed MongoDB connection")


def init_db() -> None:
    """Initialize database - MongoDB doesn't require schema creation."""
    print("MongoDB initialized - collections will be created on first use")
