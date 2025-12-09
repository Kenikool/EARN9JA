"""
Start Backend Server

Starts the FastAPI server with proper configuration.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_env_file():
    """Check if .env file exists"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists():
        if env_example.exists():
            print("⚠ .env file not found. Creating from .env.example...")
            env_example.read_text()
            with open(env_file, 'w') as f:
                f.write(env_example.read_text())
            print("✓ .env file created. Please update with your settings.")
        else:
            print("⚠ .env file not found. Using default settings.")
    else:
        print("✓ .env file found")

def check_database():
    """Check database connection"""
    try:
        from app.database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("  Make sure PostgreSQL is running and configured correctly")
        return False

def run_migrations():
    """Run database migrations"""
    try:
        print("Running database migrations...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("✓ Migrations completed")
            return True
        else:
            print(f"✗ Migration failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Migration error: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("\n" + "="*60)
    print("Starting AI Video Generator Backend Server")
    print("="*60 + "\n")
    
    # Check environment
    check_env_file()
    
    # Check database (optional for now)
    db_ok = check_database()
    if db_ok:
        run_migrations()
    else:
        print("⚠ Continuing without database (some features may not work)")
    
    print("\n" + "="*60)
    print("Starting server on http://localhost:8000")
    print("API docs available at http://localhost:8000/api/docs")
    print("="*60 + "\n")
    
    # Start server
    try:
        subprocess.run([
            "uvicorn",
            "app.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\n✗ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()
