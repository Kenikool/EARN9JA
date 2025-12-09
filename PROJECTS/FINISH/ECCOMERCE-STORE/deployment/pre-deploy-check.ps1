# Pre-Deployment Checklist (PowerShell)

Write-Host "🔍 Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$checksPassed = 0
$checksFailed = 0

# Check 1: Node.js version
Write-Host "1. Node.js version (>=18)... " -NoNewline
try {
    $nodeVersion = (node -v).Replace('v','').Split('.')[0]
    if ([int]$nodeVersion -ge 18) {
        Write-Host "✅ PASS" -ForegroundColor Green
        $checksPassed++
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
        $checksFailed++
    }
} catch {
    Write-Host "❌ FAIL (Node.js not found)" -ForegroundColor Red
    $checksFailed++
}

# Check 2: Dependencies
Write-Host "2. Server dependencies... " -NoNewline
if (Test-Path "../server/node_modules") {
    Write-Host "✅ PASS" -ForegroundColor Green
    $checksPassed++
} else {
    Write-Host "❌ FAIL" -ForegroundColor Red
    $checksFailed++
}

Write-Host "3. Client dependencies... " -NoNewline
if (Test-Path "../client/node_modules") {
    Write-Host "✅ PASS" -ForegroundColor Green
    $checksPassed++
} else {
    Write-Host "❌ FAIL" -ForegroundColor Red
    $checksFailed++
}

# Check 3: Environment file
Write-Host "4. Production .env file... " -NoNewline
if (Test-Path "../server/.env") {
    Write-Host "✅ PASS" -ForegroundColor Green
    $checksPassed++
} else {
    Write-Host "❌ FAIL" -ForegroundColor Red
    $checksFailed++
}

# Check 4: Frontend build
Write-Host "5. Frontend build... " -NoNewline
if (Test-Path "../client/dist") {
    Write-Host "✅ PASS" -ForegroundColor Green
    $checksPassed++
} else {
    Write-Host "⚠️  WARN (run: npm run build)" -ForegroundColor Yellow
}

# Check 5: Tests
Write-Host "6. Running tests... " -NoNewline
try {
    $testResult = node ../server/tests/production-ready-test.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PASS" -ForegroundColor Green
        $checksPassed++
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
        $checksFailed++
    }
} catch {
    Write-Host "❌ FAIL" -ForegroundColor Red
    $checksFailed++
}

Write-Host ""
Write-Host "Results: $checksPassed passed, $checksFailed failed"
Write-Host ""

if ($checksFailed -eq 0) {
    Write-Host "🎉 Ready for deployment!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Fix issues before deploying" -ForegroundColor Red
    exit 1
}
