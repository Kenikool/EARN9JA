@echo off
echo ========================================
echo Testing E-Commerce API Endpoints
echo ========================================
echo.

set BASE_URL=http://localhost:8081

echo [1] Testing Health Check...
curl -s %BASE_URL%/health
echo.
echo.

echo [2] Testing User Registration...
curl -s -X POST %BASE_URL%/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo [3] Testing User Login...
curl -s -X POST %BASE_URL%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo [4] Testing Get Categories...
curl -s %BASE_URL%/api/categories
echo.
echo.

echo [5] Testing Get Products...
curl -s %BASE_URL%/api/products
echo.
echo.

echo ========================================
echo Tests Complete!
echo ========================================
pause
