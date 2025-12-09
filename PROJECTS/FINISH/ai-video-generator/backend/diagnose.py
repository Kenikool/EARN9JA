"""
Backend Diagnostics

Checks all backend components and reports status.
"""

import os
import sys
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"\n{Colors.BOLD}Python Version:{Colors.RESET}")
    print(f"  Version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 11:
        print(f"  {Colors.GREEN}✓ Python version OK{Colors.RESET}")
        return True
    else:
        print(f"  {Colors.YELLOW}⚠ Python 3.11+ recommended{Colors.RESET}")
        return True

def check_file_structure():
    """Check if all required files exist"""
    print(f"\n{Colors.BOLD}File Structure:{Colors.RESET}")
    
    required_files = [
        "app/__init__.py",
        "app/main.py",
        "app/config.py",
        "app/database.py",
        "app/exceptions.py",
        "requirements.txt",
        ".env.example",
    ]
    
    all_exist = True
    for file_path in required_files:
        exists = Path(file_path).exists()
        status = f"{Colors.GREEN}✓{Colors.RESET}" if exists else f"{Colors.RED}✗{Colors.RESET}"
        print(f"  {status} {file_path}")
        if not exists:
            all_exist = False
    
    return all_exist

def check_imports():
    """Check if core modules can be imported"""
    print(f"\n{Colors.BOLD}Core Modules:{Colors.RESET}")
    
    modules = [
        ("FastAPI", "fastapi"),
        ("Pydantic", "pydantic"),
        ("SQLAlchemy", "sqlalchemy"),
        ("Celery", "celery"),
        ("Redis", "redis"),
    ]
    
    all_ok = True
    for name, module in modules:
        try:
            __import__(module)
            print(f"  {Colors.GREEN}✓{Colors.RESET} {name}")
        except ImportError:
            print(f"  {Colors.RED}✗{Colors.RESET} {name} (not installed)")
            all_ok = False
    
    return all_ok

def check_app_modules():
    """Check if app modules can be imported"""
    print(f"\n{Colors.BOLD}Application Modules:{Colors.RESET}")
    
    # Add app to path
    sys.path.insert(0, str(Path.cwd()))
    
    modules = [
        ("Main App", "app.main"),
        ("Config", "app.config"),
        ("Database", "app.database"),
        ("Exceptions", "app.exceptions"),
        ("Models", "app.models"),
        ("Schemas", "app.schemas"),
        ("Services", "app.services"),
        ("API", "app.api"),
    ]
    
    all_ok = True
    for name, module in modules:
        try:
            __import__(module)
            print(f"  {Colors.GREEN}✓{Colors.RESET} {name}")
        except Exception as e:
            print(f"  {Colors.RED}✗{Colors.RESET} {name}: {str(e)[:50]}")
            all_ok = False
    
    return all_ok

def check_services():
    """Check if services can be initialized"""
    print(f"\n{Colors.BOLD}Services:{Colors.RESET}")
    
    sys.path.insert(0, str(Path.cwd()))
    
    services = [
        ("Model Manager", "app.services.model_manager", "ModelManagerService"),
        ("Script Parser", "app.services.script_parser", "ScriptParserService"),
        ("Image Generator", "app.services.image_generator", "ImageGeneratorService"),
        ("Animation Engine", "app.services.animation_engine", "AnimationEngineService"),
        ("Voice Synthesizer", "app.services.voice_synthesizer", "VoiceSynthesizerService"),
        ("Music Generator", "app.services.music_generator", "MusicGeneratorService"),
        ("Lip Sync Engine", "app.services.lip_sync_engine", "LipSyncEngineService"),
        ("Video Assembler", "app.services.video_assembler", "VideoAssemblerService"),
    ]
    
    for name, module_path, class_name in services:
        try:
            module = __import__(module_path, fromlist=[class_name])
            service_class = getattr(module, class_name)
            print(f"  {Colors.GREEN}✓{Colors.RESET} {name}")
        except Exception as e:
            print(f"  {Colors.YELLOW}⚠{Colors.RESET} {name}: {str(e)[:50]}")
    
    return True

def check_api_routes():
    """Check if API routes are defined"""
    print(f"\n{Colors.BOLD}API Routes:{Colors.RESET}")
    
    sys.path.insert(0, str(Path.cwd()))
    
    try:
        from app.main import app
        routes = [route.path for route in app.routes]
        
        expected_prefixes = [
            "/api/projects",
            "/api/scenes",
            "/api/assets",
            "/api/jobs",
            "/api/models",
            "/api/script-parser",
            "/api/image-generation",
            "/api/animation",
            "/api/music",
            "/api/video-assembler",
        ]
        
        for prefix in expected_prefixes:
            has_route = any(route.startswith(prefix) for route in routes)
            status = f"{Colors.GREEN}✓{Colors.RESET}" if has_route else f"{Colors.RED}✗{Colors.RESET}"
            print(f"  {status} {prefix}")
        
        print(f"\n  Total routes: {len(routes)}")
        return True
    except Exception as e:
        print(f"  {Colors.RED}✗{Colors.RESET} Could not load routes: {e}")
        return False

def main():
    """Run all diagnostics"""
    print(f"\n{Colors.BOLD}{'='*60}")
    print("AI Video Generator - Backend Diagnostics")
    print(f"{'='*60}{Colors.RESET}")
    
    results = []
    
    results.append(("Python Version", check_python_version()))
    results.append(("File Structure", check_file_structure()))
    results.append(("Core Modules", check_imports()))
    results.append(("Application Modules", check_app_modules()))
    results.append(("Services", check_services()))
    results.append(("API Routes", check_api_routes()))
    
    # Summary
    print(f"\n{Colors.BOLD}{'='*60}")
    print("Diagnostic Summary")
    print(f"{'='*60}{Colors.RESET}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{Colors.GREEN}PASS{Colors.RESET}" if result else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"  {name:.<40} {status}")
    
    print(f"\n{Colors.BOLD}Result: {passed}/{total} checks passed{Colors.RESET}\n")
    
    if passed == total:
        print(f"{Colors.GREEN}✓ Backend is ready to run!{Colors.RESET}")
        print(f"\nStart the server with:")
        print(f"  python start_server.py")
        print(f"\nOr directly with:")
        print(f"  uvicorn app.main:app --reload\n")
    else:
        print(f"{Colors.YELLOW}⚠ Some checks failed. Review the output above.{Colors.RESET}\n")

if __name__ == "__main__":
    main()
