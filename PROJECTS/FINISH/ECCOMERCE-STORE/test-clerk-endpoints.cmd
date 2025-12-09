@echo off
echo ========================================
echo CLERK INTEGRATION ENDPOINT TESTS
echo ========================================
echo.

echo Testing Health Check...
curl -X GET http://localhost:8000/health
echo.
echo.

echo Testing Clerk Status (requires auth)...
echo Note: This will fail without auth token - expected
curl -X GET http://localhost:8000/api/auth/clerk/status
echo.
echo.

echo Testing Clerk Webhook (will fail without Svix signature - expected)...
curl -X POST http://localhost:8000/api/auth/clerk/webhook -H "Content-Type: application/json" -d "{\"type\":\"user.created\",\"data\":{\"id\":\"test\"}}"
echo.
echo.

echo ========================================
echo TESTS COMPLETE
echo ========================================
echo.
echo Next Steps:
echo 1. Start frontend: cd client ^&^& npm run dev
echo 2. Test Google sign-in at http://localhost:5173
echo 3. Check MongoDB for synced user
echo.
pause
