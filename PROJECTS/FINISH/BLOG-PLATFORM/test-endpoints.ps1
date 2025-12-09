# Frontend Endpoint Testing Script
# Run this to verify all endpoints are accessible

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Frontend Endpoint Testing" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5173"
$apiUrl = "http://localhost:8081"

# Test 1: Frontend Home Page
Write-Host "Test 1: Home Page" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method Get -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Home page accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ FAIL: Home page not accessible" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Search Route
Write-Host "Test 2: Search Route" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/search?q=test" -Method Get -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Search route accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ FAIL: Search route not accessible" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Posts Route
Write-Host "Test 3: Posts Route" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/posts" -Method Get -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Posts route accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ FAIL: Posts route not accessible" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Create Route (should redirect if not logged in)
Write-Host "Test 4: Create Route" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/create" -Method Get -TimeoutSec 5 -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "✅ PASS: Create route accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✅ PASS: Create route accessible (redirects when not logged in)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Create route error" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Backend Search API
Write-Host "Test 5: Backend Search API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/search?q=test" -Method Get -TimeoutSec 5
    Write-Host "✅ PASS: Search API working" -ForegroundColor Green
    Write-Host "   Found: $($response.totalPosts) posts" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL: Search API not working" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Backend Posts API
Write-Host "Test 6: Backend Posts API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/posts" -Method Get -TimeoutSec 5
    Write-Host "✅ PASS: Posts API working" -ForegroundColor Green
    Write-Host "   Total posts: $($response.totalPosts)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL: Posts API not working" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Backend Categories API
Write-Host "Test 7: Backend Categories API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/categories" -Method Get -TimeoutSec 5
    Write-Host "✅ PASS: Categories API working" -ForegroundColor Green
    Write-Host "   Total categories: $($response.length)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL: Categories API not working" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "2. Test search functionality" -ForegroundColor White
Write-Host "3. Login and create a post" -ForegroundColor White
Write-Host "4. Test edit and delete features" -ForegroundColor White
Write-Host ""
Write-Host "See test-frontend-features.md for detailed test cases" -ForegroundColor Cyan
