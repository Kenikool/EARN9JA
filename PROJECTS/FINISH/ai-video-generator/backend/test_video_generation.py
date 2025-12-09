"""
Test Video Generation

This script tests the complete video generation pipeline.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_image_generation():
    """Test image generation with Stable Diffusion"""
    print_section("Testing Image Generation")
    
    # Simple test without actual model (will fail gracefully)
    payload = {
        "prompt": "A beautiful sunset over mountains",
        "width": 512,
        "height": 512,
        "num_inference_steps": 20,
        "guidance_scale": 7.5
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/image-generation/generate",
            json=payload,
            timeout=60
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Image generated: {result.get('image_id')}")
            return result
        else:
            print(f"⚠ Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_simple_video_assembly():
    """Test simple video assembly without AI models"""
    print_section("Testing Simple Video Assembly")
    
    # Create a simple test video from static content
    payload = {
        "scenes": [
            {
                "duration": 3.0,
                "type": "text",
                "content": "Hello World",
                "background_color": "#000000",
                "text_color": "#FFFFFF"
            }
        ],
        "output_format": {
            "resolution": "720p",
            "fps": 30,
            "codec": "h264"
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/video-assembler/assemble",
            json=payload,
            timeout=60
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Video assembled: {result}")
            return result
        else:
            print(f"⚠ Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_project_creation():
    """Test creating a video project"""
    print_section("Testing Project Creation")
    
    payload = {
        "title": "Test Video Project",
        "script": "Scene 1: A hero stands on a mountain at sunrise. The wind blows through their hair as they look out over the valley below.",
        "settings": {
            "style": "realistic",
            "resolution": "720p",
            "aspect_ratio": "16:9",
            "fps": 30
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/projects",
            json=payload,
            timeout=30
        )
        print(f"Status: {response.status_code}")
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✓ Project created: {result.get('id')}")
            print(f"  Title: {result.get('title')}")
            print(f"  Status: {result.get('status')}")
            return result
        else:
            print(f"⚠ Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_script_parsing():
    """Test script parsing with Ollama"""
    print_section("Testing Script Parsing")
    
    payload = {
        "script": "Scene 1: A hero stands on a mountain at sunrise.\nScene 2: The hero walks down into the valley.",
        "extract_characters": True,
        "generate_descriptions": True
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/script-parser/parse",
            json=payload,
            timeout=60
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Script parsed successfully")
            print(f"  Scenes found: {len(result.get('scenes', []))}")
            print(f"  Characters: {result.get('characters', [])}")
            return result
        else:
            print(f"⚠ Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def check_models():
    """Check available models"""
    print_section("Checking Available Models")
    
    try:
        response = requests.get(f"{BASE_URL}/api/models/")
        if response.status_code == 200:
            result = response.json()
            models = result.get('models', [])
            print(f"Total models in registry: {len(models)}")
            for model in models:
                status = "✓ Active" if model.get('is_active') else "○ Available"
                print(f"  {status} {model.get('name')} ({model.get('type')})")
            return models
        else:
            print(f"⚠ Could not fetch models: {response.status_code}")
            return []
    except Exception as e:
        print(f"✗ Error: {e}")
        return []

def check_storage():
    """Check storage info"""
    print_section("Checking Storage")
    
    try:
        response = requests.get(f"{BASE_URL}/api/models/storage/info")
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Storage info retrieved")
            print(f"  Total size: {result.get('total_size', 'N/A')}")
            print(f"  Models count: {result.get('models_count', 0)}")
            return result
        else:
            print(f"⚠ Could not fetch storage info: {response.status_code}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def main():
    print("\n" + "="*60)
    print("  AI Video Generator - Video Generation Test")
    print("="*60)
    
    # Check server health
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("\n✓ Server is healthy and running")
        else:
            print("\n✗ Server health check failed")
            return
    except Exception as e:
        print(f"\n✗ Cannot connect to server: {e}")
        print(f"Make sure the server is running on {BASE_URL}")
        return
    
    # Run tests
    check_models()
    check_storage()
    
    print("\n" + "="*60)
    print("  Testing Core Features")
    print("="*60)
    
    # Test 1: Project Creation
    project = test_project_creation()
    
    # Test 2: Script Parsing (requires Ollama)
    test_script_parsing()
    
    # Test 3: Image Generation (requires model download)
    test_image_generation()
    
    # Test 4: Video Assembly
    test_simple_video_assembly()
    
    print("\n" + "="*60)
    print("  Test Summary")
    print("="*60)
    print("\n✓ Basic API tests completed")
    print("\nNote: Full video generation requires:")
    print("  1. AI models to be downloaded (use /api/models/download)")
    print("  2. Ollama running for script parsing")
    print("  3. Sufficient disk space and GPU/CPU resources")
    print("\nTo download a model:")
    print('  curl -X POST http://localhost:8000/api/models/download \\')
    print('    -H "Content-Type: application/json" \\')
    print('    -d \'{"model_id": "sdxl-turbo"}\'')
    print()

if __name__ == "__main__":
    main()
