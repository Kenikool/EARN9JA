#!/bin/bash
# Pre-Deployment Checklist

echo "🔍 Pre-Deployment Checklist"
echo "============================"
echo ""

checks_passed=0
checks_failed=0

# Check 1: Node.js version
echo -n "1. Node.js version (>=18)... "
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -ge 18 ]; then
    echo "✅ PASS (v$(node -v))"
    ((checks_passed++))
else
    echo "❌ FAIL (v$(node -v))"
    ((checks_failed++))
fi

# Check 2: Dependencies installed
echo -n "2. Server dependencies... "
if [ -d "../server/node_modules" ]; then
    echo "✅ PASS"
    ((checks_passed++))
else
    echo "❌ FAIL (run: npm install)"
    ((checks_failed++))
fi

echo -n "3. Client dependencies... "
if [ -d "../client/node_modules" ]; then
    echo "✅ PASS"
    ((checks_passed++))
else
    echo "❌ FAIL (run: npm install)"
    ((checks_failed++))
fi

# Check 3: Environment variables
echo -n "4. Production .env file... "
if [ -f "../server/.env.production" ]; then
    echo "✅ PASS"
    ((checks_passed++))
else
    echo "❌ FAIL (copy from .env.production.example)"
    ((checks_failed++))
fi

# Check 4: Build directory
echo -n "5. Frontend build... "
if [ -d "../client/dist" ]; then
    echo "✅ PASS"
    ((checks_passed++))
else
    echo "⚠️  WARN (run: npm run build)"
fi

# Check 5: Git status
echo -n "6. Git repository clean... "
if git diff-index --quiet HEAD --; then
    echo "✅ PASS"
    ((checks_passed++))
else
    echo "⚠️  WARN (uncommitted changes)"
fi

# Check 6: Tests
echo -n "7. Running tests... "
cd ../server
if node tests/production-ready-test.js > /dev/null 2>&1; then
    echo "✅ PASS"
    ((checks_passed++))
else
    echo "❌ FAIL"
    ((checks_failed++))
fi
cd ../deployment

echo ""
echo "Results: $checks_passed passed, $checks_failed failed"
echo ""

if [ $checks_failed -eq 0 ]; then
    echo "🎉 Ready for deployment!"
    exit 0
else
    echo "❌ Fix issues before deploying"
    exit 1
fi
