"""Simple API test script."""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_health():
    """Test health endpoint."""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Health check passed\n")


def test_create_project():
    """Test creating a project."""
    print("Testing create project...")
    data = {
        "title": "Test Video Project",
        "script": "Scene 1: A beautiful sunset over the ocean.",
        "settings": {
            "style": "realistic",
            "resolution": "1080p",
            "aspect_ratio": "16:9"
        }
    }
    response = requests.post(f"{BASE_URL}/api/projects", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 201
    project_id = response.json()["id"]
    print(f"✓ Project created with ID: {project_id}\n")
    return project_id


def test_list_projects():
    """Test listing projects."""
    print("Testing list projects...")
    response = requests.get(f"{BASE_URL}/api/projects")
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Total projects: {result['total']}")
    assert response.status_code == 200
    print("✓ Projects listed successfully\n")


def test_get_project(project_id):
    """Test getting a specific project."""
    print(f"Testing get project {project_id}...")
    response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Project retrieved successfully\n")


def test_create_scene(project_id):
    """Test creating a scene."""
    print("Testing create scene...")
    data = {
        "project_id": project_id,
        "scene_number": 1,
        "description": "A beautiful sunset over the ocean",
        "dialogue": "The sun sets slowly over the horizon.",
        "duration": 5.0
    }
    response = requests.post(f"{BASE_URL}/api/scenes", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 201
    scene_id = response.json()["id"]
    print(f"✓ Scene created with ID: {scene_id}\n")
    return scene_id


def test_list_scenes(project_id):
    """Test listing scenes."""
    print(f"Testing list scenes for project {project_id}...")
    response = requests.get(f"{BASE_URL}/api/scenes?project_id={project_id}")
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Total scenes: {result['total']}")
    assert response.status_code == 200
    print("✓ Scenes listed successfully\n")


def test_update_project(project_id):
    """Test updating a project."""
    print(f"Testing update project {project_id}...")
    data = {
        "title": "Updated Test Video Project"
    }
    response = requests.put(f"{BASE_URL}/api/projects/{project_id}", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Project updated successfully\n")


def test_delete_scene(scene_id):
    """Test deleting a scene."""
    print(f"Testing delete scene {scene_id}...")
    response = requests.delete(f"{BASE_URL}/api/scenes/{scene_id}")
    print(f"Status: {response.status_code}")
    assert response.status_code == 204
    print("✓ Scene deleted successfully\n")


def test_delete_project(project_id):
    """Test deleting a project."""
    print(f"Testing delete project {project_id}...")
    response = requests.delete(f"{BASE_URL}/api/projects/{project_id}")
    print(f"Status: {response.status_code}")
    assert response.status_code == 204
    print("✓ Project deleted successfully\n")


def run_tests():
    """Run all tests."""
    print("=" * 60)
    print("Starting API Tests")
    print("=" * 60 + "\n")
    
    try:
        # Test health
        test_health()
        
        # Test project CRUD
        project_id = test_create_project()
        test_list_projects()
        test_get_project(project_id)
        test_update_project(project_id)
        
        # Test scene CRUD
        scene_id = test_create_scene(project_id)
        test_list_scenes(project_id)
        test_delete_scene(scene_id)
        
        # Cleanup
        test_delete_project(project_id)
        
        print("=" * 60)
        print("All tests passed! ✓")
        print("=" * 60)
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
    except requests.exceptions.ConnectionError:
        print("\n✗ Could not connect to API. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")


if __name__ == "__main__":
    run_tests()
