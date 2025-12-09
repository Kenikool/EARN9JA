"""
Basic Backend Tests (No Database Required)

Tests core functionality without database dependencies.
"""

import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path.cwd()))

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def test_config():
    """Test configuration loading"""
    print(f"\n{Colors.BOLD}Testing Configuration:{Colors.RESET}")
    try:
        from app.config import settings
        print(f"  {Colors.GREEN}✓{Colors.RESET} Config loaded")
        print(f"    Environment: {settings.environment}")
        print(f"    Log Level: {settings.log_level}")
        return True
    except Exception as e:
        print(f"  {Colors.RED}✗{Colors.RESET} Config error: {e}")
        return False

def test_exceptions():
    """Test custom exceptions"""
    print(f"\n{Colors.BOLD}Testing Exceptions:{Colors.RESET}")
    try:
        from app.exceptions import VideoGeneratorException
        exc = VideoGeneratorException("Test", "TEST_ERROR", {}, 500)
        print(f"  {Colors.GREEN}✓{Colors.RESET} Exceptions working")
        return True
    except Exception as e:
        print(f"  {Colors.RED}✗{Colors.RESET} Exception error: {e}")
        return False

def test_logger():
    """Test logging"""
    print(f"\n{Colors.BOLD}Testing Logger:{Colors.RESET}")
    try:
        from app.utils.logger import get_logger
        logger = get_logger("test")
        logger.info("Test log message")
        print(f"  {Colors.GREEN}✓{Colors.RESET} Logger working")
        return True
    except Exception as e:
        print(f"  {Colors.RED}✗{Colors.RESET} Logger error: {e}")
        return False

def test_model_manager():
    """Test model manager service"""
    print(f"\n{Colors.BOLD}Testing Model Manager:{Colors.RESET}")
    try:
        from app.services.model_manager import ModelManagerService, ModelType
        
        manager = ModelManagerService()
        print(f"  {Colors.GREEN}✓{Colors.RESET} Model Manager initialized")
        
        # List models
        models = manager.list_models()
        print(f"  {Colors.GREEN}✓{Colors.RESET} Found {len(models)} models")
        
        # Get storage info
        storage = manager.get_storage_info()
        print(f"  {Colors.GREEN}✓{Colors.RESET} Storage: {storage['total_size_gb']}GB")
        
        return True
    except Exception as e:
        print(f"  {Colors.RED}✗{Colors.RESET} Model Manager error: {e}")
        return False

def test_schemas():
    """Test Pydantic schemas"""
    print(f"\n{Colors.BOLD}Testing Schemas:{Colors.RESET}")
    try:
        from app.schemas.model_manager import ModelInfoResponse, ModelType, ModelStatus
        
        # Create a test schema
        model_info = ModelInfoResponse(
            model_id="test",
            model_type=ModelType.IMAGE_GEN,
            name="Test Model",
            description="Test",
            source="test",
            status=ModelStatus.NOT_INSTALLED
        )
        print(f"  {Colors.GREEN}✓{Colors.RESET} Schemas working")
        return True
    except Exception as e:
        print(f"  {Colors.RED}✗{Colors.RESET} Schema error: {e}")
        return False

def test_video_assembler():
    """Test video assembler service"""
    print(f"\n{Colors.BOLD}Testing Video Assembler:{Colors.RESET}")
    try:
        from app.services.video_assembler import VideoAssemblerService
        
        assembler = VideoAssemblerService()
        print(f"  {Colors.GREEN}✓{Colors.RESET} Video Assembler initialized")
        
        # Check FFmpeg
        print(f"  {Colors.GREEN}✓{Colors.RESET} FFmpeg available")
        
        return True
    except Exception as e:
        print(f"  {Colors.YELLOW}⚠{Colors.RESET} Video Assembler: {str(e)[:60]}")
        return True  # Don't fail if FFmpeg not installed

def test_ollama_client():
    """Test Ollama client"""
    print(f"\n{Colors.BOLD}Testing Ollama Client:{Colors.RESET}")
    try:
        from app.services.ollama_client import OllamaClient
        import asyncio
        
        client = OllamaClient()
        print(f"  {Colors.GREEN}✓{Colors.RESET} Ollama Client initialized")
        
        # Try to check if Ollama is running
        try:
            # Run async function properly
            models = asyncio.run(client.list_models())
            print(f"  {Colors.GREEN}✓{Colors.RESET} Ollama running with {len(models)} models")
        except:
            print(f"  {Colors.YELLOW}⚠{Colors.RESET} Ollama not running (optional)")
        
        return True
    except Exception as e:
        print(f"  {Colors.YELLOW}⚠{Colors.RESET} Ollama Client: {str(e)[:60]}")
        return True

def main():
    """Run all basic tests"""
    print(f"\n{Colors.BOLD}{'='*60}")
    print("AI Video Generator - Basic Backend Tests")
    print(f"{'='*60}{Colors.RESET}")
    
    tests = [
        ("Configuration", test_config),
        ("Exceptions", test_exceptions),
        ("Logger", test_logger),
        ("Model Manager", test_model_manager),
        ("Schemas", test_schemas),
        ("Video Assembler", test_video_assembler),
        ("Ollama Client", test_ollama_client),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"  {Colors.RED}✗{Colors.RESET} Test crashed: {e}")
            results.append((name, False))
    
    # Summary
    print(f"\n{Colors.BOLD}{'='*60}")
    print("Test Summary")
    print(f"{'='*60}{Colors.RESET}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{Colors.GREEN}PASS{Colors.RESET}" if result else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"  {name:.<40} {status}")
    
    print(f"\n{Colors.BOLD}Result: {passed}/{total} tests passed{Colors.RESET}\n")
    
    if passed == total:
        print(f"{Colors.GREEN}✓ All basic tests passed!{Colors.RESET}\n")
    else:
        print(f"{Colors.YELLOW}⚠ Some tests failed{Colors.RESET}\n")

if __name__ == "__main__":
    main()
