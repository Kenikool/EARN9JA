@echo off
echo ========================================
echo Offer Wall System Quick Test
echo ========================================
echo.

echo 1. Testing MongoDB Connection...
curl -s http://localhost:5000/health
echo.
echo.

echo 2. Seeding Providers...
call npm run seed:providers
echo.

echo 3. Testing Currency Conversion...
curl -s "http://localhost:5000/api/v1/currency/convert?amount=10&from=USD&to=NGN"
echo.
echo.

echo 4. Listing Providers...
curl -s http://localhost:5000/api/v1/providers
echo.
echo.

echo 5. Testing Postback (replace USER_ID)...
echo NOTE: Replace USER_ID in the command below with actual user ID
echo curl -X POST "http://localhost:5000/api/v1/postback/test" -H "Content-Type: application/json" -d "{\"userId\":\"USER_ID\",\"amount\":1.5}"
echo.

echo 6. Running System Test...
call npm run test:system
echo.

echo ========================================
echo Test Complete!
echo ========================================
pause
