"""
Install All Backend Dependencies

Installs all required packages in the correct order.
"""

import subprocess
import sys

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def run_pip_install(packages, description=""):
    """Run pip install for a list of packages"""
    if description:
        print(f"\n{Colors.BLUE}{Colors.BOLD}Installing {description}...{Colors.RESET}")
    
    try:
        cmd = [sys.executable, "-m", "pip", "install"] + packages
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"{Colors.GREEN}✓ Successfully installed {description}{Colors.RESET}")
            return True
        else:
            print(f"{Colors.RED}✗ Failed to install {description}{Colors.RESET}")
            print(f"  Error: {result.stderr[:200]}")
            return False
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {e}{Colors.RESET}")
        return False

def main():
    """Install all dependencies"""
    print(f"\n{Colors.BOLD}{'='*60}")
    print("Installing Backend Dependencies")
    print(f"{'='*60}{Colors.RESET}\n")
    
    # Core dependencies (already installed, but ensure latest)
    print(f"{Colors.BLUE}Step 1: Core Dependencies{Colors.RESET}")
    core_deps = [
        "fastapi",
        "uvicorn[standard]",
        "pydantic",
        "pydantic-settings",
    ]
    run_pip_install(core_deps, "Core Framework")
    
    # Database
    print(f"\n{Colors.BLUE}Step 2: Database{Colors.RESET}")
    db_deps = [
        "sqlalchemy",
        "alembic",
        "psycopg2-binary",
    ]
    run_pip_install(db_deps, "Database")
    
    # Task Queue
    print(f"\n{Colors.BLUE}Step 3: Task Queue{Colors.RESET}")
    queue_deps = [
        "celery",
        "redis",
    ]
    run_pip_install(queue_deps, "Task Queue")
    
    # Video Processing
    print(f"\n{Colors.BLUE}Step 4: Video Processing{Colors.RESET}")
    video_deps = [
        "moviepy",
        "imageio",
        "imageio-ffmpeg",
        "ffmpeg-python",
    ]
    run_pip_install(video_deps, "Video Processing")
    
    # Image Processing
    print(f"\n{Colors.BLUE}Step 5: Image Processing{Colors.RESET}")
    image_deps = [
        "pillow",
        "opencv-python",
    ]
    run_pip_install(image_deps, "Image Processing")
    
    # Audio Processing
    print(f"\n{Colors.BLUE}Step 6: Audio Processing{Colors.RESET}")
    audio_deps = [
        "soundfile",
        "librosa",
        "scipy",
    ]
    run_pip_install(audio_deps, "Audio Processing")
    
    # Utilities
    print(f"\n{Colors.BLUE}Step 7: Utilities{Colors.RESET}")
    util_deps = [
        "python-multipart",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-dotenv",
        "httpx",
        "aiofiles",
        "websockets",
        "huggingface-hub",
        "tqdm",
        "requests",
        "prometheus-client",
    ]
    run_pip_install(util_deps, "Utilities")
    
    # AI/ML Libraries (optional, large downloads)
    print(f"\n{Colors.BLUE}Step 8: AI/ML Libraries (Optional - Large Downloads){Colors.RESET}")
    print(f"{Colors.YELLOW}These are large packages and may take a while...{Colors.RESET}")
    
    response = input(f"\nInstall AI/ML libraries now? (y/n): ").lower()
    
    if response == 'y':
        # PyTorch (CPU version for now)
        print(f"\n{Colors.BLUE}Installing PyTorch (CPU version)...{Colors.RESET}")
        print(f"{Colors.YELLOW}For GPU support, install manually with CUDA version{Colors.RESET}")
        torch_deps = [
            "torch",
            "torchvision",
            "--index-url",
            "https://download.pytorch.org/whl/cpu"
        ]
        run_pip_install(torch_deps, "PyTorch (CPU)")
        
        # AI Model Libraries
        ai_deps = [
            "diffusers",
            "transformers",
            "accelerate",
            "safetensors",
            "omegaconf",
        ]
        run_pip_install(ai_deps, "AI Model Libraries")
        
        # TTS
        tts_deps = ["TTS"]
        run_pip_install(tts_deps, "Text-to-Speech")
    else:
        print(f"{Colors.YELLOW}Skipping AI/ML libraries. Install later with:{Colors.RESET}")
        print(f"  pip install torch torchvision diffusers transformers TTS")
    
    # Summary
    print(f"\n{Colors.BOLD}{'='*60}")
    print("Installation Complete!")
    print(f"{'='*60}{Colors.RESET}\n")
    
    print(f"{Colors.GREEN}✓ Core dependencies installed{Colors.RESET}")
    print(f"\n{Colors.BLUE}Next steps:{Colors.RESET}")
    print(f"  1. Run diagnostics: python diagnose.py")
    print(f"  2. Run tests: python test_basic.py")
    print(f"  3. Start server: python start_server.py")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Installation interrupted by user{Colors.RESET}")
    except Exception as e:
        print(f"\n{Colors.RED}Installation error: {e}{Colors.RESET}")
