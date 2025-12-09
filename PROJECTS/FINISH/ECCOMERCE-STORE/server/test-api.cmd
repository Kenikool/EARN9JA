@echo off
echo ========================================
echo Testing E-Commerce API Endpoints
echo ========================================
echo.

set BASE_URL=http://localhost:8081

echo [1/8] Testing Health Check...
curl -s %BASE_URL%/health
echo.
echo.

echo [2/8] Testing User Registration...
curl -s -X POST %BASE_URL%/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}" > temp_register.json
echo.
type temp_register.json
echo.
echo.

echo [3/8] Testing User Login...
curl -s -X POST %BASE_URL%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}" > temp_login.json
echo.
type temp_login.json
echo.
echo.

echo [4/8] Testing Get Categories (should be empty)...
curl -s %BASE_URL%/api/categories
echo.
echo.

echo [5/8] Testing Get Products (should be empty)...
curl -s %BASE_URL%/api/products
echo.
echo.

echo [6/8] Testing Featured Products (should be empty)...
curl -s %BASE_URL%/api/products/featured
echo.
echo.

echo [7/8] Testing Invalid Route (404)...
curl -s %BASE_URL%/api/invalid-route
echo.
echo.

echo [8/8] Testing Protected Route Without Token (401)...
curl -s %BASE_URL%/api/auth/me
echo.
echo.

echo ========================================
echo Tests Complete!
echo ========================================
echo.
echo Note: Save the accessToken from login response to test protected routes
echo.

del temp_register.json temp_login.json 2>nul

pause
