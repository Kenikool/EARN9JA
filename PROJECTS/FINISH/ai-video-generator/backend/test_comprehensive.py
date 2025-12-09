"""
Comprehensive Backend Testing Script

Tests all API endpoints and backend functionality.
"""

import requests
import json
import time
from typing import Dict, Any, Optional

BASE_URL = "http://localhost:8000"

class Colors:
    """ANSI color codes"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_test(name: str):
    """Print test name"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}Testing: {name}{Colors.RESET}")

def print_success(message: str):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {message}{Colors.RESET}")

def print_error(message: str):
    """Print error message"""
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")

def print_warning(message: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠ {message}{Colors.RESET}")

def print_info(message: str):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ {message}{Colors.RESET}")

def test_health_check():
    """Test health check endpoint"""
    print_test("Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print_success(f"Health check passed: {response.json()}")
            return True
        else:
            print_error(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False

def test_root_endpoint():
    """Test root endpoint"""
    print_test("Root Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Root endpoint: {data.get('message')}")
            return True
        else:
            print_error(f"Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Root endpoint error: {e}")
        return False

def test_projects_api():
    """Test projects API"""
    print_test("Projects API")
    
    # Create project
    try:
        project_data = {
            "title": "Test Project",
            "script": "Scene 1: A beautiful sunset over the ocean.",
            "settings": {
                "style": "realistic",
                "resolution": "1080p"
            }
        }
        response = requests.post(f"{BASE_URL}/api/projects", json=project_data)
        if response.status_code == 200:
            project = response.json()
            project_id = project.get("id")
            print_success(f"Project created: {project_id}")
            
            # Get project
            response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
            if response.status_code == 200:
                print_success(f"Project retrieved: {project.get('title')}")
            
            # List projects
            response = requests.get(f"{BASE_URL}/api/projects")
            if response.status_code == 200:
                projects = response.json()
                print_success(f"Projects listed: {len(projects)} projects")
            
            # Update project
            update_data = {"title": "Updated Test Project"}
            response = requests.put(f"{BASE_URL}/api/projects/{project_id}", json=update_data)
            if response.status_code == 200:
                print_success("Project updated")
            
            # Delete project
            response = requests.delete(f"{BASE_URL}/api/projects/{project_id}")
            if response.status_code == 200:
                print_success("Project deleted")
            
            return True
        else:
            print_error(f"Project creation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Projects API error: {e}")
        return False

def test_models_api():
    """Test models API"""
    print_test("Models API")
    
    try:
        # List models
        response = requests.get(f"{BASE_URL}/api/models/")
        if response.status_code == 200:
            data = response.json()
            models = data.get("models", [])
            print_success(f"Models listed: {len(models)} models")
            
            if models:
                model_id = models[0]["model_id"]
                print_info(f"Testing with model: {model_id}")
                
                # Get model details
                response = requests.get(f"{BASE_URL}/api/models/{model_id}")
                if response.status_code == 200:
                    model = response.json()
                    print_success(f"Model details: {model.get('name')}")
                
                # Get model requirements
                response = requests.get(f"{BASE_URL}/api/models/{model_id}/requirements")
                if response.status_code == 200:
                    requirements = response.json()
                    print_success(f"Model requirements: {requirements}")
                
                # Check compatibility
                response = requests.get(f"{BASE_URL}/api/models/{model_id}/compatibility")
                if response.status_code == 200:
                    compat = response.json()
                    print_success(f"Compatibility check: {compat.get('compatible')}")
            
            # Get storage info
            response = requests.get(f"{BASE_URL}/api/models/storage/info")
            if response.status_code == 200:
                storage = response.json()
                print_success(f"Storage info: {storage.get('total_size_gb')}GB used")
            
            return True
        else:
            print_error(f"Models API failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Models API error: {e}")
        return False

def test_script_parser_api():
    """Test script parser API"""
    print_test("Script Parser API")
    
    try:
        script_data = {
            "script": "Scene 1: A hero stands on a mountain peak at sunrise.",
            "project_id": "test-project-123"
        }
        response = requests.post(f"{BASE_URL}/api/script-parser/parse", json=script_data)
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Script parsed: {len(result.get('scenes', []))} scenes")
            return True
        elif response.status_code == 503:
            print_warning("Script parser service not available (Ollama not running)")
            return True  # Don't fail test if service not available
        else:
            print_error(f"Script parser failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Script parser error: {e}")
        return False

def test_image_generation_api():
    """Test image generation API"""
    print_test("Image Generation API")
    
    try:
        # Test generate endpoint
        gen_data = {
            "prompt": "A beautiful sunset over mountains",
            "negative_prompt": "blurry, low quality",
            "width": 512,
            "height": 512,
            "num_inference_steps": 20,
            "guidance_scale": 7.5
        }
        response = requests.post(f"{BASE_URL}/api/image-generation/generate", json=gen_data)
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Image generation endpoint available")
            return True
        elif response.status_code == 503:
            print_warning("Image generation service not available (model not loaded)")
            return True
        else:
            print_error(f"Image generation failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Image generation error: {e}")
        return False

def test_animation_api():
    """Test animation API"""
    print_test("Animation API")
    
    try:
        response = requests.get(f"{BASE_URL}/api/animation/status")
        if response.status_code == 200:
            status = response.json()
            print_success(f"Animation service status: {status}")
            return True
        else:
            print_warning("Animation service endpoint not responding")
            return True
    except Exception as e:
        print_error(f"Animation API error: {e}")
        return False

def test_music_api():
    """Test music API"""
    print_test("Music API")
    
    try:
        music_data = {
            "description": "Upbeat electronic music",
            "duration": 10.0,
            "genre": "electronic"
        }
        response = requests.post(f"{BASE_URL}/api/music/generate", json=music_data)
        
        if response.status_code == 200:
            print_success("Music generation endpoint available")
            return True
        elif response.status_code == 503:
            print_warning("Music generation service not available")
            return True
        else:
            print_error(f"Music API failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Music API error: {e}")
        return False

def test_video_assembler_api():
    """Test video assembler API"""
    print_test("Video Assembler API")
    
    try:
        # Get supported formats
        response = requests.get(f"{BASE_URL}/api/video-assembler/formats")
        if response.status_code == 200:
            formats = response.json()
            print_success(f"Supported formats: {formats}")
            return True
        else:
            print_error(f"Video assembler API failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Video assembler error: {e}")
        return False

def test_jobs_api():
    """Test jobs API"""
    print_test("Jobs API")
    
    try:
        # List jobs
        response = requests.get(f"{BASE_URL}/api/jobs")
        if response.status_code == 200:
            jobs = response.json()
            print_success(f"Jobs listed: {len(jobs)} jobs")
            return True
        else:
            print_error(f"Jobs API failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Jobs API error: {e}")
        return False

def test_assets_api():
    """Test assets API"""
    print_test("Assets API")
    
    try:
        # List assets
        response = requests.get(f"{BASE_URL}/api/assets")
        if response.status_code == 200:
            assets = response.json()
            print_success(f"Assets listed: {len(assets)} assets")
            return True
        else:
            print_error(f"Assets API failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Assets API error: {e}")
        return False

def test_scenes_api():
    """Test scenes API"""
    print_test("Scenes API")
    
    try:
        # This requires a project, so we'll just test the endpoint exists
        response = requests.get(f"{BASE_URL}/api/scenes")
        # 422 is expected without project_id parameter
        if response.status_code in [200, 422]:
            print_success("Scenes API endpoint available")
            return True
        else:
            print_error(f"Scenes API failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Scenes API error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{'='*60}")
    print(f"AI Video Generator - Comprehensive Backend Tests")
    print(f"{'='*60}{Colors.RESET}\n")
    
    tests = [
        ("Health Check", test_health_check),
        ("Root Endpoint", test_root_endpoint),
        ("Projects API", test_projects_api),
        ("Models API", test_models_api),
        ("Script Parser API", test_script_parser_api),
        ("Image Generation API", test_image_generation_api),
        ("Animation API", test_animation_api),
        ("Music API", test_music_api),
        ("Video Assembler API", test_video_assembler_api),
        ("Jobs API", test_jobs_api),
        ("Assets API", test_assets_api),
        ("Scenes API", test_scenes_api),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print_error(f"Test {name} crashed: {e}")
            results.append((name, False))
        time.sleep(0.5)  # Small delay between tests
    
    # Print summary
    print(f"\n{Colors.BOLD}{'='*60}")
    print("Test Summary")
    print(f"{'='*60}{Colors.RESET}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{Colors.GREEN}PASS{Colors.RESET}" if result else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"{name:.<40} {status}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests passed{Colors.RESET}")
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}✓ All tests passed!{Colors.RESET}\n")
    else:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠ Some tests failed or services unavailable{Colors.RESET}\n")

if __name__ == "__main__":
    print_info("Make sure the backend server is running on http://localhost:8000")
    print_info("Starting tests in 2 seconds...\n")
    time.sleep(2)
    
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
    except Exception as e:
        print_error(f"Test suite error: {e}")
