"""
Simple Video Generation Test (No Database Required)

Tests basic functionality without requiring PostgreSQL.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test server health"""
    print("\n" + "="*60)
    print("Testing Server Health")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_models_list():
    """Test listing available models"""
    print("\n" + "="*60)
    print("Testing Models List")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/models/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            print(f"\nAvailable Models: {len(models)}")
            for model in models:
                print(f"  - {model.get('name')} ({model.get('type')})")
                print(f"    Status: {'Active' if model.get('is_active') else 'Available'}")
                print(f"    Size: {model.get('size', 'Unknown')}")
            return True
        else:
            print(f"Error: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_storage_info():
    """Test storage information"""
    print("\n" + "="*60)
    print("Testing Storage Info")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/models/storage/info")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"\nStorage Information:")
            print(f"  Total Size: {data.get('total_size', 'N/A')}")
            print(f"  Models Count: {data.get('models_count', 0)}")
            print(f"  Available Space: {data.get('available_space', 'N/A')}")
            return True
        else:
            print(f"Error: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_video_formats():
    """Test supported video formats"""
    print("\n" + "="*60)
    print("Testing Video Formats")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/video-assembler/formats")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"\nSupported Formats:")
            print(f"  Resolutions: {data.get('resolutions', [])}")
            print(f"  Aspect Ratios: {data.get('aspect_ratios', [])}")
            print(f"  Codecs: {data.get('codecs', [])}")
            return True
        else:
            print(f"Error: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("  AI Video Generator - Simple Functionality Test")
    print("="*70)
    print("\nThis test checks basic API functionality without database.")
    
    results = []
    
    # Test 1: Health Check
    results.append(("Health Check", test_health()))
    
    # Test 2: Models List
    results.append(("Models List", test_models_list()))
    
    # Test 3: Storage Info
    results.append(("Storage Info", test_storage_info()))
    
    # Test 4: Video Formats
    results.append(("Video Formats", test_video_formats()))
    
    # Summary
    print("\n" + "="*70)
    print("Test Summary")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nResults: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n✅ All tests passed! Server is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    
    print("\n" + "="*70)
    print("Next Steps:")
    print("="*70)
    print("\n1. To generate videos, you need to download AI models:")
    print("   - Visit: http://localhost:8000/api/docs")
    print("   - Use POST /api/models/download endpoint")
    print("   - Example model: sdxl-turbo (fastest for testing)")
    
    print("\n2. For full functionality, set up PostgreSQL:")
    print("   - Install PostgreSQL")
    print("   - Update DATABASE_URL in .env file")
    print("   - Run: alembic upgrade head")
    
    print("\n3. For script parsing, install Ollama:")
    print("   - Download from: https://ollama.com")
    print("   - Run: ollama pull llama3:8b")
    
    print("\n" + "="*70)

if __name__ == "__main__":
    main()
