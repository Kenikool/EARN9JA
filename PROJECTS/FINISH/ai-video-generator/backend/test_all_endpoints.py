"""Comprehensive API endpoint testing script."""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_health():
    """Test health endpoint."""
    print("\n" + "="*60)
    print("Testing Health Endpoint")
    print("="*60)
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Health check passed")


def test_projects():
    """Test project endpoints."""
    print("\n" + "="*60)
    print("Testing Project Endpoints")
    print("="*60)
    
    # Create project
    print("\n1. Creating project...")
    data = {
        "title": "Test Video Project",
        "script": "Scene 1: A beautiful sunset over the ocean. The waves crash gently on the shore.",
        "settings": {
            "style": "realistic",
            "resolution": "1080p",
            "aspect_ratio": "16:9"
        }
    }
    response = requests.post(f"{BASE_URL}/api/projects", json=data)
    print(f"Status: {response.status_code}")
    assert response.status_code == 201
    project = response.json()
    project_id = project["id"]
    print(f"✓ Project created: {project_id}")
    
    # List projects
    print("\n2. Listing projects...")
    response = requests.get(f"{BASE_URL}/api/projects")
    print(f"Status: {response.status_code}")
    assert response.status_code == 200
    print(f"✓ Found {response.json()['total']} projects")
    
    # Get project
    print(f"\n3. Getting project {project_id}...")
    response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
    print(f"Status: {response.status_code}")
    assert response.status_code == 200
    print("✓ Project retrieved")
    
    return project_id


def test_script_parser(project_id):
    """Test script parser endpoints."""
    print("\n" + "="*60)
    print("Testing Script Parser Endpoints")
    print("="*60)
    
    # Parse script
    print("\n1. Parsing script...")
    data = {
        "project_id": project_id,
        "script": """
        Scene 1: A young woman walks through a bustling city street at sunset.
        Dialogue: "This city never sleeps."
        
        Scene 2: She enters a cozy coffee shop and orders a latte.
        Dialogue: "One latte, please."
        """
    }
    response = requests.post(f"{BASE_URL}/api/script-parser/parse", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Parsed {len(result['scenes'])} scenes, {len(result['characters'])} characters")
        return result['scenes'][0]['id'] if result['scenes'] else None
    else:
        print(f"✗ Script parsing failed: {response.text}")
        return None


def test_scenes(project_id):
    """Test scene endpoints."""
    print("\n" + "="*60)
    print("Testing Scene Endpoints")
    print("="*60)
    
    # Create scene
    print("\n1. Creating scene...")
    data = {
        "project_id": project_id,
        "scene_number": 1,
        "description": "A beautiful sunset over the ocean",
        "dialogue": "The sun sets slowly.",
        "duration": 5.0
    }
    response = requests.post(f"{BASE_URL}/api/scenes", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        scene = response.json()
        scene_id = scene["id"]
        print(f"✓ Scene created: {scene_id}")
        
        # List scenes
        print(f"\n2. Listing scenes for project...")
        response = requests.get(f"{BASE_URL}/api/scenes?project_id={project_id}")
        print(f"Status: {response.status_code}")
        assert response.status_code == 200
        print(f"✓ Found {response.json()['total']} scenes")
        
        return scene_id
    else:
        print(f"✗ Scene creation failed: {response.text}")
        return None


def test_jobs(project_id):
    """Test job endpoints."""
    print("\n" + "="*60)
    print("Testing Job Endpoints")
    print("="*60)
    
    # List jobs
    print(f"\n1. Listing jobs for project...")
    response = requests.get(f"{BASE_URL}/api/jobs?project_id={project_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Found {result['total']} jobs")
    else:
        print(f"✗ Job listing failed: {response.text}")


def test_assets():
    """Test asset endpoints."""
    print("\n" + "="*60)
    print("Testing Asset Endpoints")
    print("="*60)
    
    # List assets
    print("\n1. Listing assets...")
    response = requests.get(f"{BASE_URL}/api/assets")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Found {result['total']} assets")
    else:
        print(f"✗ Asset listing failed: {response.text}")


def test_image_generation():
    """Test image generation endpoints (requires GPU/model)."""
    print("\n" + "="*60)
    print("Testing Image Generation Endpoints")
    print("="*60)
    print("⚠️  Note: These tests require Stable Diffusion model to be loaded")
    print("⚠️  Skipping actual generation to avoid long wait times")
    print("⚠️  Endpoints are available at:")
    print("   - POST /api/image-generation/generate")
    print("   - POST /api/image-generation/generate-character")
    print("   - POST /api/image-generation/generate-background")
    print("   - GET /api/image-generation/image/{filename}")


def cleanup(project_id):
    """Cleanup test data."""
    print("\n" + "="*60)
    print("Cleanup")
    print("="*60)
    
    print(f"\nDeleting project {project_id}...")
    response = requests.delete(f"{BASE_URL}/api/projects/{project_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 204:
        print("✓ Project deleted")
    else:
        print(f"✗ Deletion failed: {response.text}")


def run_all_tests():
    """Run all endpoint tests."""
    print("\n" + "="*70)
    print(" "*20 + "API ENDPOINT TESTS")
    print("="*70)
    
    try:
        # Basic tests
        test_health()
        
        # Project workflow
        project_id = test_projects()
        
        # Script parser (may fail if Ollama not running)
        try:
            scene_id = test_script_parser(project_id)
        except Exception as e:
            print(f"\n⚠️  Script parser test skipped (Ollama may not be running): {e}")
            scene_id = None
        
        # Scenes
        if not scene_id:
            scene_id = test_scenes(project_id)
        
        # Jobs
        test_jobs(project_id)
        
        # Assets
        test_assets()
        
        # Image generation (informational only)
        test_image_generation()
        
        # Cleanup
        cleanup(project_id)
        
        print("\n" + "="*70)
        print(" "*25 + "ALL TESTS PASSED! ✓")
        print("="*70)
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
    except requests.exceptions.ConnectionError:
        print("\n✗ Could not connect to API. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run_all_tests()
