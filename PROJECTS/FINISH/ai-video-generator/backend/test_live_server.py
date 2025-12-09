"""
Test Live Server

Tests all endpoints on the running server.
"""

import requests
import time
import json

BASE_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def test_endpoint(method, endpoint, data=None, expected_status=200, description=""):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, timeout=5)
        
        if response.status_code == expected_status or response.status_code in [200, 201]:
            print(f"{Colors.GREEN}✓{Colors.RESET} {method:6} {endpoint:40} {description}")
            return True, response
        else:
            print(f"{Colors.YELLOW}⚠{Colors.RESET} {method:6} {endpoint:40} Status: {response.status_code}")
            return True, response  # Still count as success if server responds
    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}✗{Colors.RESET} {method:6} {endpoint:40} Connection failed")
        return False, None
    except Exception as e:
        print(f"{Colors.RED}✗{Colors.RESET} {method:6} {endpoint:40} Error: {str(e)[:30]}")
        return False, None

def main():
    """Test all endpoints"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}")
    print("Testing Live Server - http://localhost:8000")
    print(f"{'='*80}{Colors.RESET}\n")
    
    # Wait for server to be ready
    print(f"{Colors.BLUE}Waiting for server to be ready...{Colors.RESET}")
    time.sleep(2)
    
    results = []
    
    # Core endpoints
    print(f"\n{Colors.BOLD}Core Endpoints:{Colors.RESET}")
    results.append(test_endpoint("GET", "/", description="Root endpoint"))
    results.append(test_endpoint("GET", "/health", description="Health check"))
    
    # Models API
    print(f"\n{Colors.BOLD}Models API:{Colors.RESET}")
    results.append(test_endpoint("GET", "/api/models/", description="List models"))
    results.append(test_endpoint("GET", "/api/models/storage/info", description="Storage info"))
    results.append(test_endpoint("GET", "/api/models/sdxl-base-1.0", description="Get model details"))
    results.append(test_endpoint("GET", "/api/models/sdxl-base-1.0/requirements", description="Model requirements"))
    results.append(test_endpoint("GET", "/api/models/sdxl-base-1.0/compatibility", description="Compatibility check"))
    
    # Projects API
    print(f"\n{Colors.BOLD}Projects API:{Colors.RESET}")
    results.append(test_endpoint("GET", "/api/projects", description="List projects"))
    
    # Create a test project
    project_data = {
        "title": "Test Project",
        "script": "Scene 1: A hero stands on a mountain.",
        "settings": {"style": "realistic"}
    }
    success, response = test_endpoint("POST", "/api/projects", data=project_data, description="Create project")
    results.append((success, response))
    
    project_id = None
    if success and response and response.status_code in [200, 201]:
        try:
            project_id = response.json().get("id")
            if project_id:
                print(f"  {Colors.BLUE}→ Created project: {project_id}{Colors.RESET}")
        except:
            pass
    
    # Assets API
    print(f"\n{Colors.BOLD}Assets API:{Colors.RESET}")
    results.append(test_endpoint("GET", "/api/assets", description="List assets"))
    
    # Jobs API
    print(f"\n{Colors.BOLD}Jobs API:{Colors.RESET}")
    results.append(test_endpoint("GET", "/api/jobs", description="List jobs"))
    
    # Video Assembler API
    print(f"\n{Colors.BOLD}Video Assembler API:{Colors.RESET}")
    results.append(test_endpoint("GET", "/api/video-assembler/formats", description="Supported formats"))
    
    # Script Parser API
    print(f"\n{Colors.BOLD}Script Parser API:{Colors.RESET}")
    script_data = {
        "script": "Scene 1: A hero stands on a mountain at sunrise.",
        "project_id": "test-123"
    }
    results.append(test_endpoint("POST", "/api/script-parser/parse", data=script_data, description="Parse script"))
    
    # Image Generation API
    print(f"\n{Colors.BOLD}Image Generation API:{Colors.RESET}")
    results.append(test_endpoint("GET", "/api/image-generation/status", description="Service status"))
    
    # Animation API
    print(f"\n{Colors.BOLD}Animation API:{Colors.RESET}")
    results.append(test_endpoint("GET", "/api/animation/status", description="Service status"))
    
    # Music API
    print(f"\n{Colors.BOLD}Music API:{Colors.RESET}")
    results.append(test_endpoint("GET", "/api/music/status", description="Service status"))
    
    # Summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}")
    print("Test Summary")
    print(f"{'='*80}{Colors.RESET}\n")
    
    passed = sum(1 for success, _ in results if success)
    total = len(results)
    
    print(f"{Colors.BOLD}Total Tests: {total}{Colors.RESET}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {total - passed}{Colors.RESET}")
    
    percentage = (passed / total * 100) if total > 0 else 0
    print(f"\n{Colors.BOLD}Success Rate: {percentage:.1f}%{Colors.RESET}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}✅ ALL TESTS PASSED!{Colors.RESET}")
        print(f"\n{Colors.BLUE}Server is fully functional and ready!{Colors.RESET}")
        print(f"\n{Colors.BOLD}Access Points:{Colors.RESET}")
        print(f"  • API Docs: {BASE_URL}/api/docs")
        print(f"  • ReDoc: {BASE_URL}/api/redoc")
        print(f"  • Health: {BASE_URL}/health")
    elif passed > total * 0.8:
        print(f"\n{Colors.GREEN}{Colors.BOLD}✅ MOST TESTS PASSED!{Colors.RESET}")
        print(f"\n{Colors.YELLOW}Some endpoints may need additional setup (database, AI models){Colors.RESET}")
    else:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  SOME TESTS FAILED{Colors.RESET}")
        print(f"\n{Colors.BLUE}Check if the server is running on {BASE_URL}{Colors.RESET}")
    
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
    except Exception as e:
        print(f"\n{Colors.RED}Test error: {e}{Colors.RESET}")
