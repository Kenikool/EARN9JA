@echo off
echo ========================================
echo QUICK VERIFICATION - Third-Party Integration
echo ========================================
echo.

echo Checking if all critical files exist...
echo.

echo [1/10] Checking provider types...
if exist "src\types\provider.types.ts" (
    echo   [OK] provider.types.ts
) else (
    echo   [FAIL] provider.types.ts NOT FOUND
)

echo [2/10] Checking ExternalProvider model...
if exist "src\models\ExternalProvider.ts" (
    echo   [OK] ExternalProvider.ts
) else (
    echo   [FAIL] ExternalProvider.ts NOT FOUND
)

echo [3/10] Checking CurrencyConversionService...
if exist "src\services\CurrencyConversionService.ts" (
    echo   [OK] CurrencyConversionService.ts
) else (
    echo   [FAIL] CurrencyConversionService.ts NOT FOUND
)

echo [4/10] Checking PostbackWebhookService...
if exist "src\services\PostbackWebhookService.ts" (
    echo   [OK] PostbackWebhookService.ts
) else (
    echo   [FAIL] PostbackWebhookService.ts NOT FOUND
)

echo [5/10] Checking CPAGripProvider...
if exist "src\services\providers\CPAGripProvider.ts" (
    echo   [OK] CPAGripProvider.ts
) else (
    echo   [FAIL] CPAGripProvider.ts NOT FOUND
)

echo [6/10] Checking OGAdsProvider...
if exist "src\services\providers\OGAdsProvider.ts" (
    echo   [OK] OGAdsProvider.ts
) else (
    echo   [FAIL] OGAdsProvider.ts NOT FOUND
)

echo [7/10] Checking FraudPreventionService...
if exist "src\services\FraudPreventionService.ts" (
    echo   [OK] FraudPreventionService.ts
) else (
    echo   [FAIL] FraudPreventionService.ts NOT FOUND
)

echo [8/10] Checking OfferWallAnalyticsService...
if exist "src\services\OfferWallAnalyticsService.ts" (
    echo   [OK] OfferWallAnalyticsService.ts
) else (
    echo   [FAIL] OfferWallAnalyticsService.ts NOT FOUND
)

echo [9/10] Checking postback routes...
if exist "src\routes\postback.routes.ts" (
    echo   [OK] postback.routes.ts
) else (
    echo   [FAIL] postback.routes.ts NOT FOUND
)

echo [10/10] Checking provider routes...
if exist "src\routes\provider.routes.ts" (
    echo   [OK] provider.routes.ts
) else (
    echo   [FAIL] provider.routes.ts NOT FOUND
)

echo.
echo ========================================
echo VERIFICATION COMPLETE
echo ========================================
echo.
echo All critical backend files are present!
echo.
echo Next steps:
echo 1. Start MongoDB: mongod
echo 2. Start backend: npm run dev
echo 3. Seed providers: npm run seed:providers
echo 4. Test endpoints using TESTING_GUIDE.md
echo.
pause
