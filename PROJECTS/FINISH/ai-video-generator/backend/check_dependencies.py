"""
Check Backend Dependencies

Verifies all required packages are installed and working.
"""

import sys
import importlib
from typing import List, Tuple

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def check_package(package_name: str, import_name: str = None) -> Tuple[bool, str]:
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        module = importlib.import_module(import_name)
        version = getattr(module, '__version__', 'unknown')
        return True, version
    except ImportError:
        return False, "not installed"

def main():
    print(f"\n{Colors.BOLD}{'='*60}")
    print("Checking Backend Dependencies")
    print(f"{'='*60}{Colors.RESET}\n")
    
    # Core dependencies
    dependencies = [
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("pydantic", "pydantic"),
        ("pydantic-settings", "pydantic_settings"),
        ("sqlalchemy", "sqlalchemy"),
        ("alembic", "alembic"),
        ("psycopg2-binary", "psycopg2"),
        ("celery", "celery"),
        ("redis", "redis"),
        ("torch", "torch"),
        ("torchvision", "torchvision"),
        ("diffusers", "diffusers"),
        ("transformers", "transformers"),
        ("accelerate", "accelerate"),
        ("safetensors", "safetensors"),
        ("omegaconf", "omegaconf"),
        ("pillow", "PIL"),
        ("opencv-python", "cv2"),
        ("imageio", "imageio"),
        ("imageio-ffmpeg", "imageio_ffmpeg"),
        ("moviepy", "moviepy"),
        ("ffmpeg-python", "ffmpeg"),
        ("soundfile", "soundfile"),
        ("librosa", "librosa"),
        ("scipy", "scipy"),
        ("TTS", "TTS"),  # Optional: Not compatible with Python 3.13+
        ("python-multipart", "multipart"),
        ("python-jose", "jose"),
        ("passlib", "passlib"),
        ("python-dotenv", "dotenv"),
        ("httpx", "httpx"),
        ("aiofiles", "aiofiles"),
        ("websockets", "websockets"),
        ("huggingface-hub", "huggingface_hub"),
        ("tqdm", "tqdm"),
        ("requests", "requests"),
        ("prometheus-client", "prometheus_client"),
    ]
    
    results = []
    for package_name, import_name in dependencies:
        installed, version = check_package(package_name, import_name)
        results.append((package_name, installed, version))
        
        if installed:
            print(f"{Colors.GREEN}✓{Colors.RESET} {package_name:.<40} {version}")
        else:
            print(f"{Colors.RED}✗{Colors.RESET} {package_name:.<40} {Colors.RED}NOT INSTALLED{Colors.RESET}")
    
    # Summary
    installed_count = sum(1 for _, installed, _ in results if installed)
    total_count = len(results)
    
    print(f"\n{Colors.BOLD}{'='*60}")
    print(f"Summary: {installed_count}/{total_count} packages installed")
    print(f"{'='*60}{Colors.RESET}\n")
    
    if installed_count == total_count:
        print(f"{Colors.GREEN}{Colors.BOLD}✓ All dependencies installed!{Colors.RESET}\n")
        return 0
    else:
        missing = [name for name, installed, _ in results if not installed]
        print(f"{Colors.RED}{Colors.BOLD}✗ Missing packages:{Colors.RESET}")
        for package in missing:
            print(f"  - {package}")
        print(f"\n{Colors.YELLOW}Install missing packages with:{Colors.RESET}")
        print(f"  pip install {' '.join(missing)}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
